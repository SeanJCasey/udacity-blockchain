pragma solidity ^0.4.25;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    address private appContract;
    address private contractOwner;
    address[] private airlines;
    bool private operational;
    uint constant airlineFundMin = 10 ether;
    uint constant insuranceAmountMax = 1 ether;
    uint8 constant multisigSuccessPercent = 50;
    uint8 constant multisigMinParticipants = 4;
    uint8 constant payoutPercent = 150;

    enum AirlineState { None, Pending, Approved, Active }
    struct AirlineInfo {
        uint amountFunded;
        AirlineState state;
        address[] approvalVotes;
    }
    mapping(address => AirlineInfo) private addressToAirlineInfo;

    enum PlanState { None, Available, PaidOut }
    struct PlanInfo {
        PlanState state;
        address[] insurees;
        mapping(address => uint) insureeToAmount;
    }
    mapping(bytes32 => PlanInfo) private flightToPlanInfo;
    mapping(address => uint) private insureeToBalance;

    mapping(address => bool) private authorizedCallers;

    constructor(address _airline) public {
        contractOwner = msg.sender;
        operational = true;

        addNewAirline(_airline, msg.sender);
    }

    modifier onlyApprovedAirline() {
        require(
            isApprovedAirline(msg.sender),
            "Caller is not an approved airline"
        );
        _;
    }

    modifier onlyActiveAirline() {
        require(
            isActiveAirline(msg.sender),
            "Caller is not an active airline"
        );
        _;
    }

    modifier onlyAuthorizedCaller() {
        require(
            isAuthorizedCaller(msg.sender),
            "Caller is not authorized"
        );
        _;
    }

    modifier requireIsOperational() {
        require(operational, "Contract is currently not operational");
        _;
    }

    modifier requireContractOwner() {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    function authorizeCaller(address _caller) external requireContractOwner {
        require(
            !isAuthorizedCaller(_caller),
            "Address is already authorized"
        );
        authorizedCallers[_caller] = true;
    }

    function deauthorizeCaller(address _caller) external requireContractOwner {
        require(
            !isAuthorizedCaller(_caller),
            "Caller is already not authorized"
        );
        authorizedCallers[_caller] = false;
    }

    function isActiveAirline(address _airline)
        view
        public
        returns (bool)
    {
        return addressToAirlineInfo[_airline].state == AirlineState.Active;
    }

    function isApprovedAirline(address _airline)
        view
        public
        returns (bool)
    {
        return (
            addressToAirlineInfo[_airline].state == AirlineState.Approved ||
            addressToAirlineInfo[_airline].state == AirlineState.Active
        );
    }

    function isAuthorizedCaller(address _caller) view private returns (bool) {
        return authorizedCallers[_caller];
    }

    function isOperational() view public returns (bool) {
        return operational;
    }

    function setAppContract(address _appContract) external requireContractOwner {
        appContract = _appContract;
    }

    function setOperatingStatus(bool _mode) external requireContractOwner {
        operational = _mode;
    }

    function isMultisigSuccess(uint _votes) view internal returns (bool) {
        assert(_votes > 0);
        return _votes.mul(100).div(airlines.length) >= multisigSuccessPercent;
    }

    function addNewAirline(address _airline, address _registerer) private {
        addressToAirlineInfo[_airline].approvalVotes.push(_registerer);

        // Auto-approve airline if not min for multisig
        if (airlines.length < multisigMinParticipants) {
            addressToAirlineInfo[_airline].state = AirlineState.Approved;
        }
        else {
            addressToAirlineInfo[_airline].state = AirlineState.Pending;
        }

        // Add to list of airlines
        airlines.push(_airline);
    }

    function registerAirline(address _airline, address _registerer)
        public
        onlyAuthorizedCaller
        returns (bool approved_, uint votes_)
    {
        require(
            !isApprovedAirline(_airline),
            "Airline is already approved"
        );

        if (addressToAirlineInfo[_airline].state == AirlineState.Pending) {
            incrementAirlineApprovalVote(_airline, _registerer);
        }
        else {
            addNewAirline(_airline, _registerer);
        }

        return (
            isApprovedAirline(_airline),
            addressToAirlineInfo[_airline].approvalVotes.length
        );
    }

    function registerFlight(
        address _airline,
        string _flight,
        uint _timestamp
    )
        external
        onlyAuthorizedCaller
    {
        bytes32 key = getFlightKey(_airline, _flight, _timestamp);
        require(flightToPlanInfo[key].state == PlanState.None, "Flight already registered");

        flightToPlanInfo[key].state = PlanState.Available;
    }

    function buy(address _airline, string _flight, uint _timestamp, address _insuree)
        external
        onlyAuthorizedCaller
        payable
    {
        require(_insuree != address(0), "No insuree address");
        require(msg.value > 0, "No ETH sent");
        bytes32 key = getFlightKey(_airline, _flight, _timestamp);
        require(
            flightToPlanInfo[key].state == PlanState.Available,
            "This flight is not insurable"
        );

        PlanInfo storage plan = flightToPlanInfo[key];
        require(
            plan.insureeToAmount[_insuree] + msg.value <= insuranceAmountMax,
            "Total insurance amount over limit"
        );

        plan.insurees.push(_insuree);
        plan.insureeToAmount[_insuree] += msg.value;
    }

    function calculatePayout(uint _paidAmount) pure internal returns (uint) {
        return _paidAmount.mul(payoutPercent).div(100);
    }

    function creditInsurees(
        address _airline,
        string _flight,
        uint _timestamp
    )
        external
        onlyAuthorizedCaller
    {
        bytes32 key = getFlightKey(_airline, _flight, _timestamp);
        PlanInfo storage plan = flightToPlanInfo[key];
        require(plan.state != PlanState.PaidOut, "Plan has already paid out");
        require(plan.insurees.length > 0, "Plan has no insurees");

        for(uint i = 0; i < plan.insurees.length; i++) {
            address insuree = plan.insurees[i];
            insureeToBalance[insuree] += calculatePayout(plan.insureeToAmount[insuree]);
        }
        plan.state = PlanState.PaidOut;
    }

    function withdrawBalance(address _insuree) external onlyAuthorizedCaller {
        uint balance = insureeToBalance[_insuree];
        require(balance > 0, "User has no balance owed");

        insureeToBalance[_insuree] = 0;
        _insuree.transfer(balance);
    }

    function fund() public payable onlyApprovedAirline {
        AirlineInfo storage airline = addressToAirlineInfo[msg.sender];
        airline.amountFunded += msg.value;
        if (
            airline.state == AirlineState.Approved &&
            airline.amountFunded >= airlineFundMin
        ) {
            airline.state = AirlineState.Active;
        }
    }

    function getFlightKey(
        address _airline,
        string memory _flight,
        uint _timestamp
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

    function incrementAirlineApprovalVote(address _airline, address _registerer) private {
        AirlineInfo storage airline = addressToAirlineInfo[_airline];

        // Validate sender has not already voted
        bool isDuplicate = false;
        for(uint i = 0; i < addressToAirlineInfo[_airline].approvalVotes.length; i++) {
            if (airline.approvalVotes[i] == _registerer) {
                isDuplicate = true;
                break;
            }
        }
        require(!isDuplicate, "Caller has already voted to register airline");

        // Add sender's vote
        airline.approvalVotes.push(_registerer);
        if (isMultisigSuccess(airline.approvalVotes.length)) {
            airline.state = AirlineState.Approved;
        }
    }
}
