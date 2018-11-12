const Boom = require('boom');
const SHA256 = require('crypto-js/sha256');
const simpleChain = require('./simpleChain.js');

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
        // this.initializeMockData();
        this.getBlockByHeight();
        this.postNewBlock();
    }

    /**
     * Implement a GET Endpoint to retrieve a block by index, url: "/api/block/:index"
     */
    getBlockByHeight() {
        this.server.route({
            method: 'GET',
            path: '/block/{blockheight}',
            handler: (request, h) => {
                return this.blockchain.getBlock(request.params.blockheight)
                    .catch((err) => {
                        throw Boom.badRequest(err);
                    });
            }
        });
    }

    /**
     * Implement a POST Endpoint to add a new Block, url: "/api/block"
     */
    postNewBlock() {
        this.server.route({
            method: 'POST',
            path: '/block',
            handler: (request, h) => {
                let blockBody = request.payload.body;
                if (!blockBody) {
                    throw Boom.badRequest("Blocks must have body text!");
                }
                return this.blockchain.addBlock(new simpleChain.Block(blockBody));
            }
        });
    }

    /**
     * Help method to inizialized Mock dataset, adds 10 test blocks to the blocks array
     */
    // initializeMockData() {
    //     if(this.blocks.length === 0){
    //         for (let index = 0; index < 10; index++) {
    //             let blockAux = new BlockClass.Block(`Test Data #${index}`);
    //             blockAux.height = index;
    //             blockAux.hash = SHA256(JSON.stringify(blockAux)).toString();
    //             this.blocks.push(blockAux);
    //         }
    //     }
    // }


}

/**
 * Exporting the BlockController class
 * @param {*} server
 */
module.exports = (server) => { return new BlockController(server);}
