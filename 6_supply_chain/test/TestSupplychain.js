var SupplyChain = artifacts.require('SupplyChain')

contract('SupplyChain', function(accounts) {
    const upc = 1
    const sku = "vaccine001"
    const ownerID = accounts[0]
    const manufacturerID = accounts[1]
    const distributorID = accounts[2]
    const clinicID = accounts[3]
    const patientID = accounts[4]
    const emptyAddress = '0x00000000000000000000000000000000000000'

    ///Available Accounts
    ///==================
    ///(0) 0x27d8d15cbc94527cadf5ec14b69519ae23288b95
    ///(1) 0x018c2dabef4904ecbd7118350a0c54dbeae3549a
    ///(2) 0xce5144391b4ab80668965f2cc4f2cc102380ef0a
    ///(3) 0x460c31107dd048e34971e57da2f99f659add4f02
    ///(4) 0xd37b7b8c62be2fdde8daa9816483aebdbd356088
    ///(5) 0x27f184bdc0e7a931b507ddd689d76dba10514bcb
    ///(6) 0xfe0df793060c49edca5ac9c104dd8e3375349978
    ///(7) 0xbd58a85c96cc6727859d853086fe8560bc137632
    ///(8) 0xe07b5ee5f738b2f87f88b99aac9c64ff1e0c7917
    ///(9) 0xbd3ff2e3aded055244d66544c9c059fa0851da44

    console.log("ganache-cli accounts used here...")
    console.log("Contract Owner: accounts[0] ", accounts[0])
    console.log("Manufacturer: accounts[1] ", accounts[1])
    console.log("Distributor: accounts[2] ", accounts[2])
    console.log("Clinic: accounts[3] ", accounts[3])
    console.log("Patient: accounts[4] ", accounts[4])

    let supplyChain

    before(async () => {
        // Reset vars
        supplyChain = await SupplyChain.deployed()

        // Give roles to all participants in supply chain
        await supplyChain.addManufacturer(manufacturerID, { from: ownerID })
        await supplyChain.addDistributor(distributorID, { from: ownerID })
        await supplyChain.addClinic(clinicID, { from: ownerID })
        await supplyChain.addPatient(patientID, { from: ownerID })
    })

    describe("createItem", () => {
        it("allows a manufacturer to add a vaccine item", async() => {
            // Create item
            await supplyChain.createItem(sku, { from: manufacturerID })

            // Retrieve item
            const result = await supplyChain.fetchItem(upc)

            // Verify the result set
            assert.equal(result.sku_, sku, 'Error: Invalid item SKU')
            assert.equal(result.manufacturerID_, manufacturerID, 'Error: Missing or Invalid manufacturerID')
            assert.equal(result.state_, 0, 'Error: Invalid item State')

            // Check the event fired
            const event = 'Created'
            const eventLog = await supplyChain.getPastEvents(event, { fromBlock: 0, toBlock: 'latest' })
            assert.lengthOf(eventLog, 1, 'Event not emitted')
        })
    })

    describe("createOrderDist", () => {
        it("allows a distributor to order a vaccine item", async() => {
            // Order item (distributor)
            await supplyChain.createOrderDist(upc, { from: distributorID })

            // Retrieve item
            const result = await supplyChain.fetchItem(upc)

            // Verify the result set
            assert.equal(result.distributorID_, distributorID, 'Error: Missing or Invalid distributorID')
            assert.equal(result.state_, 1, 'Error: Invalid item State')

            // Check the event fired
            const event = 'OrderedDist'
            const eventLog = await supplyChain.getPastEvents(event, { fromBlock: 0, toBlock: 'latest' })
            assert.lengthOf(eventLog, 1, 'Event not emitted')
        })
    })

    describe("pickUpDist", () => {
        it("allows a distributor to pick up a vaccine order", async() => {
            // Pick up item (distributor)
            await supplyChain.pickUpDist(upc, { from: distributorID })

            // Retrieve item
            const result = await supplyChain.fetchItem(upc)

            // Verify the result set
            assert.equal(result.state_, 2, 'Error: Invalid item State')

            // Check the event fired
            const event = 'PickedUpDist'
            const eventLog = await supplyChain.getPastEvents(event, { fromBlock: 0, toBlock: 'latest' })
            assert.lengthOf(eventLog, 1, 'Event not emitted')
        })
    })

    describe("storeDist", () => {
        it("allows a distributor to mark a vaccine item as stored", async() => {
            // Pick up item (distributor)
            await supplyChain.storeDist(upc, { from: distributorID })

            // Retrieve item
            const result = await supplyChain.fetchItem(upc)

            // Verify the result set
            assert.equal(result.state_, 3, 'Error: Invalid item State')

            // Check the event fired
            const event = 'StoredDist'
            const eventLog = await supplyChain.getPastEvents(event, { fromBlock: 0, toBlock: 'latest' })
            assert.lengthOf(eventLog, 1, 'Event not emitted')
        })
    })

    describe("orderClinic", () => {
        it("allows a clinic to order a vaccine", async() => {
            // Pick up item (distributor)
            await supplyChain.orderClinic(upc, { from: clinicID })

            // Retrieve item
            const result = await supplyChain.fetchItem(upc)

            // Verify the result set
            assert.equal(result.clinicID_, clinicID, 'Error: Missing or Invalid clinicID')
            assert.equal(result.state_, 4, 'Error: Invalid item State')

            // Check the event fired
            const event = 'OrderedClinic'
            const eventLog = await supplyChain.getPastEvents(event, { fromBlock: 0, toBlock: 'latest' })
            assert.lengthOf(eventLog, 1, 'Event not emitted')
        })
    })

    describe("dispatchClinic", () => {
        it("allows a distributor to dispatch a vaccine to a clinic", async() => {
            // Pick up item (distributor)
            await supplyChain.dispatchClinic(upc, { from: distributorID })

            // Retrieve item
            const result = await supplyChain.fetchItem(upc)

            // Verify the result set
            assert.equal(result.state_, 5, 'Error: Invalid item State')

            // Check the event fired
            const event = 'DispatchedClinic'
            const eventLog = await supplyChain.getPastEvents(event, { fromBlock: 0, toBlock: 'latest' })
            assert.lengthOf(eventLog, 1, 'Event not emitted')
        })
    })

    describe("storeClinic", () => {
        it("allows a clinic to mark a vaccine as stored", async() => {
            // Pick up item (distributor)
            await supplyChain.storeClinic(upc, { from: clinicID })

            // Retrieve item
            const result = await supplyChain.fetchItem(upc)

            // Verify the result set
            assert.equal(result.state_, 6, 'Error: Invalid item State')

            // Check the event fired
            const event = 'StoredClinic'
            const eventLog = await supplyChain.getPastEvents(event, { fromBlock: 0, toBlock: 'latest' })
            assert.lengthOf(eventLog, 1, 'Event not emitted')
        })
    })

    describe("requestItem", () => {
        it("allows a patient to request a vaccine", async() => {
            // Pick up item (distributor)
            await supplyChain.requestItem(upc, { from: patientID })

            // Retrieve item
            const result = await supplyChain.fetchItem(upc)

            // Verify the result set
            assert.equal(result.patientID_, patientID, 'Error: Missing or Invalid clinicID')
            assert.equal(result.state_, 7, 'Error: Invalid item State')

            // Check the event fired
            const event = 'Requested'
            const eventLog = await supplyChain.getPastEvents(event, { fromBlock: 0, toBlock: 'latest' })
            assert.lengthOf(eventLog, 1, 'Event not emitted')
        })
    })

    describe("administerItem", () => {
        it("allows a clinic to administer a vaccine to a patient", async() => {
            // Pick up item (distributor)
            await supplyChain.administerItem(upc, { from: clinicID })

            // Retrieve item
            const result = await supplyChain.fetchItem(upc)

            // Verify the result set
            assert.equal(result.state_, 8, 'Error: Invalid item State')

            // Check the event fired
            const event = 'Administered'
            const eventLog = await supplyChain.getPastEvents(event, { fromBlock: 0, toBlock: 'latest' })
            assert.lengthOf(eventLog, 1, 'Event not emitted')
        })
    })

})
