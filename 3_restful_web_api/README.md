# Project 3 - RESTful Web API with Node.js Framework

This project provides API endpoints to retrieve and add new block data to the private blockchain from Project 2. Some slight modifications have been made to the code from Project 2 in order to get the desired functionality and error handling.


## Endpoints

The API has the following endpoints:

### `GET /block/[blockheight]`

Returns a JSON object with the full data of a specified block

Parameters:

* `blockheight` - the height of the desired block [required]

### `POST /block`

Add a new block to the end of the blockchain

Expects a JSON object with the following parameters:

* `body` - (str) A string for the body of the block [required]


