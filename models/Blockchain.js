class Blockchain {
  constructor() {
    this.blocks = [];
  }
  addBlock(block) {
    this.blocks.push(block);
  }
  blockHeight() {
    return this.blocks.length;
  }
  isValid() {
    for (let i=1; i<this.blockHeight(); i++) {
      if (this.blocks[i].previousHash.toString() !== this.blocks[i-1].toHash().toString()) {
        return false;
      }
    }
    return true;
  }
}

module.exports = Blockchain;
