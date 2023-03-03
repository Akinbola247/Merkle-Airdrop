import { ethers } from "hardhat";
import fs from 'fs';
import * as path from "path";
import { parse } from 'csv-parse';
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";





//TOKEN INTERACTION
async function main() { 

  const items: any[] = [];
  const dumpValue : any[] = [];

  
  async function resolveCSV() {
    const csvFilePath = path.resolve(__dirname, 'address.csv');
    const headers = ['Address', 'Amount'];
    const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });
    parse(fileContent, {
      delimiter: ',',
      columns: headers,
    }, (error, result) => {
      if (error) {
        console.error(error);
      }
  const finalResult: any[] = result.slice(1,11);

  finalResult.map((e)=>{
      items.push([e.Address,e.Amount]);
  })
  const tree = StandardMerkleTree.of(items, ["address", "uint256"]);
  console.log(tree.root);
  // console.log(tree.dump())
  // fs.writeFileSync('tree.json', JSON.stringify(tree.dump().tree));
  // fs.writeFileSync('values.json', JSON.stringify(tree.dump().values));
  //  fs.writeFileSync('treeDump.json', JSON.stringify(tree.dump()));
});
};
resolveCSV();
//CONTRACT INTERACTION
  
  const [owner] = await ethers.getSigners();
  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy('kenToken', 'KEN');
  await token.deployed();

  console.log(
    `Token contract is deployed to : ${token.address}`
  );

//IMPERSONATION
const helpers = require("@nomicfoundation/hardhat-network-helpers");
const impersonatedAccount = "0x866b1515AcF7e82C8389a65823A6Ca8bB525A0bA";
await helpers.impersonateAccount(impersonatedAccount);
const impersonatedSigner = await ethers.getSigner(impersonatedAccount);
await helpers.setBalance(impersonatedSigner.address, 200000000000000000000000);
 const impersonated = await ethers.provider.getBalance(impersonatedSigner.address)

console.log(`balance of impersonated : ${impersonated}`);

//@ts-ignore
const tree = StandardMerkleTree.load(JSON.parse(fs.readFileSync("treeDump.json")));
function getProof(_address : any){
  for (const [i, v] of tree.entries()) {
    if (_address === v[0]) {
      const proof = tree.getProof(i);
      // console.log('Value:', v);
      // console.log('Proof:', proof);
       const proofNvalue = [proof, v[1]]; 
       return proofNvalue;     
    }
  }
}

const argNeeded: any = getProof(impersonatedAccount);
// console.log(argNeeded);
const balance1 = await token.balanceOf(impersonatedAccount);
console.log(`balance of claimed before ${balance1}`);
await token.connect(impersonatedSigner).claimAirdrop(argNeeded[0], argNeeded[1]);
const balance = await token.balanceOf(impersonatedAccount);
console.log(`balance of claimed after ${balance}`);

// await token.connect(impersonatedSigner).claimAirdrop(argNeeded[0], argNeeded[1]);

}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
