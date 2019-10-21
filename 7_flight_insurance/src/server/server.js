import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';
import express from 'express';


let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
web3.eth.defaultAccount = web3.eth.accounts[0];
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
let oracleAccounts = []
let oracleKeys = {};
const accountOffset = 10;
const statusOptions = [0, 10, 20, 30, 40, 50];

async function fetchOracleAccounts(n, m) {
  const accounts = await web3.eth.getAccounts();
  oracleAccounts = accounts.slice(n, m);
}

async function registerOracles() {
  const fee = await flightSuretyApp.methods.REGISTRATION_FEE().call();
  for(let i=0; i<oracleAccounts.length; i++) {
    const oracleAccount = oracleAccounts[i];
    await flightSuretyApp.methods.registerOracle().send({ gas: 5000000, from: oracleAccount, value: fee });
    let result = await flightSuretyApp.methods.getMyIndexes().call({from: oracleAccount});
    oracleKeys[oracleAccount] = [result[0], result[1], result[2]];
    console.log(`Oracle Registered: ${oracleKeys[oracleAccount]}`);
  }
  console.log(`Total oracles registered:`, Object.keys(oracleKeys).length);
}

async function startup() {
  await fetchOracleAccounts((accountOffset+1), (accountOffset+21));
  await registerOracles();
}
startup();

flightSuretyApp.events.OracleRequest({
    fromBlock: 0
  }, function (error, event) {
    if (error) console.log(error);
    const index = event.returnValues.index;
    for (const account of Object.keys(oracleKeys)) {
      if (oracleKeys[account].includes(index)) {
        const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
        flightSuretyApp.methods.submitOracleResponse(
          index,
          event.returnValues.airline,
          event.returnValues.flight,
          event.returnValues.timestamp,
          status
        ).send(
          { gas: 5000000, from: account },
          function (err, res) {
            if (err) {
              console.log(err);
            }
            else {
              console.log("Reported status:", status);
            }
          }
        )
      }
    }
});

const app = express();
app.get('/api', (req, res) => {
    res.send({
      message: 'An API for use with your Dapp!'
    })
})

export default app;
