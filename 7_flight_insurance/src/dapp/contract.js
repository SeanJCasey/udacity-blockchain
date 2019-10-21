import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';

export default class Contract {
    constructor(network, callback) {
        let config = Config[network];
        this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.initialize(callback);
        this.owner = null;
        this.airlines = [];
        this.passengers = [];
        this.flights = config.flights;
    }

    initialize(callback) {
        this.web3.eth.getAccounts((error, accts) => {

            this.owner = accts[0];

            let counter = 1;

            while(this.airlines.length < 5) {
                this.airlines.push(accts[counter++]);
            }

            while(this.passengers.length < 5) {
                this.passengers.push(accts[counter++]);
            }

            callback();
        });
    }

    buyInsurance(flightId, amount, callback) {
        const self = this;
        const flight = self.flights[flightId-1];
        const amountWei = self.web3.utils.toWei(amount, "ether");
        const passenger = self.passengers[0];

        self.flightSuretyApp.methods
            .buyInsurance(flight.airline, flight.flight, flight.timestamp)
            .send(
                { value: amountWei, from: passenger },
                (error, result) => callback(error, flight)
            );
    }

    isOperational(callback) {
       const self = this;
       self.flightSuretyApp.methods
            .isOperational()
            .call({ from: self.owner}, callback);
    }

    fetchFlightStatus(flightId, callback) {
        const self = this;
        const flight = self.flights[flightId-1];
        self.flightSuretyApp.methods
            .fetchFlightStatus(flight.airline, flight.flight, flight.timestamp)
            .send({ from: self.owner }, (error, result) => {
                callback(error, flight);
            });
    }
}
