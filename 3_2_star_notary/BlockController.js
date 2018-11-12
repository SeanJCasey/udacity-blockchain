const Boom = require('boom');
const SHA256 = require('crypto-js/sha256');
const simpleChain = require('./simpleChain.js');

/* ==== Sign and verify messages with bitcoinjs-message ====*/
const bitcoin = require('bitcoinjs-lib');
const bitcoinMessage = require('bitcoinjs-message');

/**
 * Controller Definition to encapsulate routes to work with blocks
 */
class BlockController {

    /**
     * Constructor to create a new BlockController, you need to initialize here all your endpoints
     * @param {*} server
     */
    constructor(server) {
        this.server = server;
        this.blockchain = new simpleChain.Blockchain();
        this.validationRequests = [];
        this.postValidationRequest();
        this.postValidationSignature();
        this.postNewBlock();
        this.getBlockByHeight();
        this.getBlockByAddress();
        this.getBlockByHash();
    }

    /**
     * Implement a POST Endpoint to request validation of a Bitcoin address
     */
    postValidationRequest() {
        this.server.route({
            method: 'POST',
            path: '/requestValidation',
            handler: (request, h) => {
                let address = request.payload.address;
                // THrow error if there is no address in paylaod
                if (!address) {
                    throw Boom.badRequest("Must submit a Bitcoin address!");
                }
                // Associate request timestamp with address in backend
                let timestamp = new Date().getTime().toString().slice(0,-3);
                let validationWindow = 300

                // If request exists for address, update validationWindow, or renew if expired
                if (this.validationRequests[address]) {
                    validationWindow = 300 - (Number(timestamp) - Number(this.validationRequests[address].requestTimeStamp));
                    if (validationWindow < 0) {
                        this.validationRequests[address].requestTimeStamp = timestamp;
                    }
                }
                // If no request exists for address, add to memory
                else {
                    this.validationRequests[address] = {
                        "requestTimeStamp": timestamp,
                        "registerStar": false
                    }
                }

                // return the request with the message to sign
                return {
                    "address": address,
                    "requestTimeStamp": this.validationRequests[address].requestTimeStamp,
                    "message": address + ":" + this.validationRequests[address].requestTimeStamp + ":starRegistry",
                    "validationWindow": validationWindow
                };
            }
        });
    }

    /**
     * Implement a POST Endpoint to validate a signed message for a Bitcoin address
     */
    postValidationSignature() {
        this.server.route({
            method: 'POST',
            path: '/message-signature/validate',
            handler: (request, h) => {
                let address = request.payload.address;
                let signature = request.payload.signature;
                let timestamp = new Date().getTime().toString().slice(0,-3);

                // Verify that the payload has an address and signature
                if (!address) {
                    throw Boom.badRequest("Must submit a Bitcoin address!");
                }
                if (!signature) {
                    throw Boom.badRequest("Must submit a signed message to validate the Bitcoin address!");
                }

                // Get the stored validation request for this address
                let validationRequest = this.validationRequests[address];
                if (!validationRequest) {
                    throw Boom.badRequest("Submit a validation request for this address first via /requestValidation");
                }

                // Check if the validation window has passed
                let validationWindow = 300 - (Number(timestamp) - Number(validationRequest.requestTimeStamp));
                // If window expired, remove validation request from memory and throw error
                if (validationWindow < 0) {
                    this.validationRequests = this.validationRequests.splice(this.validationRequests.indexOf(address), 1);
                    throw Boom.badRequest("The time limit for the request has expired. Please submit a new request.");
                }

                // Check signed message against validation request
                let message = address + ":" + validationRequest.requestTimeStamp + ":starRegistry";
                let validSignature = bitcoinMessage.verify(message, address, signature);
                if (!validSignature) {
                    throw Boom.badRequest("The signature cannot be verified for this address and message.");
                }

                // Grant permission to register a star
                this.validationRequests[address].registerStar = true


                return {
                    "registerStar": true,
                    "status": {
                        "address": address,
                        "requestTimeStamp": validationRequest.requestTimeStamp,
                        "message": message,
                        "validationWindow": validationWindow,
                        "messageSignatureStatus": "valid",
                    }
                }
            }
        });
    }

