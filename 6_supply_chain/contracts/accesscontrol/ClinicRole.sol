pragma solidity ^0.4.24;

// Import the library 'Roles'
import "./Roles.sol";

// Define a contract 'ClinicRole' to manage this role - add, remove, check
contract ClinicRole {
  using Roles for Roles.Role;

  // Define 2 events, one for Adding, and other for Removing
  event ClinicAdded(address indexed account);
  event ClinicRemoved(address indexed account);

  // Define a struct 'clinics' by inheriting from 'Roles' library, struct Role
  Roles.Role private clinics;

  // In the constructor make the address that deploys this contract the 1st clinic
  constructor() public {
    _addClinic(msg.sender);
  }

  // Define a modifier that checks to see if msg.sender has the appropriate role
  modifier onlyClinic() {
    require(isClinic(msg.sender));
    _;
  }

  // Define a function 'isClinic' to check this role
  function isClinic(address account) public view returns (bool) {
    return clinics.has(account);
  }

  // Define a function 'addClinic' that adds this role
  function addClinic(address account) public onlyClinic {
    _addClinic(account);
  }

  // Define a function 'renounceClinic' to renounce this role
  function renounceClinic() public {
    _removeClinic(msg.sender);
  }

  // Define an internal function '_addClinic' to add this role, called by 'addClinic'
  function _addClinic(address account) internal {
    clinics.add(account);
    emit ClinicAdded(account);
  }

  // Define an internal function '_removeClinic' to remove this role, called by 'removeClinic'
  function _removeClinic(address account) internal {
    clinics.remove(account);
    emit ClinicRemoved(account);
  }
}
