// migrating the appropriate contracts
const PropertyToken = artifacts.require("./PropertyToken.sol");
// var SquareVerifier = artifacts.require("./SquareVerifier.sol");
// var SolnSquareVerifier = artifacts.require("./SolnSquareVerifier.sol");

module.exports = function(deployer) {
  deployer.deploy(PropertyToken);
  // deployer.deploy(SquareVerifier);
  // deployer.deploy(SolnSquareVerifier);
};
