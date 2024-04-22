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
exports.MarketplaceV3 = exports.MarketplaceV3Utils = exports.MarketplaceV3Address = exports.MarketplaceV3ABI = void 0;
const ethers_1 = require("ethers");
const PaintSwapMarketplaceV3_json_1 = __importDefault(require("../abi/PaintSwapMarketplaceV3.json"));
exports.MarketplaceV3ABI = PaintSwapMarketplaceV3_json_1.default;
exports.MarketplaceV3Address = '0xf3df7b6dccc267393784a3876d0cbcbdc73147d4';
class MarketplaceV3Utils {
    /** @internal */
    static splitBundleBase(bundle) {
        const result = [];
        const pieces = bundle.nfts.length;
        // Bundles aren't used at the moment, so this loop will be for a single sale
        for (let i = 0; i < pieces; ++i) {
            const base = {
                marketplaceId: bundle.marketplaceId,
                nft: bundle.nfts[i],
                tokenID: bundle.tokenIds[i],
                amountPerBundleUnit: bundle.amountBatches ? bundle.amountBatches[i] : null,
            };
            result.push(base);
        }
        return result;
    }
    /** @internal */
    static splitBundlePriced(bundle) {
        const base = MarketplaceV3Utils.splitBundleBase(bundle);
        return base.map((value) => {
            return Object.assign(Object.assign(Object.assign({}, value), bundle), { amount: bundle.amount.mul(value.amountPerBundleUnit) });
        });
    }
    static splitBundleSold(bundle) {
        return MarketplaceV3Utils.splitBundlePriced(bundle).map((value) => {
            return Object.assign(Object.assign({}, value), bundle);
        });
    }
    static splitBundleNewSale(bundle) {
        return MarketplaceV3Utils.splitBundlePriced(bundle).map((value) => {
            return Object.assign(Object.assign({}, value), bundle);
        });
    }
    static splitBundleNewOffer(bundle) {
        const asBase = bundle;
        return MarketplaceV3Utils.splitBundleBase(asBase).map((value) => (Object.assign(Object.assign({}, value), bundle)));
    }
}
exports.MarketplaceV3Utils = MarketplaceV3Utils;
class MarketplaceV3 {
    /**
     * @param providerOrSigner an ethers compatible provider or signer https://docs.ethers.io/v5/api/providers/
     * @param address if given, overrides the default marketplace contract address
     */
    constructor(providerOrSigner, address = exports.MarketplaceV3Address) {
        this.contract = new ethers_1.ethers.Contract(address, exports.MarketplaceV3ABI, providerOrSigner);
    }
    handleNewListingAsBundle(args, event) {
        const bundle = Object.assign(Object.assign({}, args), { pricePerUnit: args.price, priceTotal: args.price.mul(args.amount), event });
        return bundle;
    }
    /**
     * @param callback called for new listings, as bundles
     */
    onNewListingAsBundle(callback) {
        this.contract.on('NewSale', (...args) => {
            const event = args.slice(-1)[0];
            callback(this.handleNewListingAsBundle(event.args, event));
        });
    }
    /**
     * @param callback called for new listings, as individual NFTs
     */
    onNewListing(callback) {
        this.onNewListingAsBundle((bundle) => MarketplaceV3Utils.splitBundleNewSale(bundle).forEach(callback));
    }
    handleSoldAsBundle(args, event) {
        const bundle = Object.assign(Object.assign({}, args), { pricePerUnit: args.price, priceTotal: args.price.mul(args.amount), event });
        return bundle;
    }
    /**
     * @param callback called for successfully sold items, as bundles
     */
    onSoldAsBundle(callback) {
        this.contract.on('Sold', (...args) => {
            const event = args.slice(-1)[0];
            callback(this.handleSoldAsBundle(event.args, event));
        });
    }
    /**
     * @param callback called for successfuly sold items, as individual NFTs
     */
    onSold(callback) {
        this.onSoldAsBundle((bundle) => MarketplaceV3Utils.splitBundleSold(bundle).forEach(callback));
    }
    handleFinished(args, event) {
        const sale = Object.assign(Object.assign({}, args), { event });
        return sale;
    }
    /**
     * @param callback called for finished sales
     * @note does not provide cancelled sales
     * @note sale may have been successful or not
     */
    onFinished(callback) {
        this.contract.on('SaleFinished', (...args) => {
            const event = args.slice(-1)[0];
            callback(this.handleFinished(event.args, event));
        });
    }
    handleCancelled(args, event) {
        // Not handled as individual pieces due to missing amountBatches information
        const sale = Object.assign(Object.assign({}, args), { event });
        return sale;
    }
    /**
     * @param callback called for cancelled sales
     */
    onCancelled(callback) {
        this.contract.on('CancelledSale', (...args) => {
            const event = args.slice(-1)[0];
            callback(this.handleCancelled(event.args, event));
        });
    }
    handlePriceUpdate(args, event) {
        // Not handled as individual pieces due to missing amountBatches information
        const sale = Object.assign(Object.assign({}, args), { event });
        return sale;
    }
    /**
     * @param callback called for price updates to sales
     */
    onPriceUpdate(callback) {
        this.contract.on('UpdatePrice', (...args) => {
            const event = args.slice(-1)[0];
            callback(this.handlePriceUpdate(event.args, event));
        });
    }
    handleStartDelayed(args, event) {
        const sale = Object.assign(Object.assign({}, args), { event });
        return sale;
    }
    /**
     * @param callback called when sales are delayed
     */
    onStartDelayed(callback) {
        this.contract.on('UpdateStartTime', (...args) => {
            const event = args.slice(-1)[0];
            callback(this.handleStartDelayed(event.args, event));
        });
    }
    handleDurationExtended(args, event) {
        const sale = Object.assign(Object.assign({}, args), { event });
        return sale;
    }
    /**
     * @param callback called when sales are extended
     */
    onDurationExtended(callback) {
        this.contract.on('UpdateEndTime', (...args) => {
            const event = args.slice(-1)[0];
            callback(this.handleDurationExtended(event.args, event));
        });
    }
    handleNewBid(args, event) {
        const newBid = Object.assign(Object.assign({}, args), { event });
        return newBid;
    }
    /**
     * @param callback called for new bids on auctions
     * @note a new bid refunds the previously highest bid
     */
    onNewBid(callback) {
        this.contract.on('NewBid', (...args) => {
            const event = args.slice(-1)[0];
            callback(this.handleNewBid(event.args, event));
        });
    }
    // Returns a pair, second is a boolean which is true if the offer was made on a sale and false if it was outside a sale
    handleNewOfferAsBundle(args, event) {
        const isSaleOffer = ethers_1.BigNumber.from(args.marketplaceId).isZero();
        const newOffer = Object.assign(Object.assign({}, args), { marketplaceId: !isSaleOffer ? args.marketplaceId : null, event });
        return [newOffer, isSaleOffer];
    }
    /**
     * @param callback called for new offers, as bundles
     */
    onNewOfferAsBundle(callback) {
        this.contract.on('NewOffer', (...args) => {
            const event = args.slice(-1)[0];
            const [newOffer, isSaleOffer] = this.handleNewOfferAsBundle(event.args, event);
            callback(newOffer, isSaleOffer);
        });
    }
    /**
     * @param callback called for new offers, as bundles
     */
    onNewOffer(callback) {
        this.onNewOfferAsBundle((bundle, isSaleOffer) => MarketplaceV3Utils.splitBundleNewOffer(bundle).forEach((offer) => callback(offer, isSaleOffer)));
    }
    handleOfferRemoved(args, event) {
        const offer = Object.assign(Object.assign({}, args), { event });
        return offer;
    }
    /**
     * @param callback called for removed offers
     */
    onOfferRemoved(callback) {
        this.contract.on('OfferRemoved', (...args) => {
            const event = args.slice(-1)[0];
            callback(this.handleOfferRemoved(event.args, event));
        });
    }
    handleOfferAccepted(args, event) {
        const offer = Object.assign(Object.assign({}, args), { event });
        return offer;
    }
    /**
     * @param callback called for accepted offers
     */
    onOfferAccepted(callback) {
        this.contract.on('OfferAccepted', (...args) => {
            const event = args.slice(-1)[0];
            callback(this.handleOfferAccepted(event.args, event));
        });
    }
    handleOfferUpdated(args, event) {
        const offerUpdated = Object.assign(Object.assign({}, args), { event });
        return offerUpdated;
    }
    /**
     * @param callback called for updated offers
     */
    onOfferUpdated(callback) {
        this.contract.on('UpdateOffer', (...args) => {
            const event = args.slice(-1)[0];
            callback(this.handleOfferUpdated(event.args, event));
        });
    }
    handleNewCollectionOffer(args, event) {
        const newCollectionOffer = Object.assign(Object.assign({}, args), { event });
        return newCollectionOffer;
    }
    /**
     * @param callback called for new collection offers
     */
    onNewCollectionOffer(callback) {
        this.contract.on('NewCollectionOffer', (...args) => {
            const event = args.slice(-1)[0];
            callback(this.handleNewCollectionOffer(event.args, event));
        });
    }
    handleNewFilteredCollectionOffer(args, event) {
        const newFilteredCollectionOffer = Object.assign(Object.assign({}, args), { event });
        return newFilteredCollectionOffer;
    }
    /**
     * @param callback called for new filtered collection offers, i.e., on specific tokenIDs
     */
    onNewFilteredCollectionOffer(callback) {
        this.contract.on('NewFilteredCollectionOffer', (...args) => {
            const event = args.slice(-1)[0];
            callback(this.handleNewFilteredCollectionOffer(event.args, event));
        });
    }
    /**
     * @param marketplaceId the sale ID for which to grab details. The one that goes into https://paintswap.finance/marketplace/<ID>
     * @returns a SaleDetails objects with details about this sale
     */
    getSaleDetails(marketplaceId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.contract.getSaleDetails(marketplaceId).then((details) => (Object.assign({}, details)));
        });
    }
    /**
     * @param marketplaceId the sale ID. The one that goes into https://paintswap.finance/marketplace/<ID>
     * @returns the next minimum bid that this sale will accept, as a BigNumber
     */
    getNextMinimumBid(marketplaceId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.contract.nextMinimumBid(marketplaceId);
        });
    }
    /**
     * @returns the next ID to be used when a new listing happens, as a BigNumber
     * @note the latest sale ID is simply the return of this function minus one
     * @note MarketplaceV3 did not start at ID 0
     */
    getNextMarketplaceId() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.contract.currentMarketplaceId();
        });
    }
}
exports.MarketplaceV3 = MarketplaceV3;
exports.default = MarketplaceV3;
