const { toBigInt, randomBytes } = require("ethers");

const num = 20;

async function generate() {
    for (let i = 0; i < num; i++) {
        // Generate a 256-bit (32-byte) random number
        let n = toBigInt(randomBytes(32));  
        console.log(n.toString());
    }
}

generate()
    .catch((err) => { 
        console.log(err); 
        process.exit(1); 
    });
