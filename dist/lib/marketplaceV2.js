"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketplaceV2 = exports.MarketplaceV2Address = exports.MarketplaceV2ABI = void 0;
const ethers_1 = require("ethers");
const PaintSwapMarketplaceV2_json_1 = __importDefault(require("../abi/PaintSwapMarketplaceV2.json"));
exports.MarketplaceV2ABI = PaintSwapMarketplaceV2_json_1.default;
exports.MarketplaceV2Address = '0x6125fD14b6790d5F66509B7aa53274c93dAE70B9';
class MarketplaceV2Utils {
    /** @internal */
    static splitBundleBase(bundle) {
        const result = [];
        const pieces = bundle.nfts.length;
        // Bundles aren't used at the moment, so this loop will be for a single sale
        for (let i = 0; i < pieces; ++i) {
            const base = {
                marketplaceId: bundle.marketplaceId,
                collection: bundle.nfts[i],
                tokenID: bundle.tokenIds[i],
                amountPerBundleUnit: bundle.amountBatches[i],
            };
            result.push(base);
        }
        return result;
    }
    /** @internal */
    static splitBundlePriced(bundle) {
        const base = MarketplaceV2Utils.splitBundleBase(bundle);
        return base.map((value) => {
            return {
                marketplaceId: value.marketplaceId,
                collection: value.collection,
                amountPerBundleUnit: value.amountPerBundleUnit,
                tokenID: value.tokenID,
                amount: bundle.amount.mul(value.amountPerBundleUnit),
                pricePerUnit: bundle.pricePerUnit,
                priceTotal: bundle.priceTotal,
            };
        });
    }
    static splitBundleSold(bundle) {
        return MarketplaceV2Utils.splitBundlePriced(bundle).map((value) => {
            return {
                marketplaceId: value.marketplaceId,
                collection: value.collection,
                amountPerBundleUnit: value.amountPerBundleUnit,
                tokenID: value.tokenID,
                amount: value.amount,
                pricePerUnit: value.pricePerUnit,
                priceTotal: value.priceTotal,
                buyer: bundle.buyer,
                seller: bundle.seller,
                event: bundle.event,
            };
        });
    }
    static splitBundleNewSale(bundle) {
        return MarketplaceV2Utils.splitBundlePriced(bundle).map((value) => {
            return {
                marketplaceId: value.marketplaceId,
                collection: value.collection,
                amountPerBundleUnit: value.amountPerBundleUnit,
                tokenID: value.tokenID,
                amount: value.amount,
                pricePerUnit: value.pricePerUnit,
                priceTotal: value.priceTotal,
                duration: bundle.duration,
                isAuction: bundle.isAuction,
                isNSFW: bundle.isNSFW,
                event: bundle.event,
            };
        });
    }
    static splitBundleUnsold(bundle) {
        return this.splitBundleBase(bundle).map((base) => ({
            collection: base.collection,
            amountPerBundleUnit: base.amountPerBundleUnit,
            marketplaceId: base.marketplaceId,
            tokenID: base.marketplaceId,
            event: bundle.event,
        }));
    }
}
class MarketplaceV2 {
    /**
     * @param providerOrSigner an ethers compatible provider or signer https://docs.ethers.io/v5/api/providers/
     * @param address if given, overrides the default marketplace contract address
     */
    constructor(providerOrSigner, address = exports.MarketplaceV2Address) {
        this.contract = new ethers_1.ethers.Contract(address, exports.MarketplaceV2ABI, providerOrSigner);
    }
    /**
     * @param callback called for new listings, as bundles
     */
    onNewListingAsBundle(callback) {
        this.contract.on('NewSale', (marketplaceId, nfts, tokenIds, amountBatches, price, duration, isAuction, amount, isNSFW, marketplaceURI, searchKeywords, routerAddresses, event) => {
            const bundle = {
                marketplaceId,
                nfts,
                tokenIds,
                amountBatches,
                pricePerUnit: price,
                priceTotal: price.mul(amount),
                duration,
                isAuction,
                amount,
                isNSFW,
                event,
            };
            callback(bundle);
        });
    }
    /**
     * @param callback called for new listings, as individual NFTs
     */
    onNewListing(callback) {
        this.onNewListingAsBundle((bundle) => MarketplaceV2Utils.splitBundleNewSale(bundle).forEach(callback));
    }
    /**
     * @param callback called for successfully sold items, as bundles
     */
    onSoldAsBundle(callback) {
        this.contract.on('Sold', (marketplaceId, nfts, tokenIds, amountBatches, price, buyer, seller, amount, event) => {
            const bundle = {
                marketplaceId,
                nfts,
                tokenIds,
                amountBatches,
                pricePerUnit: price,
                priceTotal: price.mul(amount),
                buyer,
                seller,
                amount,
                event,
            };
            callback(bundle);
        });
    }
    /**
     * @param callback called for successfuly sold items, as individual NFTs
     */
    onSold(callback) {
        this.onSoldAsBundle((bundle) => MarketplaceV2Utils.splitBundleSold(bundle).forEach(callback));
    }
    /**
     * @internal
     * @param callback called for finished unsuccessful sales, as bundles
     * @note does not provide cancelled sales
     */
    onUnsoldAsBundleImpl(callback) {
        this.contract.on('SaleFinished', (marketplaceId, nfts, tokenIds, amountBatches, failedSellAll, event) => {
            if (failedSellAll) {
                const bundle = {
                    marketplaceId,
                    nfts,
                    tokenIds,
                    amountBatches,
                    event,
                };
                callback(bundle);
            }
        });
    }
    /**
     * @param callback called for cancelled sales, as bundles
     */
    onCancelledAsBundleImpl(callback) {
        this.contract.on('CancelledSale', (marketplaceId, nfts, tokenIds, amountBatches, event) => {
            const bundle = {
                marketplaceId,
                nfts,
                tokenIds,
                amountBatches,
                event,
            };
            callback(bundle);
        });
    }
    /**
     * @param callback called for unsuccessful sales as bundles, noting if it was due to a cancellation or simply ending without selling
     */
    onUnsoldAsBundle(callback) {
        this.onUnsoldAsBundleImpl((sale) => callback(sale, false)); // not cancelled
        this.onCancelledAsBundleImpl((sale) => callback(sale, true)); // cancelled
    }
    /**
     * @param callback called for unsuccessful sales as individual NFTs, noting if it was due to a cancellation or simply ending without selling
     */
    onUnsold(callback) {
        this.onUnsoldAsBundle((bundle, was_cancelled) => MarketplaceV2Utils.splitBundleUnsold(bundle).forEach((sale) => callback(sale, was_cancelled)));
    }
    /**
     * @param callback called for price updates to sales
     */
    onPriceUpdate(callback) {
        // Not handled as individual pieces due to missing amountBatches information
        this.contract.on('UpdatePrice', (marketplaceId, price, nfts, tokenIds, event) => {
            const bundle = {
                marketplaceId,
                price,
                event,
            };
            callback(bundle);
        });
    }
    /**
     * @param callback called when auctions are extended
     */
    onDurationExtended(callback) {
        this.contract.on('UpdateEndTime', (marketplaceId, endTime, event) => {
            const extension = {
                marketplaceId,
                endTime,
                event,
            };
            callback(extension);
        });
    }
    /**
     * @param callback called for new bids on auctions
     * @note a new bid refunds the previously highest bid
     */
    onNewBid(callback) {
        this.contract.on('NewBid', (marketplaceId, bidder, bid, nextMinimum, event) => {
            const newBid = {
                marketplaceId,
                bidder,
                bid,
                nextMinimum,
                event,
            };
            callback(newBid);
        });
    }
    /**
     * @param callback called for new offers on auctions
     * @note a new offer refunds the previously highest offer
     */
    onNewOffer(callback) {
        this.contract.on('NewOffer', (marketplaceId, offerrer, offer, nextMinimum, event) => {
            const newOffer = {
                marketplaceId,
                offerrer,
                offer,
                nextMinimum,
                event,
            };
            callback(newOffer);
        });
    }
    /**
     * @param marketplaceId the sale ID for which to grab details. The one that goes into https://paintswap.finance/marketplace/<ID>
     * @returns a SaleDetails objects with details about this sale
     */
    getSaleDetails(marketplaceId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.contract.getSaleDetails(marketplaceId).then((details) => ({
                amount: details.amount,
                amountBatches: details.amountBatches,
                amountRemaining: details.amountRemaining,
                complete: details.complete,
                devFeePercentage: details.devFeePercentage,
                startTime: details.startTime,
                endTime: details.endTime,
                isAuction: details.isAuction,
                maxBidOrOffer: details.maxBidOrOffer,
                maxBidderOrOfferer: details.maxBidderOrOfferer,
                nfts: details.nfts,
                tokenIds: details.tokenIds,
                price: details.price,
                seller: details.seller,
            }));
        });
    }
    /**
     * @param marketplaceId the sale ID for which to grab details. The one that goes into https://paintswap.finance/marketplace/<ID>
     * @returns the next minimum bid (or offer) that this sale will accept, as a BigNumber
     */
    getNextMinimumBidOrOffer(marketplaceId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.contract.nextMinimumBidOrOffer(marketplaceId);
        });
    }
    /**
     * @returns the next ID to be used when a new listing happens, as a BigNumber
     * @note the latest sale ID is simply the return of this function minus one
     * @note MarketplaceV2 did not start at ID 0
     */
    getNextMarketplaceId() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.contract.currentMarketplaceId();
        });
    }
}
exports.MarketplaceV2 = MarketplaceV2;
exports.default = MarketplaceV2;
