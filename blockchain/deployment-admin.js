import compiledContract from "./build/contracts/VotingSystem.json"  with { type: "json" };
import Web3 from 'web3';
import contractQueries from "./db/models/contractQueries.js";
import 'dotenv/config';

const deploy = async() => {
    const web3 = new Web3(new Web3.providers.HttpProvider(process.env.WEB3_PROVIDER));
    const accounts = await web3.eth.getAccounts();
    const result = await new web3.eth.Contract(
        compiledContract.abi
    )
    .deploy({data: compiledContract.evm.bytecode.object})
    .send({gas: 3000000, from: accounts[0]});
    contractQueries.insert_contract(['admin', result.options.address, JSON.stringify(compiledContract.abi)], (err, _)=>{
        if(err){
            throw new Error(`Some error ${err}`)
        } else {
           process.exit();
        }
    })
}

deploy();