    /**
     * Implement a POST Endpoint to add a new Block, url: "/block"
     */
    postNewBlock() {
        this.server.route({
            method: 'POST',
            path: '/block',
            handler: (request, h) => {
                let address = request.payload.address;

                // Require Bitcoin address
                if (!address) {
                    throw Boom.badRequest("Must submit a Bitcoin address!");
                }

                // Get the stored validation request for this address
                let validationRequest = this.validationRequests[address];
                if (!validationRequest) {
                    throw Boom.badRequest("Submit a validation request for this address first via /requestValidation");
                }

                // Check if the validation window has passed
                let timestamp = new Date().getTime().toString().slice(0,-3);
                let validationWindow = 300 - (Number(timestamp) - Number(validationRequest.requestTimeStamp));
                // If window expired, remove validation request from memory and throw error
                if (validationWindow < 0) {
                    this.validationRequests = this.validationRequests.splice(this.validationRequests.indexOf(address), 1);
                    throw Boom.badRequest("The time limit for the request has expired. Please submit a new request.");
                }

                // Check if the address has permission to register a star
                if (!validationRequest.registerStar) {
                    throw Boom.badRequest("You must first sign the message provided at /requestValidation.");
                }


                let ra = request.payload.star.ra;
                let dec = request.payload.star.dec;
                let story = request.payload.star.story;

                // Require star object with ra, dec, and story
                if (!ra || !dec || !story) {
                    throw Boom.badRequest("Blocks must include 'star' object with 'ra', 'dec', and 'story'.")
                }

                // Throw error if story is over 500 bytes
                if (Buffer.byteLength(story) > 500) {
                    throw Boom.badRequest("Story length exceeds limit of 500 bytes (about 250 words), please reduce.");
                }

                // Create block body from params, with story encoded as hex string
                let blockBody = {
                    "address": address,
                    "star": {
                        "ra": ra,
                        "dec": dec,
                        "story": new Buffer(story).toString('hex')
                    }
                };

                // Add optional star params if included
                if (request.payload.star.mag) {
                    blockBody.star.mag = request.payload.star.mag;
                }
                if (request.payload.star.cons) {
                    blockBody.star.cons = request.payload.star.cons;
                }

                // Create the block and remove the validation request for the address
                return this.blockchain.addBlock(new simpleChain.Block(blockBody)).then((block) =>{
                    this.validationRequests = this.validationRequests.splice(this.validationRequests.indexOf(address), 1);
                    return block;
                });
            }
        });
    }


    /**
     * Implement a GET Endpoint to retrieve a block by blockheight, url: "/block/[BLOCKHEIGHT]"
     */
    getBlockByHeight() {
        this.server.route({
            method: 'GET',
            path: '/block/{blockheight}',
            handler: (request, h) => {
                return this.blockchain.getBlock(request.params.blockheight).then((block) => {
                        block.body.star.storyDecoded = new Buffer(block.body.star.story, 'hex').toString('ascii');
                        return block;
                    })
                    .catch((err) => {
                        throw Boom.badRequest(err);
                    });
            }
        });
    }

    /**
     * Implement a GET Endpoint to retrieve a block by hash, url: "/stars/hash:[HASH]"
     */
    getBlockByHash() {
        this.server.route({
            method: 'GET',
            path: '/stars/hash:{hash}',
            handler: (request, h) => {
                return this.blockchain.getBlockByHash(request.params.hash).then((block) => {
                        if (block == null) {
                            throw Boom.badRequest('No block found for hash');
                        }
                        block.body.star.storyDecoded = new Buffer(block.body.star.story, 'hex').toString('ascii');
                        return block;
                    })
                    .catch((err) => {
                        throw Boom.badRequest(err);
                    });
            }
        });
    }

    /**
     * Implement a GET Endpoint to retrieve a block by Bitcoin address, url: "/stars/address:[ADDRESS]"
     */
    getBlockByAddress() {
        this.server.route({
            method: 'GET',
            path: '/stars/address:{address}',
            handler: (request, h) => {
                return this.blockchain.getAllBlocksForAddress(request.params.address).then((blocks) => {
                        blocks.forEach((block) => {
                            block.body.star.storyDecoded = new Buffer(block.body.star.story, 'hex').toString('ascii');
                        })
                        return blocks;
                    })
                    .catch((err) => {
                        throw Boom.badRequest(err);
                    });
            }
        });
    }

}

/**
 * Exporting the BlockController class
 * @param {*} server
 */
module.exports = (server) => { return new BlockController(server);}
