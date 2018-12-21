pragma solidity ^0.4.23;

import '../../node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721.sol';

contract StarNotary is ERC721 {

    struct Star {
        string name;
        string starStory;
        string ra;
        string dec;
        string mag;
    }

    mapping(uint256 => Star) public tokenIdToStarInfo;
    mapping(uint256 => uint256) public starsForSale;
    mapping(bytes32 => bool) public coordinatesTaken;

    function createStar(uint256 _tokenId, string _name, string _starStory, string _ra, string _dec, string _mag) public {
        // Check that star is unique
        require(checkIfStarExists(_ra, _dec, _mag) == false);

        // Truncate star story if needed
        string memory starStoryTrunc = _starStory;

        // Map star to star data
        Star memory newStar = Star(_name, starStoryTrunc, _ra, _dec, _mag);
        tokenIdToStarInfo[_tokenId] = newStar;

        // Mark star coordinates as taken
        bytes32 coordinatesHash = keccak256(abi.encodePacked(_ra, _dec, _mag));
        coordinatesTaken[coordinatesHash] = true;

        // Issue token
        _mint(msg.sender, _tokenId);
    }

    // Note: I don't like that we need this function unless we want the frontend to use it, because it requires using keccak256 twice.
    function checkIfStarExists(string _ra, string _dec, string _mag) public view returns(bool) {
        bytes32 coordinatesHash = keccak256(abi.encodePacked(_ra, _dec, _mag));
        return coordinatesTaken[coordinatesHash];
    }

    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
        require(this.ownerOf(_tokenId) == msg.sender);

        starsForSale[_tokenId] = _price;
    }

    function buyStar(uint256 _tokenId) public payable {
        require(starsForSale[_tokenId] > 0);

        uint256 starCost = starsForSale[_tokenId];
        address starOwner = this.ownerOf(_tokenId);
        require(msg.value >= starCost);

        _removeTokenFrom(starOwner, _tokenId);
        _addTokenTo(msg.sender, _tokenId);

        starOwner.transfer(starCost);

        if(msg.value > starCost) {
            msg.sender.transfer(msg.value - starCost);
        }
    }
}
