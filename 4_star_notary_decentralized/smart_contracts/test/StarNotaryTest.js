const StarNotary = artifacts.require('StarNotary')

contract('StarNotary', accounts => {

    let owner = accounts[0]
    let user1 = accounts[1]
    let user2 = accounts[2]
    let operator = accounts[3]
    let randomMaliciousUser = accounts[4]

    let name = 'awesome star!'
    let starStory = "this star was bought for my wife's birthday"
    let ra = "1"
    let dec = "1"
    let mag = "1"
    let starId = 1

    beforeEach(async function() {
        this.contract = await StarNotary.new({from: owner})
    })

    describe('creating a star', () => {
        it('can create a star and get its name', async function () {
            await this.contract.createStar(starId, name, starStory, ra, dec, mag, {from: user1})
            let starInfo = await this.contract.tokenIdToStarInfo(starId)

            assert.equal(starInfo[0], name)
        })

        describe('star info and event emission', () => {
            let tx

            beforeEach(async function () {
                tx = await this.contract.createStar(starId, name, starStory, ra, dec, mag, {from: user1})
            })

            it('ownerOf starId is user1', async function () {
                assert.equal(await this.contract.ownerOf(starId), user1)
            })

            it('balanceOf user1 is incremented by 1', async function () {
                let balance = await this.contract.balanceOf(user1)

                assert.equal(balance.toNumber(), 1)
            })

            it('emits the correct event during creation of a new token', async function () {
                assert.equal(tx.logs[0].event, 'Transfer')
            })
        })
    })

    describe('star uniqueness', () => {
        it('only unique stars can be minted', async function() {
            // first we mint our first star
            await this.contract.createStar(starId, name, starStory, ra, dec, mag, {from: user1})

            // then we try to mint the same star, and we expect an error
            await expectThrow(this.contract.createStar(starId, name, starStory, ra, dec, mag, {from: user2}))
        })

        it('only unique stars can be minted even if their ID is different', async function() {
            let newStarId = 2

            // first we mint our first star
            await this.contract.createStar(starId, name, starStory, ra, dec, mag, {from: user1})

            // then we try to mint the same star with new id, and we expect an error
            await expectThrow(this.contract.createStar(newStarId, name, starStory, ra, dec, mag, {from: user2}))
        })

        it('minting unique stars does not fail', async function() {
            for(let i = 0; i < 10; i ++) {
                let id = i
                let newRa = i.toString()
                let newDec = i.toString()
                let newMag = i.toString()

                await this.contract.createStar(id, name, starStory, newRa, newDec, newMag, {from: user1})
                let starInfo = await this.contract.tokenIdToStarInfo(id)

                assert.equal(starInfo[0], name)
            }
        })
    })

    describe('transfering stars', () => {
        let tx

        beforeEach(async function () {
            await this.contract.createStar(starId, name, starStory, ra, dec, mag, {from: user1})

            tx = await this.contract.transferFrom(user1, user2, starId, {from: user1})
        })

        it('star has new owner', async function () {
            assert.equal(await this.contract.ownerOf(starId), user2)
        })

        it('emits the correct event', async function () {
            assert.equal(tx.logs[0].event, 'Transfer')
        })

        it('only permissioned users can transfer star', async function() {
            await expectThrow(this.contract.transferFrom(user1, randomMaliciousUser, starId, {from: randomMaliciousUser}))
        })
    })

    describe('buying and selling stars', () => {

        let starPrice = web3.toWei(.01, "ether")

        beforeEach(async function () {
            await this.contract.createStar(starId, name, starStory, ra, dec, mag, {from: user1})
        })

        it('user1 can put up their star for sale', async function () {
            await this.contract.putStarUpForSale(starId, starPrice, {from: user1});

            assert.equal(await this.contract.starsForSale(starId), starPrice);
        })

        describe('user2 can buy a star that was put up for sale', () => {

            let pricePaid = web3.toWei(.05, "ether");

            beforeEach(async function () {
                await this.contract.putStarUpForSale(starId, starPrice, {from: user1})
            })

            it('user2 is the owner of the star after they buy it', async function() {
                await this.contract.buyStar(starId, {from: user2, value: pricePaid});

                assert.equal(await this.contract.ownerOf(starId), user2);
            })

            it('user2 ether balance changed correctly', async function () {

                const balanceBeforeTx = web3.eth.getBalance(user2);
                await this.contract.buyStar(starId, {from: user2, value: pricePaid, gasPrice: 0});
                const balanceAfterTx = web3.eth.getBalance(user2);

                assert.equal(balanceBeforeTx.sub(balanceAfterTx), starPrice);
            })
        })
    })

    describe('granting approval to transfer', () => {
        let tx

        beforeEach(async function () {
            await this.contract.createStar(starId, name, starStory, ra, dec, mag, {from: user1})

            tx = await this.contract.approve(user2, starId, {from: user1})
        })

        it('set user2 as an approved address', async function () {
            assert.equal(await this.contract.getApproved(starId), user2)
        })

        it('user2 can now transfer', async function () {
            await this.contract.transferFrom(user1, user2, starId, {from: user2})

            assert.equal(await this.contract.ownerOf(starId), user2)
        })

        it('emits the correct event', async function () {
            assert.equal(tx.logs[0].event, 'Approval')
        })
    })

    describe('setting an operator', () => {

        beforeEach(async function () {
            await this.contract.createStar(starId, name, starStory, ra, dec, mag, {from: user1})

            await this.contract.setApprovalForAll(operator, true, {from: user1})
        })

        it('can set an operator', async function () {
           assert.equal(await this.contract.isApprovedForAll(user1, operator), true)
        })
    })
})

var expectThrow = async function(promise) {
    try {
        await promise
    } catch (error) {
        assert.exists(error)
        return
    }

    assert.fail('expected an error, but none was found')
}
