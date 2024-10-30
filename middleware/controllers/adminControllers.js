import Web3 from 'web3';
import { web3_connection, aes_config, JWT_ADMIN_SECRET } from '../config/config.js';
import CryptoJS from 'crypto-js';
import contract from '../db/models/contractModel.js';
import jwt from 'jsonwebtoken';

const web3 = new Web3(web3_connection.web3_provider);
let adminInstance = null;

// retrieve contract details from database
contract.retrieve_contract('admin',(err, res)=>{
    if(err){
        console.log(err);
        throw new Error(err);
    } else{
        const contract_address = res['contract_address'];
        const contract_json = res['contract_json'];
        adminInstance = new web3.eth.Contract(
            contract_json,
            contract_address
        )
    }
})

// extract the private key from the .pem file that is sent
const extractPrivateKey = (pemContent) => {
    const privateKeyMatch = pemContent.match(/-----BEGIN PRIVATE KEY-----(.*?)-----END PRIVATE KEY-----/s);
    if (privateKeyMatch && privateKeyMatch[1]) {
        // Extract the key content, trim any leading/trailing whitespace or newlines
        // ensure the regex is fine
        return privateKeyMatch[1].replace(/[\r\n]+/g, '');
    }
    return null;
};


const adminControllers = {
    'verifyToken': (req, res, next) => {
        const token = req.header('Authorization');
        if (token) {
            jwt.verify(token, JWT_ADMIN_SECRET, async (err, decoded) => {
                if (err) {
                    if (err instanceof jwt.TokenExpiredError) {
                        return res.status(401).json({
                            message: 'Token has expired',
                        });
                    } else {
                        return res.status(401).json({
                            message: 'Token is not valid',
                        });
                    }
                } else {
                    try{
                        const admin_accounts = await web3.eth.getAccounts();
                        if(admin_accounts.indexOf(decoded['token']) === -1){
                            return res.status(401).json({'message': 'Unauthorized'});
                        }
                        req.account = decoded['token']
                        next();
                    } catch(err){
                        console.log(err);
                        return res.status(500).json({'message': 'Internal Server Error'});
                    }
                }
            });
        } else {
            return res.status(401).json({
                message: 'Token not supplied',
            });
        }
    },
    'login': async (req, res) => {
        const file = req.file;

        if (!file) {
            return res.status(400).json({ 'message': 'Missing .pem file' });
        }

        try {
            const encryptedFileContent = file.buffer.toString('utf-8');
            const decryptedContent = CryptoJS.AES.decrypt(encryptedFileContent, aes_config.key).toString(CryptoJS.enc.Utf8);
            const privateKey = extractPrivateKey(decryptedContent);

            if (!privateKey) {
                return res.status(400).json({ 'message': 'Invalid .pem file' });
            }

            const account = await web3.eth.accounts.privateKeyToAccount(privateKey);
            const admin_accounts = await web3.eth.getAccounts();

            if (admin_accounts.indexOf(account.address) !== -1) {
                const payload = {
                    token: account.address,
                };
                const token = jwt.sign(payload, JWT_ADMIN_SECRET, { expiresIn: '1h' });
                return res.status(200).json({
                    'message': "Authenticated",
                    "token": token
                });
            } else {
                return res.status(401).json({ 'message': 'Unauthorized' });
            }

        } catch (err) {
            console.log(err);
            return res.status(500).json({ 'message': 'Internal Server Error' });
        }
    },
    'regCandidate': async(req, res) => {

        const admin_account = req.account;
        const { candidate_name } = req.body;

        try{
            const voting_status = parseInt(await adminInstance.methods.getVotingStatus().call());
            if (voting_status == 0) {
                await adminInstance.methods.addCandidate(candidate_name).send({ from: admin_account, gas: web3_connection.gas_price });
                return res.status(201).json({ 'message': 'Created Successfully' });
            } else {
                return res.status(400).json({ 'message': 'Not possible' });
            }
        } catch (err) {
            console.log(err);
            return res.status(500).json({ 'message': 'Internal Server Error' });
        }
    },
    'setElection': async(req, res) => {

        const admin_account = req.account;
        const { status } = req.body;

        try{
            const voting_status = parseInt(await adminInstance.methods.getVotingStatus().call());
            if ((voting_status === 0 && status === 1) || (voting_status === 1 && status === 2)) {
                await adminInstance.methods.setVotingStatus(status).send({ from: admin_account, gas: web3_connection.gas_price });
                return res.status(204).json({});
            } else {
                return res.status(400).json({ 'message': 'Not possible' });
            }
        } catch (err) {
            console.log(err);
            return res.status(500).json({ 'message': 'Internal Server Error' });
        }
    },
    'getVotingStatistics': async (req, res) => {
        try {
            const statistics = await adminInstance.methods.getAllCandidatesVoteCount().call({ from: req.account });
            
            const processedStatistics = statistics.map((candidate,i) => ({
                id: parseInt(candidate.id),
                name: candidate.name,
                voteCount: parseInt(candidate.voteCount)
            }));
    
            res.status(200).json(processedStatistics);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error fetching voting statistics' });
        }
    }
}

export default adminControllers;
