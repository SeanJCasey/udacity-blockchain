# Project 6 - Supply Chain - VaccineTrust

This project uses an Ethereum blockchain to track vaccines along their supply chain.

On Rinkeby:

Contract: 0x226746775Cd28008ab2B50d153dd76C85d1f97DC
Tx: 0x11cabb6b19b388469a75f9a2c51577be30c5f023e893988d882c34605265ad0f
Etherscan: https://rinkeby.etherscan.io/tx/0x11cabb6b19b388469a75f9a2c51577be30c5f023e893988d882c34605265ad0f

## Dependencies

* `truffle-hdwallet-provider` -- for deploying the contract to an Ethereum testnet
* `dotenv` -- for using non source controlled environment variables

## UML diagrams:

See the `UML/` folder for activity, sequence, state, and class diagrams.

## Installation

1. Clone the parent repo
`git clone git@github.com:SeanJCasey/udacity-blockchain.git`

2. Switch to this project directory
`cd udacity-blockchain/6_supply_chain`

3. Install dependencies
`npm i`

4. Spin up a local blockchain via ganache
`npm i -g ganache-cli` (if you don't have ganache installed)
`ganache-cli`

5. Deploy the contracts to your local blockchain via truffle
`npm i -g truffle` (if you don't have truffle installed)
`truffle migrate`

6. Spin up the frontend via a lite server
`npm run dev`
