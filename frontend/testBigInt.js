// testBigint.js
console.log("Node version:", process.version);

const val = 130n * 10n**18n;
console.log("Decimal:", val.toString());
console.log("Hex:", "0x" + val.toString(16));
