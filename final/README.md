# Capstone - Property Token

This project uses an Ethereum blockchain to register and sell unique properties.

## Deployed contracts (on rinkeby)

Storefront: https://rinkeby.opensea.io/assets/property-token

For contract address, tx, and ABI (with read/write interface), see verified contract on Etherscan:

Verified Contract (ABI): https://rinkeby.etherscan.io/address/0x0DCe2a0Fe7e39498540161D08bB1cA2326969c22#contracts

## Dependencies

* `truffle-hdwallet-provider` -- for deploying the contract to an Ethereum testnet
* `dotenv` -- for using non source controlled environment variables
* `openzeppelin-solidity` -- for smart contract templating

## Installation and testing

1. Clone the parent repo
`git clone git@github.com:SeanJCasey/udacity-blockchain.git`

2. Switch to this project directory
`cd udacity-blockchain/final`

3. Install dependencies
`npm i`

4. Spin up a local blockchain via ganache
`npm i -g ganache-cli` (if you don't have ganache installed)
`ganache-cli`

5. Compile the smart contracts
`truffle compile`

6. Run the test suite
`truffle test`

