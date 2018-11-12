# Project 3.2 - Build a Private Blockchain Notary Service

This project extends the RESTful API from Project 3.1, creating a notary service for registering stars to Bitcoin addresses. A Bitcoin address is required for submitting a registration request that proves identity before a star can be registered to that address.

## Required packages

This project uses the Hapi framework to serve its API endpoints. It also uses Hapi's Boom package for HTTP-friendly error handling.

Also used are `bitcoinjs-message` and `bitcoinjs-lib` for verifying Bitcoin address signatures, and `crypto-js` for use of its SHA256 hashing function.

Install these and other required packages using `npm install`

After installing the required packages, start the server by running `node app.js`

## Endpoints

The API has the following endpoints:

### `GET /block/[blockheight]`

Returns a JSON object with the full data of a specified block

#### Parameters:

* `blockheight` - the height of the desired block [required]

#### Sample response:

```
{
    "hash": "846a3ec08bafa8ce33f6e9805ea33b0b361cb736ed2963793b68e051b17246ff",
    "height": 2,
    "body": {
        "address": "n2rRf5BoxKL1vA9o3QT7qLuEwxXeWSsHAh",
        "star": {
            "ra": "14h 29m 1.0s",
            "dec": "-20° 29' 24.9",
            "story": "416e6f746865722073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
            "storyDecoded": "Another star using https://www.google.com/sky/"
        }
    },
    "time": "1542012406",
    "previousBlockHash": "18bb77160333f41c23a45768871e3a73b35596c3ca6053ab7c2ccb78ae27439b"
}
```

### `GET /stars/hash:[hash]`

Returns a JSON object with the full data of a block with the specified hash

#### Parameters:

* `hash` - a SHA256 hash string [required]

#### Sample response:

```
{
    "hash": "18bb77160333f41c23a45768871e3a73b35596c3ca6053ab7c2ccb78ae27439b",
    "height": 1,
    "body": {
        "address": "n2rRf5BoxKL1vA9o3QT7qLuEwxXeWSsHAh",
        "star": {
            "ra": "16h 29m 1.0s",
            "dec": "-26° 29' 24.9",
            "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
            "storyDecoded": "Found star using https://www.google.com/sky/"
        }
    },
    "time": "1542010241",
    "previousBlockHash": "8bbd409d944fbb88f8e51b5d4f68894a4f2de1b951d9aeddae7ab9b4ea671b4c"
}
```

### `GET /stars/address:[address]`

Returns a JSON object with the full data of all blocks associated with the specified Bitcoin address

#### Parameters:

* `address` - a valid Bitcoin address [required]

#### Sample response:

```
[
    {
        "hash": "18bb77160333f41c23a45768871e3a73b35596c3ca6053ab7c2ccb78ae27439b",
        "height": 1,
        "body": {
            "address": "n2rRf5BoxKL1vA9o3QT7qLuEwxXeWSsHAh",
            "star": {
                "ra": "16h 29m 1.0s",
                "dec": "-26° 29' 24.9",
                "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
                "storyDecoded": "Found star using https://www.google.com/sky/"
            }
        },
        "time": "1542010241",
        "previousBlockHash": "8bbd409d944fbb88f8e51b5d4f68894a4f2de1b951d9aeddae7ab9b4ea671b4c"
    },
    {
        "hash": "846a3ec08bafa8ce33f6e9805ea33b0b361cb736ed2963793b68e051b17246ff",
        "height": 2,
        "body": {
            "address": "n2rRf5BoxKL1vA9o3QT7qLuEwxXeWSsHAh",
            "star": {
                "ra": "14h 29m 1.0s",
                "dec": "-20° 29' 24.9",
                "story": "416e6f746865722073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
                "storyDecoded": "Another star using https://www.google.com/sky/"
            }
        },
        "time": "1542012406",
        "previousBlockHash": "18bb77160333f41c23a45768871e3a73b35596c3ca6053ab7c2ccb78ae27439b"
    }
]
```

### `POST /requestValidation`

Submit a request to validate a given Bitcoin address (required to POST a block). Request expires after a `validationWindow` of 5 minutes.

#### Parameters:

* `address` - (str) A valid Bitcoin address [required]

#### Sample response:

Responds with JSON of the created request, including a `message` to be signed with the Bitcoin address.

```
{
    "address": "n2rRf5BoxKL1vA9o3QT7qLuEwxXeWSsHAh",
    "requestTimeStamp": "1542009835",
    "message": "n2rRf5BoxKL1vA9o3QT7qLuEwxXeWSsHAh:1542009835:starRegistry",
    "validationWindow": 300
}
```

### `POST /message-signature/validate`

Submit a signed message to validate ownership of a given Bitcoin address.

#### Parameters:

* `address` - (str) A valid Bitcoin address [required]
* `signature` - (str) The signed message validating ownership of the address [required]

#### Sample response:

Responds with JSON of the validated request

```
{
    "registerStar": true,
    "status": {
        "address": "n2rRf5BoxKL1vA9o3QT7qLuEwxXeWSsHAh",
        "requestTimeStamp": "1542020035",
        "message": "n2rRf5BoxKL1vA9o3QT7qLuEwxXeWSsHAh:1542020035:starRegistry",
        "validationWindow": 282,
        "messageSignatureStatus": "valid"
    }
}
```

### `POST /block`

Add a new block (star registration) to the end of the blockchain.

#### Parameters:

* `address` - (str) A valid Bitcoin address [required]
* `star` - (obj) The star to register, with the following parameters:
  * `ra` - (str) The star's "right ascension" value [required]
  * `dec` - (str) The star's "declination" value [required]
  * `story` - (str) A description of the star and its association with the registrant [required]
  * `mag` - (str) The star's "magnitude" value [optional]
  * `cons` - (str) The star's "constellation" [optional]

#### Sample response:

Responds with JSON of the created Block

```
{
    "hash": "84e44a88546234a885299134d141342e1099a9ee2184762ab60a56ce23b9da88",
    "height": 3,
    "body": {
        "address": "P2rRf5BoxKL1vA9o3QT7qLuEwxXeWSsHAh",
        "star": {
            "ra": "14h 29m 1.0s",
            "dec": "-20° 29' 24.9",
            "story": "416e6f746865722073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f"
        }
    },
    "time": "1542012441",
    "previousBlockHash": "846a3ec08bafa8ce33f6e9805ea33b0b361cb736ed2963793b68e051b17246ff"
}
```

## Using endpoints to create or read block data

You can use CURL statements or a program with a user interface such as Postman to GET or POST data to an endpoint.

Postman can be downloaded from https://www.getpostman.com/

CURL is a commandline tool for data transfer. Reference the documentation at: https://curl.haxx.se/


## Steps for adding a block (registering a star)

Once you submit the validation request in step 1, you will have 5 minutes to complete the entire process.

1. Submit a validation request for a Bitcoin address by using `POST /requestValidation`.
2. Sign the `message` received in the JSON response from step 1 with your Bitcoin private key, and submit to `POST /message-signature/validate`.
3. Register your star using `POST /block`.

NOTE: To sign a message, using a Bitcoin wallet, there are a few options, including:
* Use wallet software that allows for signing messages, e.g., Bitcoin Core (https://bitcoin.org/en/download)
* Use a programming library such as the Node.js package `bitcoinjs-message` (https://github.com/bitcoinjs/bitcoinjs-message)
