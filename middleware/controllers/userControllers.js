import otpGenerator from 'otp-generator';
import { otp_config, twilio_config, web3_connection, email_config, JWT_USER_SECRET } from '../config/config.js';
import twilio_client from'twilio';
import Wallet from 'ethereumjs-wallet';
import bcrypt from 'bcrypt'
import otpQueries from '../db/models/otpModel.js';
import contract from '../db/models/contractModel.js';
import Web3 from 'web3';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

const tc = twilio_client(twilio_config.acc_ssid, twilio_config.auth_token);
const web3 = new Web3(web3_connection.web3_provider);

let userInstance = null;
let votingInstance = null;

// retrieve contract details from database
contract.retrieve_contract('user',(err, res)=>{
    if(err){
        console.log(err);
        throw new Error(err);
    } else{
        const contract_address = res['contract_address'];
        const contract_json = res['contract_json'];
        userInstance = new web3.eth.Contract(
            contract_json,
            contract_address
        )
    }
})

contract.retrieve_contract('admin',(err, res)=>{
    if(err){
        console.log(err);
        throw new Error(err);
    } else{
        const contract_address = res['contract_address'];
        const contract_json = res['contract_json'];
        votingInstance = new web3.eth.Contract(
            contract_json,
            contract_address
        )
    }
})

const create_hashed_password = (otp) => {
    const hash = bcrypt.hashSync(otp, 10);
    return hash;
}

const compare_otp_data = (hash_data, otp) => {
    return bcrypt.compareSync(String(otp), hash_data['otp']);
}

