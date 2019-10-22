// Test if a new solution can be added for contract - SolnSquareVerifier

// Test if an ERC721 token can be minted for contract - SolnSquareVerifier
const SquareVerifier = artifacts.require('SquareVerifier');
const SolnSquareVerifier = artifacts.require('SolnSquareVerifier');

contract('TestSolnSquareVerifier', accounts => {
    const correctProof = {
        "proof": {
            "a": ["0x205b91fd61ac55ad3c548d5557983c6915ec2d8d9879e96391bc2c029c609058", "0x202cf37ed8933e5e47bc567822bd4f5d72b7fcfc5d6f45420d97b787c90f144d"],
            "b": [["0x189aeff049fdbf297b88e2c205e81d1eeb85bd4302630bac6d8bc8d9bb627e9f", "0x016be656ceae395ae8eefec81e3f4c261eb65b8b54366c170fb69470a5fdde5a"], ["0x1421c93a62ed7cbf20e92dc07de84e25bf656e818b57c0a30cf9d48579039ac7", "0x2a8089f1f5bf395c88bcf71e3474c2bc3f6cd9a5f788d031a2218958a6252b55"]],
            "c": ["0x29f77139892a0bb9010a5dc3edbd7487f2d1bffa0107f28c29ddc2f20c4cc109", "0x2c1f149723bedfc09617995e0cdf0c0ae01d82173942264513bee10d9e42cd25"]
        },
        "inputs": ["0x0000000000000000000000000000000000000000000000000000000000000009", "0x0000000000000000000000000000000000000000000000000000000000000001"]
    };

    beforeEach(async function () {
        this.contract = await SolnSquareVerifier.new(SquareVerifier.address);
    });

    it('should only allow a correct proof to be used once to mint', async function () {
        await this.contract.solnMint(
            1,
            correctProof.proof.a,
            correctProof.proof.b,
            correctProof.proof.c,
            correctProof.inputs,
            { from: accounts[1] }
        );

        let didThrow = false;
        try {
            await this.contract.solnMint(
                2,
                correctProof.proof.a,
                correctProof.proof.b,
                correctProof.proof.c,
                correctProof.inputs,
                { from: accounts[1] }
            );
        }
        catch(e) {
            didThrow = true;
        }
        assert.equal(didThrow, true, "Should not allow use of non-unique proof");
    });
});
