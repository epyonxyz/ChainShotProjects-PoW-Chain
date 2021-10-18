function verifyProof(proof, node, root, concat) {
    let data = node;
    for (let i = 0; i < proof.length; i++) {
        if (proof[i].left) {
            data = concat(proof[i].data, data);
        }
        else {
            data = concat(data, proof[i].data);
        }
    }
    console.log(data);
    console.log(root);
    return data === root;
}

module.exports = verifyProof;