pragma solidity >=0.4.21 <0.6.0;

import './PropertyToken.sol';

contract SolnSquareVerifier is PropertyToken {

    ISquareVerifier squareVerifier;

    mapping(bytes32 => bool) solutionsUsed;

    event SolutionAdded(bytes32 hash);

    constructor(address squareVerifierAddress) public {
        squareVerifier = ISquareVerifier(squareVerifierAddress);
    }

    function addSolution(bytes32 hash) internal {
        solutionsUsed[hash] = true;

        emit SolutionAdded(hash);
    }

    function solnMint(
        uint256 tokenId,
        uint[2] calldata a,
        uint[2][2] calldata b,
        uint[2] calldata c,
        uint[2] calldata input
    ) external {
        // Confirm solution has not been used
        bytes32 hash = keccak256(abi.encodePacked(a, b, c, input));
        require(solutionsUsed[hash] == false, "Proof has been used");

        // Confirm solution is correct
        bool isVerified = squareVerifier.verifyTx(a, b, c, input);
        require(isVerified, "Proof was incorrect");

        // Mark solution as used
        addSolution(hash);

        // Mint token
        _mint(msg.sender, tokenId);
    }

}

interface ISquareVerifier {
    function verifyTx(
        uint[2] calldata a,
        uint[2][2] calldata b,
        uint[2] calldata c,
        uint[2] calldata input
    )
        external
        returns (bool);
}
