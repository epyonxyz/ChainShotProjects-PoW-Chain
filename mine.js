const SHA256 = require('crypto-js/sha256');
const Block = require('./models/Block');
const Transaction = require('./models/Transaction');
const UTXO = require('./models/UTXO');
const MerkleTree = require('./models/MerkleTree');
const verifyProof = require('./models/verifyProof');
const db = require('./db');
const {PUBLIC_KEY} = require('./config');
//const { require } = require('yargs');
const TARGET_DIFFICULTY = BigInt("0x0" + "F".repeat(63));
const BLOCK_REWARD = 10;
const MAX_TRANSACTIONS = 10;
const mempool = [];

const concat = (a,b) => SHA256(a + b).toString();

let mining = true;
mine();

function startMining() {
  mining = true;
  mine();
}

function stopMining() {
  mining = false;
}

function mine() {
  if(!mining) return;

  const block = new Block();

  // add transactions from the mempool
  console.log(mempool.length);
  while (block.transactions.length < MAX_TRANSACTIONS && mempool.length > 0) {
    block.addTransaction(mempool.pop());
  }

  const coinbaseUTXO = new UTXO(PUBLIC_KEY, BLOCK_REWARD);
  const coinbaseTX = new Transaction([], [coinbaseUTXO]);
  block.addTransaction(coinbaseTX);

  while(BigInt('0x' + block.hash()) >= TARGET_DIFFICULTY) {
    block.nonce++;
  }

  console.log(block.merkleRoot);
  block.execute();

  db.blockchain.addBlock(block);

  console.log(`Mined block #${db.blockchain.blockHeight()} with a hash of ${block.hash()} at nonce ${block.nonce}`);

  // test verification of a transaction
  let blockTransactions = db.blockchain.blocks[db.blockchain.blockHeight()-1].transactions;
  let blockMerkleRoot = db.blockchain.blocks[db.blockchain.blockHeight()-1].merkleRoot;
  let tree = new MerkleTree(blockTransactions.map(x => SHA256(x).toString()), concat);
  let proof = tree.getProof(0);
  let result = verifyProof(proof, SHA256(blockTransactions[0]).toString(), blockMerkleRoot, concat)
  if (result) {
    console.log('Verification Successful!');
  }
  else {
    console.log('Verification FAILED');
  }

  setTimeout(mine, 2500);
}

let randomTransactions = true;
randomTransaction();

function startRandomTransactions() {
  randomTransactions = true;
  randomTransaction();
}

function stopRandomTransactions() {
  randomTransactions = false;
}

function randomTransaction() {
  if (!randomTransactions) return;

  let amount = 10*Math.random();                      // random amount between 0 and 10
  let feeUTXO = new UTXO(PUBLIC_KEY,0.1*amount);
  let rndTx = new Transaction([],[feeUTXO]);

  if (Math.random() > 0.5) {
    // add to mempool with probability 0.5
    mempool.push(rndTx);
  }

  setTimeout(randomTransaction, 500);
}

module.exports = {
  startMining,
  stopMining,
  startRandomTransactions,
  stopRandomTransactions,
};
