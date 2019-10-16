require('dotenv').config()
const HDWalletProvider = require('truffle-hdwallet-provider');
const infuraKey = process.env.INFURA_KEY;
const fs = require('fs');
const mnemonic = fs.readFileSync('.secret').toString().trim();

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*"
    },
    rinkeby: {
      provider: () => new HDWalletProvider(mnemonic, `https://rinkeby.infura.io/v3/${infuraKey}`),
      network_id: 4,         // Rinkeby's id
      gas: 6500000,          // Rinkeby has a lower block limit than mainnet
      gasPrice: 2000000000,  // 2 gwei (in wei) (default: 100 gwei)
      skipDryRun: true       // Skip dry run before migrations? (default: false for public nets )
    }
  },
  compilers: {
    solc: {
      version: "0.4.24"
    }
  }
};
