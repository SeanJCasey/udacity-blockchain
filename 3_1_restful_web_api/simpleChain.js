/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/
const SHA256 = require('crypto-js/sha256');

/* ===== DB management with Level ==========================*/
const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);

/* ===== Block Class ==============================
|  Class with a constructor for block          |
|  ===============================================*/

class Block {
  constructor(data) {
    this.hash = "",
    this.height = 0,
    this.body = data,
    this.time = 0,
    this.previousBlockHash = ""
  }
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain    |
|  ================================================*/

class Blockchain {
  constructor() {
    this.addBlock(new Block("First block in the chain - Genesis block"), true);
  }

  // Add new block
  addBlock(newBlock, isGenesis = false) {
    return this.getBlockHeight().then((previousBlockHeight) => {
      // Create genesis block if none exists, and don't allow new Genesis block if one exists
      if (previousBlockHeight == -1) {
        // Return the stored genesisBlock if newBlock was intended as the genesis block
        if (isGenesis) {
          newBlock.time = new Date().getTime().toString().slice(0,-3);
          return this.hashAndWriteBlock(newBlock);
        }
        // Else, create a genesis block and proceed to newBlock
        let genesisBlock = new Block("First block in the chain - Genesis block");
        genesisBlock.time = new Date().getTime().toString().slice(0,-3);
        this.hashAndWriteBlock(genesisBlock);
        previousBlockHeight = genesisBlock.height;
      }
      // Just return the original genesis block if a genesis block is being created for an existing chain
      if (isGenesis && previousBlockHeight != -1) {
        return this.getBlock(previousBlockHeight)
      }

      return this.getBlock(previousBlockHeight).then((previousBlock) => {
        // Block height
        newBlock.height = previousBlock.height + 1;
        // UTC timestamp
        newBlock.time = new Date().getTime().toString().slice(0,-3);
        // previous block hash
        newBlock.previousBlockHash = previousBlock.hash;
        return this.hashAndWriteBlock(newBlock);
      }).catch((error) => {
        console.log(error);
      });
    }).catch((error) => {
      console.log(error);
    });
  }

  // Hash and write block
  hashAndWriteBlock(newBlock) {
    // Block hash with SHA256 using newBlock and converting to a string
    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
    addLevelDBData(newBlock.height, JSON.stringify(newBlock).toString());
    return newBlock;
  }

  // Get block height
  getBlockHeight() {
    return getAllKeys().then((keysArray) => {
      if (keysArray.length) {
        return Math.max(...keysArray);
      }
      return -1;
    });
  }

  // get block
  getBlock(blockHeight) {
    return getLevelDBData(blockHeight).then((data) => {
      return JSON.parse(data);
    }).catch((error) => {
      throw new Error('Block does not exist with height '+blockHeight);
    });
  }

  // validate block
  validateBlock(blockHeight) {
    return this.getBlock(blockHeight).then((block) => {
      // get block hash
      let blockHash = block.hash;
      // remove block hash to test block integrity
      block.hash = '';
      // generate block hash
      let validBlockHash = SHA256(JSON.stringify(block)).toString();
      // Compare
      if (blockHash === validBlockHash) {
        console.log('Block #'+blockHeight+' validated!');
        return true;
      }
      else {
        console.log('Block #'+blockHeight+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
        return false;
      }
    }).catch((error) => {
      console.log(error);
    });
  }
  validateBlockInChain(blockHeight, maxBlockHeight) {
    let validationPromises = []

    // Validate block
    let promise1 = this.validateBlock(blockHeight).then((isValid) => {
      if (!isValid) {
        return false;
      }
      return true;
    }).catch((error) => {
      console.log(error);
    });
    validationPromises.push(promise1)
    // compare blocks hash link
    if (blockHeight < maxBlockHeight) {
      console.log('blockHeight: '+blockHeight);
      let blockHashPromise = this.getBlock(blockHeight).then((block) => {
        return block.hash;
      });
      let previousHashPromise = this.getBlock(blockHeight+1).then((nextBlock) => {
        return nextBlock.previousBlockHash;
      });
      let promise2 = Promise.all([blockHashPromise, previousHashPromise]).then((hashes) => {
        if (hashes[0]!==hashes[1]) {
          console.log('Block #'+blockHeight+' hash NOT validated against next block!');
          return false;
        }
        console.log('Block #'+blockHeight+' hash validated against next block!');
        return true;
      });
      validationPromises.push(promise2)
    }

    return Promise.all(validationPromises).then((validations) => {
      let isValid = true;
      validations.forEach((validation) => {
        if (!validation) {
          isValid = false;
        }
      });
      return [blockHeight, isValid];
    });
  }
  // Validate blockchain
  validateChain() {
    getAllKeys().then((keysArray) => {
      let maxBlockHeight = Math.max(...keysArray);
      let promises = [];

      keysArray.forEach((key) => {
        promises.push(this.validateBlockInChain(key, maxBlockHeight));
      });

      Promise.all(promises).then((results) => {
        let errorLog = [];
        results.forEach(([key, isValid]) => {
          if (!isValid) {
            errorLog.push(key);
          }
        });
        return errorLog;
      }).then((errorLog) => {
        if (errorLog.length>0) {
          console.log('Block errors = ' + errorLog.length);
          console.log('Blocks: '+errorLog);
        }
        else {
          console.log('No errors detected');
        }
      });
    });
  }
}


// Add data to levelDB with key/value pair
function addLevelDBData(key, value) {
  db.put(key, value, function(err) {
    if (err) return console.log('Block ' + key + ' submission failed', err);
    return console.log('added Block #'+key);
  })
}

// Get data from levelDB with key
function getLevelDBData(key) {
  return new Promise((resolve, reject) => {
    db.get(key, function(err, value) {
      if (err) {
        console.log('Not found!', err);
        reject(err);
      };
      resolve(value);
    });
  });
}

// Add data to levelDB with value
// function addDataToLevelDB(value) {
//   let i = 0;
//   db.createReadStream().on('data', function(data) {
//     i++;
//     }).on('error', function(err) {
//         return console.log('Unable to read data stream!', err)
//     }).on('close', function() {
//     console.log('Block #' + i);
//     addLevelDBData(i, value);
//   });
// }

// Get array of keys
function getAllKeys() {
  return new Promise((resolve, reject) => {
    let keysArray = []
    db.createKeyStream()
      .on('data', function (data) {
        keysArray.push(Number(data));
      })
      .on('error', function (err) {
        reject(err);
      })
      .on('close', function () {
        resolve(keysArray);
      });
    });
}

module.exports.Block = Block;
module.exports.Blockchain = Blockchain;
