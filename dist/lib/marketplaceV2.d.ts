import { ethers } from 'ethers';
import * as V2 from './marketplaceV2Types';
export declare const MarketplaceV2ABI: ethers.ContractInterface;
export declare const MarketplaceV2Address = "0x6125fD14b6790d5F66509B7aa53274c93dAE70B9";
export declare class MarketplaceV2 {
    contract: ethers.Contract;
    /**
     * @param providerOrSigner an ethers compatible provider or signer https://docs.ethers.io/v5/api/providers/
     * @param address if given, overrides the default marketplace contract address
     */
    constructor(providerOrSigner: ethers.providers.Provider | ethers.Signer, address?: string);
    /**
     * @param callback called for new listings, as bundles
     */
    onNewListingAsBundle(callback: (sale: V2.NewBundleListing) => void): void;
    /**
     * @param callback called for new listings, as individual NFTs
     */
    onNewListing(callback: (sale: V2.NewListing) => void): void;
    /**
     * @param callback called for successfully sold items, as bundles
     */
    onSoldAsBundle(callback: (bundle: V2.BundleSold) => void): void;
    /**
     * @param callback called for successfuly sold items, as individual NFTs
     */
    onSold(callback: (sale: V2.Sold) => void): void;
    /**
     * @internal
     * @param callback called for finished unsuccessful sales, as bundles
     * @note does not provide cancelled sales
     */
    onUnsoldAsBundleImpl(callback: (bundle: V2.BundleUnsold) => void): void;
    /**
     * @param callback called for cancelled sales, as bundles
     */
    onCancelledAsBundleImpl(callback: (bundle: V2.BundleUnsold) => void): void;
    /**
     * @param callback called for unsuccessful sales as bundles, noting if it was due to a cancellation or simply ending without selling
     */
    onUnsoldAsBundle(callback: (sale: V2.BundleUnsold, cancelled: boolean) => void): void;
    /**
     * @param callback called for unsuccessful sales as individual NFTs, noting if it was due to a cancellation or simply ending without selling
     */
    onUnsold(callback: (sale: V2.Unsold, cancelled: boolean) => void): void;
    /**
     * @param callback called for price updates to sales
     */
    onPriceUpdate(callback: (bundle: V2.BundlePriceUpdate) => void): void;
    /**
     * @param callback called when auctions are extended
     */
    onDurationExtended(callback: (sale: V2.DurationExtended) => void): void;
    /**
     * @param callback called for new bids on auctions
     * @note a new bid refunds the previously highest bid
     */
    onNewBid(callback: (bid: V2.NewBid) => void): void;
    /**
     * @param callback called for new offers on auctions
     * @note a new offer refunds the previously highest offer
     */
    onNewOffer(callback: (offer: V2.NewOffer) => void): void;
    /**
     * @param marketplaceId the sale ID for which to grab details. The one that goes into https://paintswap.finance/marketplace/<ID>
     * @returns a SaleDetails objects with details about this sale
     */
    getSaleDetails(marketplaceId: ethers.BigNumber): Promise<V2.SaleDetails>;
    /**
     * @param marketplaceId the sale ID for which to grab details. The one that goes into https://paintswap.finance/marketplace/<ID>
     * @returns the next minimum bid (or offer) that this sale will accept, as a BigNumber
     */
    getNextMinimumBidOrOffer(marketplaceId: ethers.BigNumber): Promise<ethers.BigNumber>;
    /**
     * @returns the next ID to be used when a new listing happens, as a BigNumber
     * @note the latest sale ID is simply the return of this function minus one
     * @note MarketplaceV2 did not start at ID 0
     */
    getNextMarketplaceId(): Promise<ethers.BigNumber>;
}
export default MarketplaceV2;
