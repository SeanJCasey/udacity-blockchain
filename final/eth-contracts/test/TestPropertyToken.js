const PropertyToken = artifacts.require('PropertyToken');

contract('TestPropertyToken', accounts => {

    const account_one = accounts[0];
    const account_two = accounts[1];

    describe('match erc721 spec', function () {
        beforeEach(async function () {
            this.contract = await PropertyToken.new({from: account_one});

            // TODO: mint multiple tokens
            this.contract.mint(account_one, 1, { from: account_one });
            this.contract.mint(account_two, 2, { from: account_one });
        })

        it('should return total supply', async function () {
            const totalSupply = await this.contract.totalSupply();
            assert.equal(totalSupply, 2, `Total supply should be 2, got ${totalSupply}`);
        })

        it('should get token balance', async function () {
            const tokenBalance = await this.contract.balanceOf(account_two);
            assert.equal(tokenBalance, 1, `Token balance should be 1, got ${tokenBalance}`);
        })

        // token uri should be complete i.e: https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/1
        it('should return token uri', async function () {
            const tokenURI = await this.contract.tokenURI(1);
            const expectedURI = "https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/1";
            assert.equal(tokenURI, expectedURI, `Unexpected token URI: ${tokenURI}`);
        })

        it('should transfer token from one owner to another', async function () {
            await this.contract.transferFrom(account_one, account_two, 1);
            const tokenBalance = await this.contract.balanceOf(account_two);
            assert.equal(tokenBalance, 2, `Token balance should be 2, got ${tokenBalance}`);
        })
    });

    describe('have ownership properties', function () {
        beforeEach(async function () {
            this.contract = await PropertyToken.new({from: account_one});
        })

        it('should fail when minting when address is not contract owner', async function () {
            let didThrow = false;
            try {
                await this.contract.mint(account_two, 1, { from: account_two });
            }
            catch(e) {
                didThrow = true;
            }
            assert.equal(didThrow, true, "Should have thrown error minting as user 2")
        })

        it('should return contract owner', async function () {
            const owner = await this.contract.getOwner();
            assert.equal(owner, account_one, "Account one should be owner");
        })

    });
})
