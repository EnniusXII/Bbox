// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract GreenCardHashes {
  struct GreenCard {
    string hash;
    uint256 timestamp;
  }

  mapping(string => GreenCard) private greenCards;

  event HashStored(string id, string hash, uint256 timestamp);

  function storeHash(string memory id, string memory hash) public {
    require(bytes(greenCards[id].hash).length == 0, 'Hash already exists.');
    require(bytes(hash).length > 0, 'Hash cannot be empty.');

    uint256 timestamp = block.timestamp;

    greenCards[id] = GreenCard({
      hash: hash,
      timestamp: timestamp
    });

    emit HashStored(id, hash, timestamp);
  }

  function getHash(string memory id) public view returns (string memory, uint256) {
    require(bytes(greenCards[id].hash).length > 0, 'Hash does not exist.');

    GreenCard memory card = greenCards[id];
    return (card.hash, card.timestamp);
  }

  function verifyHash(string memory id, string memory hash) public view returns (bool) {
    require(bytes(greenCards[id].hash).length > 0, 'Hash not found for this ID.');
    return keccak256(abi.encodePacked(greenCards[id].hash)) == keccak256(abi.encodePacked(hash));
  }
}