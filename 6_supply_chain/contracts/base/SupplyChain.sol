pragma solidity ^0.4.24;

import "../accesscontrol/AccessControl.sol";
import "../core/Ownable.sol";

contract SupplyChain is Ownable, AccessControl {
  uint upc;

  mapping (uint => Item) items;

  enum State {
    Created,
    OrderedDist,
    PickedUpDist,
    StoredDist,
    OrderedClinic,
    DispatchedClinic,
    StoredClinic,
    Requested,
    Administered
  }

  State constant defaultState = State.Created;

  struct Item {
    string sku;
    uint upc;
    address manufacturerID;
    address distributorID;
    address clinicID;
    address patientID;
    State state;
  }

  event Created(uint _upc);
  event OrderedDist(uint _upc);
  event PickedUpDist(uint _upc);
  event StoredDist(uint _upc);
  event OrderedClinic(uint _upc);
  event DispatchedClinic(uint _upc);
  event StoredClinic(uint _upc);
  event Requested(uint _upc);
  event Administered(uint _upc);

  modifier verifyCaller (address _address) {
    require(msg.sender == _address);
    _;
  }

  modifier created(uint _upc) {
    require(items[_upc].state == State.Created);
    _;
  }

  modifier orderedDist(uint _upc) {
    require(items[_upc].state == State.OrderedDist);
    _;
  }

  modifier pickedUpDist(uint _upc) {
    require(items[_upc].state == State.PickedUpDist);
    _;
  }

  modifier storedDist(uint _upc) {
    require(items[_upc].state == State.StoredDist);
    _;
  }

  modifier orderedClinic(uint _upc) {
    require(items[_upc].state == State.OrderedClinic);
    _;
  }

  modifier dispatchedClinic(uint _upc) {
    require(items[_upc].state == State.DispatchedClinic);
    _;
  }

  modifier storedClinic(uint _upc) {
    require(items[_upc].state == State.StoredClinic);
    _;
  }

  modifier requested(uint _upc) {
    require(items[_upc].state == State.Requested);
    _;
  }

  modifier adminstered(uint _upc) {
    require(items[_upc].state == State.Administered);
    _;
  }

  constructor() public payable {
    upc = 1;
  }

  function kill() public onlyOwner {
    selfdestruct(owner());
  }

  function createItem(
    string _sku
  )
    public
    onlyManufacturer
  {
    Item memory item = Item({
      sku: _sku,
      upc: upc,
      state: State.Created,
      manufacturerID: msg.sender,
      distributorID: address(0),
      clinicID: address(0),
      patientID: address(0)
    });
    items[upc] = item;

    upc += 1;

    emit Created(item.upc);
  }

  function createOrderDist(uint _upc)
    public
    created(_upc)
    onlyDistributor
  {
    Item storage item = items[_upc];
    item.distributorID = msg.sender;
    item.state = State.OrderedDist;

    emit OrderedDist(_upc);
  }

  function pickUpDist(uint _upc)
    public
    orderedDist(_upc)
    verifyCaller(items[_upc].distributorID)
  {
    Item storage item = items[_upc];
    item.state = State.PickedUpDist;

    emit PickedUpDist(_upc);
  }

  function storeDist(uint _upc)
    public
    pickedUpDist(_upc)
    verifyCaller(items[_upc].distributorID)
  {
    Item storage item = items[_upc];
    item.state = State.StoredDist;

    emit StoredDist(_upc);
  }


  function orderClinic(uint _upc)
    public
    storedDist(_upc)
    onlyClinic
  {
    Item storage item = items[_upc];
    item.clinicID = msg.sender;
    item.state = State.OrderedClinic;

    emit OrderedClinic(_upc);
  }

  function dispatchClinic(uint _upc)
    public
    orderedClinic(_upc)
    verifyCaller(items[_upc].distributorID)
  {
    Item storage item = items[_upc];
    item.state = State.DispatchedClinic;

    emit DispatchedClinic(_upc);
  }

  function storeClinic(uint _upc)
    public
    dispatchedClinic(_upc)
    verifyCaller(items[_upc].clinicID)
  {
    Item storage item = items[_upc];
    item.state = State.StoredClinic;

    emit StoredClinic(_upc);
  }

  function requestItem(uint _upc)
    public
    storedClinic(_upc)
    onlyPatient
  {
    Item storage item = items[_upc];
    item.patientID = msg.sender;
    item.state = State.Requested;

    emit Requested(_upc);
  }

  function administerItem(uint _upc)
    public
    requested(_upc)
    verifyCaller(items[_upc].clinicID)
  {
    Item storage item = items[_upc];
    item.state = State.Administered;

    emit Administered(_upc);
  }

  function fetchItem(uint _upc)
    view
    public
    returns (
      string sku_,
      address manufacturerID_,
      address distributorID_,
      address clinicID_,
      address patientID_,
      State state_
    )
  {
    Item memory item = items[_upc];
    return (
      item.sku,
      item.manufacturerID,
      item.distributorID,
      item.clinicID,
      item.patientID,
      item.state
    );
  }
}
