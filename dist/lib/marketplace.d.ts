import { ethers } from 'ethers';
import * as V1 from './marketplaceTypes';
export declare const MarketplaceABI: ethers.ContractInterface;
export declare const MarketplaceAddress = "0xeb8E5876Eb79c628929944dDf3521Ad893d57827";
export declare class MarketplaceV1 {
    contract: ethers.Contract;
    /**
     * @param providerOrSigner an ethers compatible provider or signer https://docs.ethers.io/v5/api/providers/
     * @param address if given, overrides the default marketplace contract address
     */
    constructor(providerOrSigner: ethers.providers.Provider | ethers.Signer, address?: string);
    handleNewListing(args: any, event: any): V1.NewListing;
    /**
     * @param callback called for new listings, as individual NFTs
     */
    onNewListing(callback: (sale: V1.NewListing) => void): void;
    handleNewListingBatch(args: any, event: any): V1.NewListingBatch;
    /**
     * @param callback called for new listings as a batch, as individual NFTs
     */
    onNewListingBatch(callback: (sales: V1.NewListingBatch) => void): void;
    handleSold(args: any, event: any): V1.Sold;
    /**
     * @param callback called for successfuly sold items, as individual NFTs
     */
    onSold(callback: (sale: V1.Sold) => void): void;
    handleFinished(args: any, event: any): V1.SaleFinished;
    /**
     * @param callback called for finished sales
     * @note does not provide cancelled sales
     * @note sale may have been successful or not
     */
    onFinished(callback: (sale: V1.SaleFinished) => void): void;
    handleCancelled(args: any, event: any): V1.Cancelled;
    /**
     * @param callback called for cancelled sales
     */
    onCancelled(callback: (bundle: V1.Cancelled) => void): void;
    handlePriceUpdate(args: any, event: any): V1.PriceUpdate;
    /**
     * @param callback called for price updates to sales
     */
    onPriceUpdate(callback: (bundle: V1.PriceUpdate) => void): void;
    handleDurationExtended(args: any, event: any): V1.DurationExtended;
    /**
     * @param callback called when sales are extended
     */
    onDurationExtended(callback: (sale: V1.DurationExtended) => void): void;
    handleNewBid(args: any, event: any): V1.NewBid;
    /**
     * @param callback called for new bids on auctions
     * @note a new bid refunds the previously highest bid
     */
    onNewBid(callback: (bid: V1.NewBid) => void): void;
    handleNewOffer(args: any, event: any): [V1.NewOffer, boolean];
    /**
     * @param callback called for new offers, as bundles
     */
    onNewOffer(callback: (offer: V1.NewOffer, isSaleOffer: boolean) => void): void;
    handleOfferRemoved(args: any, event: any): V1.OfferRemoved;
    /**
     * @param callback called for removed offers
     */
    onOfferRemoved(callback: (offer: V1.OfferRemoved) => void): void;
    handleOfferAccepted(args: any, event: any): V1.OfferAccepted;
    /**
     * @param callback called for accepted offers
     */
    onOfferAccepted(callback: (offer: V1.OfferAccepted) => void): void;
    handleOfferUpdated(args: any, event: any): V1.OfferUpdated;
    /**
     * @param callback called for updated offers
     */
    onOfferUpdated(callback: (offer: V1.OfferUpdated) => void): void;
    handleNewCollectionOffer(args: any, event: any): V1.NewCollectionOffer;
    /**
     * @param callback called for new collection offers
     */
    onNewCollectionOffer(callback: (offer: V1.NewCollectionOffer) => void): void;
    handleNewFilteredCollectionOffer(args: any, event: any): V1.NewFilteredCollectionOffer;
    /**
     * @param callback called for new filtered collection offers, i.e., on specific tokenIDs
     */
    onNewFilteredCollectionOffer(callback: (offer: V1.NewFilteredCollectionOffer) => void): void;
    /**
     * @param marketplaceId the sale ID for which to grab details. The one that goes into https://paintswap.finance/marketplace/<ID>
     * @returns a SaleDetails objects with details about this sale
     */
    getSaleDetails(marketplaceId: ethers.BigNumber): Promise<V1.SaleDetails>;
    /**
     * @returns the next ID to be used when a new listing happens, as a BigNumber
     * @note the latest sale ID is simply the return of this function minus one
     * @note MarketplaceV3 did not start at ID 0
     */
    getNextMarketplaceId(): Promise<ethers.BigNumber>;
}
export default MarketplaceV1;
