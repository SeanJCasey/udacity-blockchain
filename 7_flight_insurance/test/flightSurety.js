const Test = require('../config/testConfig.js');
const BigNumber = require('bignumber.js');

contract('Flight Surety Tests', async accounts => {
  const airline1 = accounts[1];
  const airline2 = accounts[2];
  const airline3 = accounts[3];
  const airline4 = accounts[4];
  const airline5 = accounts[5];
  const insuree = accounts[6];

  const fundingAmount1 = web3.utils.toWei('10', 'ether');
  const fundingAmount2 = web3.utils.toWei('12', 'ether');
  const fundingAmount3 = web3.utils.toWei('15', 'ether');

  const flightCode1 = "U151";
  const flightAirline1 = airline1;
  const flightTimestamp1 = Math.floor(Date.now() / 1000);

  let config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);
    await config.flightSuretyData.authorizeCaller(config.flightSuretyApp.address);
  });

  describe('Operations and Settings', () => {
    it(`(multiparty) has correct initial isOperational() value`, async function () {

      // Get operating status
      let status = await config.flightSuretyData.isOperational.call();
      assert.equal(status, true, "Incorrect initial operating status value");
    });

    it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {

        // Ensure that access is denied for non-Contract Owner account
        let accessDenied = false;
        try
        {
            await config.flightSuretyData.setOperatingStatus(false, { from: config.testAddresses[2] });
        }
        catch(e) {
            accessDenied = true;
        }
        assert.equal(accessDenied, true, "Access not restricted to Contract Owner");
    });

    it(`(multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function () {

        // Ensure that access is allowed for Contract Owner account
        let accessDenied = false;
        try
        {
            await config.flightSuretyData.setOperatingStatus(false);
        }
        catch(e) {
            accessDenied = true;
        }
        assert.equal(accessDenied, false, "Access not restricted to Contract Owner");
    });

    it(`(multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {

        await config.flightSuretyData.setOperatingStatus(false);

        let reverted = false;
        try
        {
            await config.flightSurety.setTestingMode(true);
        }
        catch(e) {
            reverted = true;
        }
        assert.equal(reverted, true, "Access not blocked for requireIsOperational");

        // Set it back for other tests to work
        await config.flightSuretyData.setOperatingStatus(true);

    });
  })

  describe('Airlines', () => {
    it('cannot register an Airline if it has not funded', async () => {
      // ARRANGE
      let didThrow = false;
      // ACT
      try {
        await config.flightSuretyApp.registerAirline(airline2, { from: airline1 });
      }
      catch(e) {
        didThrow = true;
      }

      // ASSERT
      assert.equal(didThrow, true, "Airline should not be able to register another airline if it hasn't provided funding");
    });

    it('can register an Airline if it has funded', async () => {
      // ARRANGE
      let fundingAmount = web3.utils.toWei('10', 'ether');

      // ACT
      await config.flightSuretyData.fund({ value: fundingAmount1, from: airline1 });
      await config.flightSuretyApp.registerAirline(airline2, { from: airline1 });
    });

    it('auto-approves an Airline if less than 5 airlines registered', async () => {
      await config.flightSuretyApp.registerAirline(airline3, { from: airline1 });
      await config.flightSuretyApp.registerAirline(airline4, { from: airline1 });
      await config.flightSuretyApp.registerAirline(airline5, { from: airline1 });

      const res4 = await config.flightSuretyData.isApprovedAirline(airline4);
      const res5 = await config.flightSuretyData.isApprovedAirline(airline5);

      assert.equal(res4, true, "4th airline should be auto-approved");
      assert.equal(res5, false, "5th airline should NOT be auto-approved");
    });

    it('approves a 5th airline with multisig', async () => {
      // Fund from airlines 2 and 3
      await config.flightSuretyData.fund({ value: fundingAmount2, from: airline2 });
      await config.flightSuretyData.fund({ value: fundingAmount3, from: airline3 });

      // Vote for airline 5
      await config.flightSuretyApp.registerAirline(airline5, { from: airline2 });
      await config.flightSuretyApp.registerAirline(airline5, { from: airline3 });

      const res = await config.flightSuretyData.isApprovedAirline(airline5);

      assert.equal(res, true, "5th airline should be approved");
    });

  });

  describe('Flight', () => {
    it('Only airlines can add flights', async () => {
      const badFlightCode = "U152";
      const badFlightTimestamp = Math.floor(Date.now() / 1000);

      await config.flightSuretyApp.registerFlight(flightCode1, flightTimestamp1, { from: flightAirline1 });

      let didThrow = false;
      try {
        await config.flightSuretyApp.registerFlight(badFlightCode, badFlightTimestamp, { from: user });
      }
      catch(e) {
        didThrow = true;
      }

      assert.equal(didThrow, true, "Random user should not be able to add flight")
    });
  });

});
