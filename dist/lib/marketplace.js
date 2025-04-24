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
exports.Marketplace = exports.MarketplaceAddress = exports.MarketplaceABI = void 0;
const ethers_1 = require("ethers");
const PaintSwapMarketplace_json_1 = __importDefault(require("../abi/PaintSwapMarketplace.json"));
exports.MarketplaceABI = PaintSwapMarketplace_json_1.default;
exports.MarketplaceAddress = '0x0c558365eeff4b057fdbed91bc3650e1a00018b4'; // Sonic Mainnet
class Marketplace {
    /**
     * @param providerOrSigner an ethers compatible provider or signer https://docs.ethers.io/v5/api/providers/
     * @param address if given, overrides the default marketplace contract address
     */
    constructor(providerOrSigner, address = exports.MarketplaceAddress) {
        this.contract = new ethers_1.ethers.Contract(address, exports.MarketplaceABI, providerOrSigner);
    }
    handleNewListing(args, event) {
        return Object.assign(Object.assign({}, args), { event });
    }
    /**
     * @param callback called for new listings, as individual NFTs
     */
    onNewListing(callback) {
        this.contract.on('NewListing', (...args) => {
            const event = args.slice(-1)[0];
            callback(this.handleNewListing(event.args, event));
        });
    }
    handleNewListingBatch(args, event) {
        return Object.assign(Object.assign({}, args), { event });
    }
    /**
     * @param callback called for new listings as a batch, as individual NFTs
     */
    onNewListingBatch(callback) {
        this.contract.on('NewListingBatch', (...args) => {
            const event = args.slice(-1)[0];
            callback(this.handleNewListingBatch(event.args, event));
        });
    }
    handleSold(args, event) {
        return Object.assign(Object.assign({}, args), { event });
    }
    /**
     * @param callback called for successfuly sold items, as individual NFTs
     */
    onSold(callback) {
        this.contract.on('Sold', (...args) => {
            const event = args.slice(-1)[0];
            callback(this.handleSold(event.args, event));
        });
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
    handleNewOffer(args, event) {
        const isSaleOffer = ethers_1.BigNumber.from(args.marketplaceId).isZero();
        const newOffer = Object.assign(Object.assign({}, args), { marketplaceId: !isSaleOffer ? args.marketplaceId : null, event });
        return [newOffer, isSaleOffer];
    }
    /**
     * @param callback called for new offers, as bundles
     */
    onNewOffer(callback) {
        this.contract.on('NewOffer', (...args) => {
            const event = args.slice(-1)[0];
            callback(...this.handleNewOffer(event.args, event));
        });
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
exports.Marketplace = Marketplace;
exports.default = Marketplace;
