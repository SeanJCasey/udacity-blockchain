// migrating the appropriate contracts
const PropertyToken = artifacts.require("./PropertyToken.sol");
const SquareVerifier = artifacts.require("./SquareVerifier.sol");
const SolnSquareVerifier = artifacts.require("./SolnSquareVerifier.sol");

module.exports = function(deployer, network) {
  if (!(['mainnet', 'rinkeby'].includes(network))) {
    deployer.deploy(PropertyToken);
  }
  deployer.deploy(SquareVerifier)
    .then(() => deployer.deploy(SolnSquareVerifier, SquareVerifier.address));
};
