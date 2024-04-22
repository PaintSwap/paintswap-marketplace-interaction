import { ethers } from 'ethers';
import * as V3 from './marketplaceV3Types';
export declare const MarketplaceV3ABI: ethers.ContractInterface;
export declare const MarketplaceV3Address = "0xf3df7b6dccc267393784a3876d0cbcbdc73147d4";
export declare class MarketplaceV3Utils {
    /** @internal */
    static splitBundleBase(bundle: V3.BundleBase): Array<V3.Base>;
    /** @internal */
    static splitBundlePriced(bundle: V3.BundlePriced): Array<V3.Priced>;
    static splitBundleSold(bundle: V3.BundleSold): Array<V3.Sold>;
    static splitBundleNewSale(bundle: V3.NewBundleListing): Array<V3.NewListing>;
    static splitBundleNewOffer(bundle: V3.NewBundleOffer): Array<V3.NewOffer>;
}
export declare class MarketplaceV3 {
    contract: ethers.Contract;
    /**
     * @param providerOrSigner an ethers compatible provider or signer https://docs.ethers.io/v5/api/providers/
     * @param address if given, overrides the default marketplace contract address
     */
    constructor(providerOrSigner: ethers.providers.Provider | ethers.Signer, address?: string);
    handleNewListingAsBundle(args: any, event: any): V3.NewBundleListing;
    /**
     * @param callback called for new listings, as bundles
     */
    onNewListingAsBundle(callback: (sale: V3.NewBundleListing) => void): void;
    /**
     * @param callback called for new listings, as individual NFTs
     */
    onNewListing(callback: (sale: V3.NewListing) => void): void;
    handleSoldAsBundle(args: any, event: any): V3.BundleSold;
    /**
     * @param callback called for successfully sold items, as bundles
     */
    onSoldAsBundle(callback: (bundle: V3.BundleSold) => void): void;
    /**
     * @param callback called for successfuly sold items, as individual NFTs
     */
    onSold(callback: (sale: V3.Sold) => void): void;
    handleFinished(args: any, event: any): V3.SaleFinished;
    /**
     * @param callback called for finished sales
     * @note does not provide cancelled sales
     * @note sale may have been successful or not
     */
    onFinished(callback: (sale: V3.SaleFinished) => void): void;
    handleCancelled(args: any, event: any): V3.Cancelled;
    /**
     * @param callback called for cancelled sales
     */
    onCancelled(callback: (bundle: V3.Cancelled) => void): void;
    handlePriceUpdate(args: any, event: any): V3.PriceUpdate;
    /**
     * @param callback called for price updates to sales
     */
    onPriceUpdate(callback: (bundle: V3.PriceUpdate) => void): void;
    handleStartDelayed(args: any, event: any): V3.StartDelayed;
    /**
     * @param callback called when sales are delayed
     */
    onStartDelayed(callback: (sale: V3.StartDelayed) => void): void;
    handleDurationExtended(args: any, event: any): V3.DurationExtended;
    /**
     * @param callback called when sales are extended
     */
    onDurationExtended(callback: (sale: V3.DurationExtended) => void): void;
    handleNewBid(args: any, event: any): V3.NewBid;
    /**
     * @param callback called for new bids on auctions
     * @note a new bid refunds the previously highest bid
     */
    onNewBid(callback: (bid: V3.NewBid) => void): void;
    handleNewOfferAsBundle(args: any, event: any): [V3.NewBundleOffer, boolean];
    /**
     * @param callback called for new offers, as bundles
     */
    onNewOfferAsBundle(callback: (offer: V3.NewBundleOffer, isSaleOffer: boolean) => void): void;
    /**
     * @param callback called for new offers, as bundles
     */
    onNewOffer(callback: (offer: V3.NewOffer, isSaleOffer: boolean) => void): void;
    handleOfferRemoved(args: any, event: any): V3.OfferRemoved;
    /**
     * @param callback called for removed offers
     */
    onOfferRemoved(callback: (offer: V3.OfferRemoved) => void): void;
    handleOfferAccepted(args: any, event: any): V3.OfferAccepted;
    /**
     * @param callback called for accepted offers
     */
    onOfferAccepted(callback: (offer: V3.OfferAccepted) => void): void;
    handleOfferUpdated(args: any, event: any): V3.OfferUpdated;
    /**
     * @param callback called for updated offers
     */
    onOfferUpdated(callback: (offer: V3.OfferUpdated) => void): void;
    handleNewCollectionOffer(args: any, event: any): V3.NewCollectionOffer;
    /**
     * @param callback called for new collection offers
     */
    onNewCollectionOffer(callback: (offer: V3.NewCollectionOffer) => void): void;
    handleNewFilteredCollectionOffer(args: any, event: any): V3.NewFilteredCollectionOffer;
    /**
     * @param callback called for new filtered collection offers, i.e., on specific tokenIDs
     */
    onNewFilteredCollectionOffer(callback: (offer: V3.NewFilteredCollectionOffer) => void): void;
    /**
     * @param marketplaceId the sale ID for which to grab details. The one that goes into https://paintswap.finance/marketplace/<ID>
     * @returns a SaleDetails objects with details about this sale
     */
    getSaleDetails(marketplaceId: ethers.BigNumber): Promise<V3.SaleDetails>;
    /**
     * @param marketplaceId the sale ID. The one that goes into https://paintswap.finance/marketplace/<ID>
     * @returns the next minimum bid that this sale will accept, as a BigNumber
     */
    getNextMinimumBid(marketplaceId: ethers.BigNumber): Promise<ethers.BigNumber>;
    /**
     * @returns the next ID to be used when a new listing happens, as a BigNumber
     * @note the latest sale ID is simply the return of this function minus one
     * @note MarketplaceV3 did not start at ID 0
     */
    getNextMarketplaceId(): Promise<ethers.BigNumber>;
}
export default MarketplaceV3;
