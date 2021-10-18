const SHA256 = require('crypto-js/sha256');
const MerkleTree = require('./MerkleTree');
const concat = (a,b) => SHA256(a + b).toString();

class Block {
  constructor() {
    this.timestamp = Date.now();
    this.nonce = 0;
    this.transactions = [];
    this.previousHash = 0;
    this.merkleRoot = 0;
  }
  addTransaction(tx) {
    this.transactions.push(tx);
    let tree = new MerkleTree(this.transactions.map(x => SHA256(x).toString()), concat);   // construct Merkle tree
    this.merkleRoot = tree.getRoot();                       // calculate Merkle root
  }
  hash() {
    return SHA256(
      this.timestamp + "" +
      this.nonce + "" +
      this.previousHash +
      this.merkleRoot
    ).toString();
  }
  execute() {
    this.transactions.forEach(x => x.execute());
  }
}

module.exports = Block;
