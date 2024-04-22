import { ethers, BigNumber } from 'ethers';
export interface BundleBase {
    marketplaceId: BigNumber;
    nfts: Array<string>;
    tokenIds: Array<BigNumber>;
    amountBatches: Array<BigNumber>;
}
export interface BundlePriced extends BundleBase {
    amount: BigNumber;
    pricePerUnit: BigNumber;
    priceTotal: BigNumber;
}
export interface Base {
    marketplaceId: BigNumber;
    nft: string;
    tokenID: BigNumber;
    amountPerBundleUnit: BigNumber;
}
export interface Priced extends Base {
    amount: BigNumber;
    pricePerUnit: BigNumber;
    priceTotal: BigNumber;
}
interface NewListingBase {
    duration: BigNumber;
    isAuction: boolean;
    isNSFW: boolean;
    seller: string;
    antisnipe: boolean;
    flashAuction: boolean;
}
export interface NewBundleListing extends BundlePriced, NewListingBase {
    event?: ethers.Event;
}
export interface NewListing extends Priced, NewListingBase {
    event?: ethers.Event;
}
interface SoldBase {
    buyer: string;
    seller: string;
    offerId: BigNumber;
}
export interface BundleSold extends BundlePriced, SoldBase {
    event?: ethers.Event;
}
export interface Sold extends Priced, SoldBase {
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
export interface StartDelayed {
    marketplaceId: BigNumber;
    startTime: BigNumber;
    event?: ethers.Event;
}
export interface DurationExtended {
    marketplaceId: BigNumber;
    endTime: BigNumber;
    event?: ethers.Event;
}
export interface NewOfferBase {
    marketplaceId?: BigNumber;
    offerId: BigNumber;
    from: string;
    expires: BigNumber;
    price: BigNumber;
    quantity: BigNumber;
}
export interface NewBundleOffer extends NewOfferBase {
    nfts: Array<string>;
    tokenIds: Array<BigNumber>;
    event?: ethers.Event;
}
export interface NewOffer extends NewOfferBase {
    nft: string;
    tokenID: BigNumber;
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
    quantity: BigNumber;
    price: BigNumber;
    expires: BigNumber;
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
}
export interface NewBid {
    marketplaceId: BigNumber;
    bidder: string;
    bid: BigNumber;
    nextMinimum: BigNumber;
    event?: ethers.Event;
}
export type SaleDetails = {
    nfts: Array<string>;
    tokenIds: Array<BigNumber>;
    amountBatches: Array<BigNumber>;
    seller: string;
    price: BigNumber;
    startTime: BigNumber;
    endTime: BigNumber;
    maxBid: BigNumber;
    maxBidder: string;
    isAuction: boolean;
    amount: BigNumber;
    amountRemaining: BigNumber;
    paymentToken: string;
    complete: boolean;
    devFeePercentage: BigNumber;
    devFeeFNFTPercentage: BigNumber;
    vault: string;
};
export {};