const userControllers = {
    'votingStatus': async (req, res, next) => {
        try{
            const votingStatus = parseInt(await votingInstance.methods.getVotingStatus().call());
            if(votingStatus == 0){
                return res.status(401).json({message: 'Voting is not started'});
            } else if(votingStatus == 2){
                return res.status(401).json({message: 'Voting is finished'});
            }
            next();
        }
        catch(err){
            console.log(err);
            return res.status(500).json({"message": "Internal Server Error"});
        }
    },

    'verifyToken': (req, res, next) => {
        const token = req.header('Authorization');
        if (token) {
            jwt.verify(token, JWT_USER_SECRET, async (err, decoded) => {
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
                        const user_data = await userInstance.methods.retrieveUserDetails(decoded['token']).call();
                        if(String(user_data['0']).length === 0){
                            return res.status(401).json({'message': 'Unauthorized'});
                        } else if(user_data['3']){
                            return res.status(401).json({'message': 'Voting Completed'});
                        }
                        req.user = {
                            ...user_data,
                            '7': decoded['token']
                        };
                        next(); 
                    } catch(err){
                        console.log(err);
                        return res.status(500).json({"message": "Internal Server Error"});
                    }
                }
            });
        } else {
            return res.status(401).json({
                message: 'Token not supplied',
            });
        }
    },

    'login': async(req, res) => {
        const { public_key } = req.body;

        // retrieve phone number and voting details of user from blockchain
        let phone_number = '';
        try {
            const user_data = await userInstance.methods.retrieveUserDetails(public_key).call();
            phone_number = String(user_data['0']);
            if(phone_number.length === 0){
                return res.status(401).json({'message':'Unauthorized'});
            }
            if(user_data['3']){
                // already voted
                return res.status(401).json({'message': 'Voting Completed'});
            }
        } catch(err){
            console.log(err);
            return res.status(500).json({"message": "Internal Server Error"});
        }
        
        // otp generation
        const OTP = parseInt(otpGenerator.generate(otp_config.length, otp_config.otp_config));
        tc.messages
        .create({
            body: `The OTP is ${OTP}. It will expire in 1 minute` ,
            from: twilio_config.twilio_number,
            to: phone_number
        })
        .then(message => {
            const hashed_otp = create_hashed_password(String(OTP));
            otpQueries.insert_otp([public_key, message.sid, hashed_otp],(err, _)=>{
                if(err){
                    console.log(err);
                    return res.status(500).json({'message':'Internal Server Error'});
                } else{
                    return res.status(200).json({'message':'OTP Authentication'});
                }
            })
        })
        .catch(error =>{
            console.error('Failed to send SMS:', error);
            return res.status(500).json({ 'message': 'Failed to send OTP' });
        })
        
    },

    'otp_authenticate': async(req, res) => {
        const { public_key, otp } = req.body;
        otpQueries.retrieve_otp(public_key, async (err, result)=>{
            if(err){
                console.log(err);
                return res.status(500).json({'message':'Internal Server Error'});
            } else{
                if(result.length === 0){
                    return res.status(401).json({'message': 'OTP has expired'});
                } else{
                    if(compare_otp_data(result[0], otp)){
                        const payload = {
                            token: public_key,
                        };
                        const token = jwt.sign(payload, JWT_USER_SECRET, { expiresIn: '1h' });
                        return res.status(200).json({
                            'message':"Authenticated",
                            "token": token
                        });
                    } 
                    return res.status(401).json({'message':"OTP Mismatch"});   
                }
            }
        })
    },

    'register': async(req, res) => {
        const { fullName, phoneNumber, dateOfBirth, email } = req.body; // Include email in the destructured inputs

        // phone number existence
        try{
            const avail_phone = await tc.lookups.v1.phoneNumbers(phoneNumber).fetch({'type':'carrier'});
            if(avail_phone.carrier['error_code']){
                return res.status(400).json({'message': 'Phone number does not exist'});
            }
        } catch(err){
            console.log(err);
            return res.status(500).json({'message':'Internal Server Error'})
        }

        // design choice one user per phone number
        try{
            if(await userInstance.methods.isNumberRegistered(phoneNumber).call()){
                // already registered
                return res.status(409).json({'message':'Already Registered!'})
            }
        } catch(err){
            console.log(err);
            return res.status(500).json({'message':'Internal Server Error'})
        }
    
        // Generate Ethereum wallet keys
        const eth_wallet = Wallet['default'].generate();
        const private_key = eth_wallet.getPrivateKeyString();
        const public_key = eth_wallet.getPublicKeyString();
    
        // Add the account to a wallet to send a signed transaction
        const wallet = web3.eth.accounts.wallet.add(private_key);
    
        const sender_account = await web3.eth.getAccounts();

    
        // Insert user details to blockchain. Admin has to bear the gas price since he is storing the user data.
        try{
            await userInstance.methods.insertUserDetails(
                public_key,
                phoneNumber,
                dateOfBirth,
                fullName,
                email,
                wallet[wallet.length-1].address,
                false,
                false
            ).send({ from: sender_account[0], gas: web3_connection.gas_price })
        } catch (err){
            console.log(err);
            return res.status(500).json({"message": "Internal Server Error"});
        }
    
        // Email setup for sending wallet keys
        
        let transporter = nodemailer.createTransport(email_config);
    
        let mailOptions = {
            from:  email_config.auth.user,
            to: email, // Use the email provided in the request body
            subject: 'Registration for the voting process is Completed',
            text: `Dear ${fullName},\nYour registration is complete.\nYour public key: ${public_key} \n and Your private key: ${private_key}.\nThank you.`, 
        };

    
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Failed to send Email:', error);
                return res.status(500).json({ 'message': 'Failed to send credentials via Email' });
            } else {
                return res.status(201).json({ 'message': 'Registration Complete' })
            }
        });
    },
    'voteSetup': async(req, res) => {
        const user_data = req.user;
        if(!user_data['6']){
            const sender_account = await web3.eth.getAccounts();
            // Setup a wallet for the user with 0.05 ether to cover gas price while voting - This should be moved
            try{
                await web3.eth.sendTransaction({
                    from: sender_account[0],// send from account provided by ganache. (Considered as primary admin account)
                    to: user_data['5'],
                    value: web3.utils.toWei('0.05', 'ether')
                });
                await userInstance.methods.updateFeeStatus(
                    user_data['7'],
                    true
                ).send({ from: sender_account[0], gas: web3_connection.gas_price })
            } catch (err){
                console.log(err);
                return res.status(500).json({"message": "Internal Server Error"});
            }
        }
        try{
            const actual_cl = await votingInstance.methods.getAllCandidates().call();

            return res.status(200).json({
                'candidates': actual_cl.map((v,i)=>{
                    return({
                        'name': v['name'],
                        'id': parseInt(v['id'])
                    })
                })
            })
        } catch(err){
            console.log(err);
            return res.status(500).json({"message": "Internal Server Error"});
        }
    },

    // vote service
    'voteService': async (req, res) => {
        const user_data = req.user;
        const {candidate_id, account_address} = req.body;
        const sender_account = await web3.eth.getAccounts();

        if(account_address !== user_data['5'].toLowerCase()){
            return res.status(400).json({
                'message': 'Account address missmatch'
            })
        }
    
        // cast the vote
        try {
            const gas = await web3.eth.estimateGas({
                from : account_address,
            });
            const gasPrice = await web3.eth.getGasPrice();
            const balance = await web3.eth.getBalance(account_address)
            const value = balance - gas*gasPrice - 10n;
            await web3.eth.sendTransaction({
                from: account_address,
                to: sender_account[0],
                gas: gas,
                gasPrice: gasPrice,
                value: value
            });
            await votingInstance.methods.vote(candidate_id).send({ from: sender_account[0], gas: web3_connection.gas_price})
        } catch (err) {
            console.log(err);
            return res.status(500).json({ "message": "Internal Server Error" });
        }

        // update the user's voting status in the UserContract
        try {
            await userInstance.methods.updateVotingStatus(user_data['7'], true).send({ from: sender_account[0], gas: web3_connection.gas_price });
        } catch (err) {
            console.log(err);
            return res.status(500).json({ "message": "Internal Server Error" });
        }
    
        return res.status(200).json({ 'message': 'Vote successfully cast' });
       
    }
}

export default userControllers;