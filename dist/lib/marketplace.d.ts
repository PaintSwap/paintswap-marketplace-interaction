import { ethers } from 'ethers';
import { Cancelled, DurationExtended, NewBid, NewCollectionOffer, NewFilteredCollectionOffer, NewListing, NewListingBatch, NewOffer, OfferAccepted, OfferRemoved, OfferUpdated, PriceUpdate, SaleDetails, SaleFinished, Sold } from './marketplaceTypes';
export declare const MarketplaceABI: ethers.ContractInterface;
export declare const MarketplaceAddress = "0x0c558365eeff4b057fdbed91bc3650e1a00018b4";
export declare class Marketplace {
    contract: ethers.Contract;
    /**
     * @param providerOrSigner an ethers compatible provider or signer https://docs.ethers.io/v5/api/providers/
     * @param address if given, overrides the default marketplace contract address
     */
    constructor(providerOrSigner: ethers.providers.Provider | ethers.Signer, address?: string);
    handleNewListing(args: any, event: any): NewListing;
    /**
     * @param callback called for new listings, as individual NFTs
     */
    onNewListing(callback: (sale: NewListing) => void): void;
    handleNewListingBatch(args: any, event: any): NewListingBatch;
    /**
     * @param callback called for new listings as a batch, as individual NFTs
     */
    onNewListingBatch(callback: (sales: NewListingBatch) => void): void;
    handleSold(args: any, event: any): Sold;
    /**
     * @param callback called for successfuly sold items, as individual NFTs
     */
    onSold(callback: (sale: Sold) => void): void;
    handleFinished(args: any, event: any): SaleFinished;
    /**
     * @param callback called for finished sales
     * @note does not provide cancelled sales
     * @note sale may have been successful or not
     */
    onFinished(callback: (sale: SaleFinished) => void): void;
    handleCancelled(args: any, event: any): Cancelled;
    /**
     * @param callback called for cancelled sales
     */
    onCancelled(callback: (bundle: Cancelled) => void): void;
    handlePriceUpdate(args: any, event: any): PriceUpdate;
    /**
     * @param callback called for price updates to sales
     */
    onPriceUpdate(callback: (bundle: PriceUpdate) => void): void;
    handleDurationExtended(args: any, event: any): DurationExtended;
    /**
     * @param callback called when sales are extended
     */
    onDurationExtended(callback: (sale: DurationExtended) => void): void;
    handleNewBid(args: any, event: any): NewBid;
    /**
     * @param callback called for new bids on auctions
     * @note a new bid refunds the previously highest bid
     */
    onNewBid(callback: (bid: NewBid) => void): void;
    handleNewOffer(args: any, event: any): [NewOffer, boolean];
    /**
     * @param callback called for new offers, as bundles
     */
    onNewOffer(callback: (offer: NewOffer, isSaleOffer: boolean) => void): void;
    handleOfferRemoved(args: any, event: any): OfferRemoved;
    /**
     * @param callback called for removed offers
     */
    onOfferRemoved(callback: (offer: OfferRemoved) => void): void;
    handleOfferAccepted(args: any, event: any): OfferAccepted;
    /**
     * @param callback called for accepted offers
     */
    onOfferAccepted(callback: (offer: OfferAccepted) => void): void;
    handleOfferUpdated(args: any, event: any): OfferUpdated;
    /**
     * @param callback called for updated offers
     */
    onOfferUpdated(callback: (offer: OfferUpdated) => void): void;
    handleNewCollectionOffer(args: any, event: any): NewCollectionOffer;
    /**
     * @param callback called for new collection offers
     */
    onNewCollectionOffer(callback: (offer: NewCollectionOffer) => void): void;
    handleNewFilteredCollectionOffer(args: any, event: any): NewFilteredCollectionOffer;
    /**
     * @param callback called for new filtered collection offers, i.e., on specific tokenIDs
     */
    onNewFilteredCollectionOffer(callback: (offer: NewFilteredCollectionOffer) => void): void;
    /**
     * @param marketplaceId the sale ID for which to grab details. The one that goes into https://paintswap.finance/marketplace/<ID>
     * @returns a SaleDetails objects with details about this sale
     */
    getSaleDetails(marketplaceId: ethers.BigNumber): Promise<SaleDetails>;
    /**
     * @returns the next ID to be used when a new listing happens, as a BigNumber
     * @note the latest sale ID is simply the return of this function minus one
     * @note MarketplaceV3 did not start at ID 0
     */
    getNextMarketplaceId(): Promise<ethers.BigNumber>;
}
export default Marketplace;
