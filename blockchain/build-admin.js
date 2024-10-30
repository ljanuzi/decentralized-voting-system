import fs_extra from "fs-extra";
import Web3 from "web3";
import path from "path";
import solc from "solc";


const build = async () => {
    const buildPath = path.resolve("build/contracts");

    const contractPath = path.resolve("contracts/","CandidateContract.sol");

    const source = fs_extra.readFileSync(contractPath, "utf8");

    const input = {
        language: 'Solidity',
        sources: {
            'CandidateContract.sol' : {
                content: source
            }
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': [ '*' ]
                }
            }
        }
    }; 

    const output = JSON.parse(solc.compile(JSON.stringify(input))); // compiling the candidate contract
    fs_extra.ensureDirSync(buildPath);

    for(const contractName in output['contracts']['CandidateContract.sol']){
        fs_extra.outputJSONSync(
            path.resolve(buildPath, contractName + '.json'),
            output.contracts['CandidateContract.sol'][contractName]
        );
    }
}

build();