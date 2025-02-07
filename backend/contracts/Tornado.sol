// SPDX-License-Identifier: NONE
pragma solidity 0.8.17;

import "./MiMC5Sponge.sol";
import "./ReentrancyGuard.sol";

interface IVerifier {
    function verifyProof(uint[2] memory a, uint[2][2] memory b, uint[2] memory c, uint[3] memory input) external;
}


contract Tornado is ReentrancyGuard {
    address verifier;
    Hasher hasher;

    uint8 public treeLevel = 10;
    uint256 public denomination = 1 ether;
    uint256 public nextLeafIdx = 0;

    mapping(uint256 => bool) public roots;
    mapping(uint8 => uint256) public lastLevelHash;
    mapping(uint256 => bool) public nullifierHashes;
    mapping(uint256 => bool) public commitments;

    uint256[10] levelDefaults = [
        5618203191561475783470389268518328518436211972172130011484123825558089591576,
        63197527171086731149740468619757138022791498856965120989244121588573074471701,
        84341321664726273975750051192500670489739597557331749469318059801149891334435,
        61748136905431338513607032169950758383018147837602611646417582513059711752786,
        40596998102049439765939542775343145285678923795174752453022346765131747680041,
        106487826012854703018885230685749055494028486476172960147205454797973483247581,
        10858339477488093881985248747144952129272070631797706762553146316509023597259,
        114729409938259036928694643329602589771273593085881840057333583184748689599724,
        106901836125062929055934121864495805832803660073083554635754592539377654988382,
        13009564376940514602561792081671572729005260230372879217879605823165190931581
    ];

    event Deposit(uint256 root, uint256[10] hashPairings, uint8[10] pairDirection);
    event Withdrawal(address to, uint256 nullifierHash);

    constructor(
        address _hasher,
        address _verifier
    ) {
        hasher = Hasher(_hasher);
        verifier = _verifier;
    }

    function deposit(uint256 _commitment) external payable nonReentrant {
        require(msg.value == denomination, "incorrect-amount");
        require(!commitments[_commitment], "duplicate-commitment-hash");
        require(nextLeafIdx < 2 ** treeLevel, "tree-full");

        uint256 newRoot;
        uint256[10] memory hashPairings;
        uint8[10] memory hashDirections;

        uint256 currentIdx = nextLeafIdx;
        uint256 currentHash = _commitment;

        uint256 left;
        uint256 right;
        uint256[2] memory ins;

        for (uint8 i = 0; i < treeLevel; i++) {
            lastLevelHash[treeLevel] = currentHash;

            if (currentIdx % 2 == 0) {
                left = currentHash;
                right = levelDefaults[i];
                hashPairings[i] = levelDefaults[i];
                hashDirections[i] = 0;
            } else {
                left = lastLevelHash[i];
                right = currentHash;
                hashPairings[i] = lastLevelHash[i];
                hashDirections[i] = 1;
            }

            ins[0] = left;
            ins[1] = right;

            (uint256 h) = hasher.MiMC5Sponge{ gas: 150000 }(ins, _commitment);

            currentHash = h;
            currentIdx = currentIdx / 2;
        }

        newRoot = currentHash;
        roots[newRoot] = true;
        nextLeafIdx += 1;

        commitments[_commitment] = true;
        emit Deposit(newRoot, hashPairings, hashDirections);
    }

    function withdraw(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[2] memory input
    ) external payable nonReentrant {
        uint256 _root = input[0];
        uint256 _nullifierHash = input[1];

        require(!nullifierHashes[_nullifierHash], "already-spent");
        require(roots[_root], "not-root");

        uint256 _addr = uint256(uint160(msg.sender));

        (bool verifyOK, ) = verifier.call(abi.encodeCall(IVerifier.verifyProof, (a, b, c, [_root, _nullifierHash, _addr])));
        require(verifyOK, "invalid-proof");

        nullifierHashes[_nullifierHash] = true;
        address payable target = payable(msg.sender);

        (bool ok, ) = target.call{value: denomination}("");
        
        require(ok, "payment-failed");

        emit Withdrawal(msg.sender, _nullifierHash);
    }

    
}