// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LicenseNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;
    uint256 public mintingFee;
    mapping(string => bool) private usedHashes;

    event NFTMinted(address indexed recipient, uint256 tokenId, string metadataURI);

    constructor(uint256 _mintingFee) ERC721("LicenseNFT", "LNFT") Ownable(msg.sender) {
        mintingFee = _mintingFee;
        _tokenIdCounter = 0;
    }

    function mintNFT(string memory metadataURI, string memory uniqueHash) public payable returns (uint256) {
        require(msg.value >= mintingFee, "Insufficient ETH for minting");
        require(!usedHashes[uniqueHash], "NFT already exists for this document");

        unchecked{_tokenIdCounter++;}
        uint256 newTokenId = _tokenIdCounter;

        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, metadataURI);
        usedHashes[uniqueHash] = true;

        emit NFTMinted(msg.sender, newTokenId, metadataURI);

        return newTokenId;
    }

    function setMintingFee(uint256 newFee) external onlyOwner {
        mintingFee = newFee;
    }

    function withdrawFunds() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}