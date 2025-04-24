import { ethers, BigNumber } from 'ethers';
export interface Listing {
    nft: string;
    tokenId: BigNumber;
    price: BigNumber;
    duration: Number;
    amount: Number;
    isUsingVault: Boolean;
    isAuction: Boolean;
    isAntisnipe: Boolean;
    isFlashAuction: Boolean;
    isNSFW: Boolean;
    searchKeywords: string;
    donationAddress: string;
    donationPercent: Number;
}
export interface NewListing {
    marketplaceId: BigNumber;
    listing: Listing;
    seller: string;
    event?: ethers.Event;
}
export interface NewListingBatch {
    firstMarketplaceId: BigNumber;
    listings: Listing[];
    seller: string;
    event?: ethers.Event;
}
export interface Sold {
    marketplaceId: BigNumber;
    price: BigNumber;
    buyer: string;
    amount: Number;
    offerId: BigNumber;
    event?: ethers.Event;
}
export interface SaleFinished {
    marketplaceId: BigNumber;
    event?: ethers.Event;
}
export interface Cancelled {
    marketplaceId: BigNumber;
    event?: ethers.Event;
}
export interface PriceUpdate {
    marketplaceId: BigNumber;
    price: BigNumber;
    event?: ethers.Event;
}
export interface DurationExtended {
    marketplaceId: BigNumber;
    endTime: BigNumber;
    event?: ethers.Event;
}
export interface NewOffer {
    offerId: BigNumber;
    marketplaceId?: BigNumber;
    nft: string;
    tokenId: BigNumber;
    from: string;
    quantity: Number;
    price: BigNumber;
    expires: BigNumber;
    searchKeywords: string;
    event?: ethers.Event;
}
export interface OfferRemoved {
    offerId: BigNumber;
    event?: ethers.Event;
}
export interface OfferAccepted {
    offerId: BigNumber;
    nft: string;
    tokenId: BigNumber;
    quantity: BigNumber;
    marketplaceId: BigNumber;
    event?: ethers.Event;
}
export interface OfferUpdated {
    offerId: BigNumber;
    nft: string;
    tokenId: BigNumber;
    quantity: BigNumber;
    newPrice: BigNumber;
    expires: BigNumber;
    event?: ethers.Event;
}
export interface NewCollectionOffer {
    offerId: BigNumber;
    nft: string;
    from: string;
    quantity: Number;
    price: BigNumber;
    expires: BigNumber;
    searchKeywords: string;
}
export interface NewFilteredCollectionOffer {
    offerId: BigNumber;
    nft: string;
    tokenIds: Array<BigNumber>;
    from: string;
    quantity: BigNumber;
    price: BigNumber;
    prices: Array<BigNumber>;
    expires: BigNumber;
    searchKeywords: Array<string>;
}
export interface NewBid {
    marketplaceId: BigNumber;
    bidder: string;
    bid: BigNumber;
    nextMinimum: BigNumber;
    event?: ethers.Event;
}
export declare type SaleDetails = {
    nft: string;
    tokenId: BigNumber;
    endTime: Number;
    price: BigNumber;
    seller: string;
    isAuction: boolean;
    auctionStartTime: Number;
    highestBid: BigNumber;
    highestBidder: string;
    antisnipe: boolean;
    flashAuction: boolean;
    donationAddress: string;
    donationPercent: Number;
    amountRemaining: Number;
    vault: string;
};
