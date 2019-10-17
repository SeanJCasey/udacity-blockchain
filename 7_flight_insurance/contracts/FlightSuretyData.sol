pragma solidity ^0.4.25;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    address private contractOwner;
    bool private operational;

    constructor() public {
        contractOwner = msg.sender;
        operational = true;
    }

    modifier requireIsOperational() {
        require(operational, "Contract is currently not operational");
        _;
    }

    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    function isOperational() public view returns(bool) {
        return operational;
    }


    function setOperatingStatus(bool _mode) external requireContractOwner {
        operational = _mode;
    }

    function registerAirline(address) external pure {

    }

    function buy() external payable {

    }

    function creditInsurees() external pure {

    }

    function pay() external pure {

    }

    function fund() public payable {

    }

    function getFlightKey(
        address _airline,
        string memory _flight,
        uint256 _timestamp
    )
        pure
        internal
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(_airline, _flight, _timestamp));
    }

    function() external payable {
        fund();
    }

}
