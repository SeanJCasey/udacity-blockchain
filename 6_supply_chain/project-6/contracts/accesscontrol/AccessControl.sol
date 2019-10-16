pragma solidity ^0.4.24;

import "./ClinicRole.sol";
import "./DistributorRole.sol";
import "./ManufacturerRole.sol";
import "./PatientRole.sol";

contract AccessControl is ClinicRole, DistributorRole, ManufacturerRole, PatientRole {}
