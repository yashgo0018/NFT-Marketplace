//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/// @custom:security-contact yashgo0018@gmail.com
contract NFTMarketplace {
    using Counters for Counters.Counter;

    bytes4 private constant ERC721_INTERFACE_ID = 0x80ac58cd;
    bytes4 private constant ERC1155_INTERFACE_ID = 0xd9b67a26;

    Counters.Counter private _listingIdCounter;

    struct Listing {
        address contractAddress;
        uint256 tokenId;
        uint256 amount;
        address seller;
        address buyer;
        bool sold;
        bool active;
    }

    mapping(address => mapping(uint256 => uint256)) listingIds; // contractAddress => tokenId => listingId
    mapping(uint256 => Listing) listings; // listingId => listing

    event SellNFT(
        uint256 listingId,
        address contractAddress,
        uint256 tokenId,
        uint256 amount,
        address seller
    );
    event BuyNFT(
        uint256 listingId,
        address contractAddress,
        uint256 tokenId,
        uint256 amount,
        address seller,
        address buyer
    );

    event DeactivatedListing(uint256 listingId);

    constructor() {}

    function sell(
        address contractAddress,
        uint256 tokenId,
        uint256 amount
    ) public {
        require(
            IERC165(contractAddress).supportsInterface(ERC721_INTERFACE_ID),
            "The address is not of a erc721 contract"
        );
        IERC721 nftContract = IERC721(contractAddress);
        require(
            nftContract.ownerOf(tokenId) == msg.sender,
            "The token doesn't belong to the transaction sender"
        );
        require(
            nftContract.getApproved(tokenId) == address(this),
            "The token is not approved yet."
        );
        uint256 listingId = listingIds[contractAddress][tokenId];
        Listing memory listing = listings[listingId];
        require(
            listingId == 0 ||
                !listing.active ||
                listing.seller != msg.sender ||
                listing.sold,
            "The token is already listed"
        );
        listings[listingId].active = false;
        _listingIdCounter.increment();
        uint256 newListingId = _listingIdCounter.current();
        listings[newListingId] = Listing({
            contractAddress: contractAddress,
            tokenId: tokenId,
            amount: amount,
            seller: msg.sender,
            active: true,
            buyer: address(0),
            sold: false
        });
        emit SellNFT(
            newListingId,
            contractAddress,
            tokenId,
            amount,
            msg.sender
        );
    }

    function buy(address contractAddress, uint256 tokenId) public payable {
        uint256 listingId = listingIds[contractAddress][tokenId];
        buy(listingId);
    }

    function buy(uint256 listingId) public payable {
        require(listingId != 0, "Listing not found");
        Listing memory listing = listings[listingId];
        IERC721 nftContract = IERC721(listing.contractAddress);
        require(
            listing.active &&
                listing.seller == nftContract.ownerOf(listing.tokenId) &&
                nftContract.getApproved(listing.tokenId) == address(this),
            "Listing not found"
        );
        require(listing.seller != msg.sender, "You cannot buy your own token");
        require(listing.amount == msg.value, "Invalid Value");
        nftContract.transferFrom(listing.seller, msg.sender, listing.tokenId);
        listings[listingId].sold = true;
        listings[listingId].active = false;
        listings[listingId].buyer = msg.sender;
        emit BuyNFT(
            listingId,
            listing.contractAddress,
            listing.tokenId,
            listing.amount,
            listing.seller,
            msg.sender
        );
    }

    function deactivate(address contractAddress, uint256 tokenId) public {
        uint256 listingId = listingIds[contractAddress][tokenId];
        deactivate(listingId);
    }

    function deactivate(uint256 listingId) public {
        require(listings[listingId].active, "Listing not found");
        Listing memory listing = listings[listingId];
        IERC721 nftContract = IERC721(listing.contractAddress);
        require(
            listing.seller == msg.sender ||
                nftContract.ownerOf(listing.tokenId) == msg.sender,
            "You cannot deactivate this listing"
        );
        listings[listingId].active = false;
        emit DeactivatedListing(listingId);
    }
}
