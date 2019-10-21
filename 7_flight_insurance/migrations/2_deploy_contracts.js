const FlightSuretyApp = artifacts.require("FlightSuretyApp");
const FlightSuretyData = artifacts.require("FlightSuretyData");
const fs = require('fs');

module.exports = function(deployer, network, accounts) {
    const firstAirline = accounts[1];
    let appInstance, dataInstance;

    // Deploy data contract with first airline
    deployer.deploy(FlightSuretyData, firstAirline)
        .then(instance => dataInstance = instance)
        // Deploy app contract with data contract address
        .then(() => deployer.deploy(FlightSuretyApp, FlightSuretyData.address))
        .then(instance => appInstance = instance)
        // Initialize app address in data contract
        .then(() => dataInstance.authorizeCaller(FlightSuretyApp.address))
        // Ante up for firstAirline
        .then(() => dataInstance.fund({ from: firstAirline, value: web3.utils.toWei("10", "ether") }))
        // Add 3 mock flights
        .then(() => {
            appInstance.registerFlight("U150", 1571220000, { from: firstAirline });
            appInstance.registerFlight("U150", 1571306400, { from: firstAirline });
            appInstance.registerFlight("U150", 1571392800, { from: firstAirline });
        })
        // Export config file with contract addresses
        .then(() => {
            const config = {
                localhost: {
                    url: 'http://localhost:8545',
                    dataAddress: FlightSuretyData.address,
                    appAddress: FlightSuretyApp.address,
                    flights: [
                        {
                            airline: firstAirline,
                            timestamp: 1571220000,
                            flight: "U150"
                        },
                        {
                            airline: firstAirline,
                            timestamp: 1571306400,
                            flight: "U150"
                        },
                        {
                            airline: firstAirline,
                            timestamp: 1571392800,
                            flight: "U150"
                        }
                    ]
                }
            }
            fs.writeFileSync(__dirname + '/../src/dapp/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
            fs.writeFileSync(__dirname + '/../src/server/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
        })
}
