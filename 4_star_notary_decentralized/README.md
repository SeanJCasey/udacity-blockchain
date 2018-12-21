# Project 4 - Decentralized Star Notary Project

This project uses an Ethereum blockchain to claim a unique star, put it up for sale, and have another user buy it. A "star" is an ERC721 token.

## Dependencies

### Npm packages:

* `web3` -- for interacting with Ethereum blockchains
* `openzeppelin-solidity` -- for implementing the ERC721 token interface
* `truffle-hdwallet-provider` -- for using a Metamask seed phrase to interact with Ethereum test networks via truffle

Install these and other required packages using `npm install`.

### Optional tools:

* `truffle` -- for running a local Ethereum blockchain, or deploying to the Rinkeby test network

Note: If you want to launch the StarNotary contract on the Rinkeby network, you will need to configure `smart_contracts/truffle.js` with your mneumonic (seed phrase) and an ethereum node connection. For an Ethereum node, Infura (https://infura.io) is the easiest option.

## Get a star notary service running on your local server:

1. Run `npm install` to install dependencies.
2. `cd smart_contracts` to switch to the directory with truffle.
3. Run `truffle develop` to start a local Ethereum blockchain.
4. (Truffle console) run `migrate` to deploy the StarNotary contract.
5. Replace the `starNotary` variable on line 535 of `index.html` with the contract address you receive from the previous step.
6. Spin up a local server. There are many tools to do this, such as MAMP (https://www.mamp.info/en/) for Mac.
7. View this project's root directory in a web browser, which will display index.html.

You can use the UI to create a star and to get that star's info!

A UI for buying/selling stars is coming soon.

## StarNotary token contract details

The StarNotery contract inherits all the functions and variables of the ERC721 interface, as defined in openzepplin's implementation (https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/contracts/token/ERC721/ERC721.sol).

A StarNotary token contains the following info:

* `tokenId` -- the unique numeric identifier of the star
* `name` -- the name of the star
* `starStory` -- the star's story
* `ra` -- the star's "ra" coordinates
* `dec` -- the star's "dec" coordinates
* `mag` -- the star's "magnitude"

### Transactional functions

These functions must be invoked as part of a transaction.

#### `createStar(uint256 _tokenId, string _name, string _starStory, string _ra, string _dec, string _mag)`

Used to claim a new star.

E.g., `createStar(1, "My Star", "This is my star's story", "ra_101.12", "dec_129.41", "mag_852.12")`

#### `putStarUpForSale(uint256 _tokenId, uint256 _price)`

Put a star that you own up for sale.

E.g., putStarUpForSale(1, 1000000000)

#### `buyStar(uint256 _tokenId)`

Buy a star that is for sale.

E.g., buyStar(1)

Note: ETH must be sent in the transaction. If the amount of ETH sent is greater than the cost of the star, the extra ETH will be returned.

### Callable functions

These functions can be called (no transaction required) and provide a return value.

#### `checkIfStarExists(string _ra, string _dec, string _mag)`

Returns `true` or `false` if the star is already claimed.

#### `tokenIdToStarInfo(uint256 tokenId)`

Get a star's info by its `tokenId`.

Returns: `[name, starStory, ra, dec, mag]`

E.g., `tokenIdToStarInfo(1)` returns `["My Star", "This is my star's story", "ra_101.12", "dec_129.41", "mag_852.12"]`

#### `starsForSale(uint256 tokenId)`

Get the price of a star that is for sale. If the returns

Returns: price of the star (in wei), or `0` if it is not for sale

E.g., `starsForSale(1)` returns `1000000000`

### Interacting with smart contracts

The easiest way to call the above functions is by using MyEtherWallet and Metamask.

1. Connect to the network you would like to use in Metamask (e.g., Rinkeby or local).
2. Go to https://www.myetherwallet.com/#contracts
3. Paste in the contract address and ABI (see below) and click 'Access'
4. Select a function, enter input values, and read/write to the contract!

The ABI for this contract is:

```
[
    {
      "constant": true,
      "inputs": [
        {
          "name": "interfaceId",
          "type": "bytes4"
        }
      ],
      "name": "supportsInterface",
      "outputs": [
        {
          "name": "",
          "type": "bool"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "starsForSale",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "getApproved",
      "outputs": [
        {
          "name": "",
          "type": "address"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "to",
          "type": "address"
        },
        {
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "approve",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "tokenIdToStarInfo",
      "outputs": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "starStory",
          "type": "string"
        },
        {
          "name": "ra",
          "type": "string"
        },
        {
          "name": "dec",
          "type": "string"
        },
        {
          "name": "mag",
          "type": "string"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "from",
          "type": "address"
        },
        {
          "name": "to",
          "type": "address"
        },
        {
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "transferFrom",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "from",
          "type": "address"
        },
        {
          "name": "to",
          "type": "address"
        },
        {
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "safeTransferFrom",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "ownerOf",
      "outputs": [
        {
          "name": "",
          "type": "address"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "to",
          "type": "address"
        },
        {
          "name": "approved",
          "type": "bool"
        }
      ],
      "name": "setApprovalForAll",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "from",
          "type": "address"
        },
        {
          "name": "to",
          "type": "address"
        },
        {
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "name": "_data",
          "type": "bytes"
        }
      ],
      "name": "safeTransferFrom",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "",
          "type": "bytes32"
        }
      ],
      "name": "coordinatesTaken",
      "outputs": [
        {
          "name": "",
          "type": "bool"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "owner",
          "type": "address"
        },
        {
          "name": "operator",
          "type": "address"
        }
      ],
      "name": "isApprovedForAll",
      "outputs": [
        {
          "name": "",
          "type": "bool"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "name": "to",
          "type": "address"
        },
        {
          "indexed": true,
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "Transfer",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "name": "approved",
          "type": "address"
        },
        {
          "indexed": true,
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "Approval",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "name": "operator",
          "type": "address"
        },
        {
          "indexed": false,
          "name": "approved",
          "type": "bool"
        }
      ],
      "name": "ApprovalForAll",
      "type": "event"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_tokenId",
          "type": "uint256"
        },
        {
          "name": "_name",
          "type": "string"
        },
        {
          "name": "_starStory",
          "type": "string"
        },
        {
          "name": "_ra",
          "type": "string"
        },
        {
          "name": "_dec",
          "type": "string"
        },
        {
          "name": "_mag",
          "type": "string"
        }
      ],
      "name": "createStar",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "_ra",
          "type": "string"
        },
        {
          "name": "_dec",
          "type": "string"
        },
        {
          "name": "_mag",
          "type": "string"
        }
      ],
      "name": "checkIfStarExists",
      "outputs": [
        {
          "name": "",
          "type": "bool"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_tokenId",
          "type": "uint256"
        },
        {
          "name": "_price",
          "type": "uint256"
        }
      ],
      "name": "putStarUpForSale",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_tokenId",
          "type": "uint256"
        }
      ],
      "name": "buyStar",
      "outputs": [],
      "payable": true,
      "stateMutability": "payable",
      "type": "function"
    }
]
```

