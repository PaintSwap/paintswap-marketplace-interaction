import { ethers } from "ethers";
import * as V2 from "./marketplaceV2Types"

const MarketplaceV2ABI: ethers.ContractInterface = require("../abi/PaintSwapMarketplaceV2.json");
const MarketplaceV2Address = "0x6125fD14b6790d5F66509B7aa53274c93dAE70B9"

export class MarketplaceV2Utils {
    static #splitBundleBase(bundle: V2.BundleBase): Array<V2.Base> {
        const result = []
        const pieces = bundle.nfts.length
        // Bundles aren't used at the moment, so this loop will be for a single sale
        for (let i = 0; i < pieces; ++i) {
            const base: V2.Base = {
                marketplaceId: bundle.marketplaceId,
                collection: bundle.nfts[i],
                tokenID: bundle.tokenIds[i],
                amountInBundle: bundle.amountBatches[i],
            };
            result.push(base)
        }
        return result
    }

    static #splitBundlePriced(bundle: V2.BundlePriced): Array<V2.Priced> {
        const base = MarketplaceV2Utils.#splitBundleBase(bundle)
        const totalAmountInEachBundle = bundle.amountBatches.reduce((a: ethers.BigNumber, b: ethers.BigNumber) => a.add(b))
        return base.map((value): V2.Priced => {
            // Price is for the *individual* NFT, so it's averaged taking into account the bundle composition and number of bundles sold
            const bundleRatio = value.amountInBundle.toNumber() / totalAmountInEachBundle.toNumber()
            const price = bundle.price.mul(bundleRatio).div(bundle.amount)
            return {
                marketplaceId: value.marketplaceId,
                collection: value.collection,
                amountInBundle: value.amountInBundle,
                tokenID: value.tokenID,
                amount: bundle.amount.mul(value.amountInBundle),
                price
            }
        })
    }

    static splitBundleSold(bundle: V2.BundleSold): Array<V2.Sold> {
        return MarketplaceV2Utils.#splitBundlePriced(bundle).map((value): V2.Sold => {
            return {
                marketplaceId: value.marketplaceId,
                collection: value.collection,
                amountInBundle: value.amountInBundle,
                tokenID: value.tokenID,
                amount: value.amount,
                price: value.price,
                buyer: bundle.buyer,
                seller: bundle.seller
            }
        })
    }

    static splitBundleNewSale(bundle: V2.NewBundleSale): Array<V2.NewSale> {
        return MarketplaceV2Utils.#splitBundlePriced(bundle).map((value): V2.NewSale => {
            return {
                marketplaceId: value.marketplaceId,
                collection: value.collection,
                amountInBundle: value.amountInBundle,
                tokenID: value.tokenID,
                amount: value.amount,
                price: value.price,
                duration: bundle.duration,
                isAuction: bundle.isAuction,
                isNSFW: bundle.isNSFW
            }
        })
    }

    static splitBundleUnsold(bundle: V2.BundleUnsold): Array<V2.Unsold> {
        return this.#splitBundleBase(bundle)
    }
}

export class MarketplaceV2 {
    contract: ethers.Contract

    constructor(provider: ethers.providers.BaseProvider, address: string = MarketplaceV2Address) {
        this.contract = new ethers.Contract(address, MarketplaceV2ABI, provider)
    }

    #onNewSaleImpl(callback: (sale: V2.NewBundleSale) => void): void {
        this.contract.on("NewSale", (marketplaceId, nfts, tokenIds, amountBatches, price, duration, isAuction, amount, isNSFW, marketplaceURI, searchKeywords, routerAddresses, event) => {
            const bundle: V2.NewBundleSale = {
                marketplaceId,
                nfts,
                tokenIds,
                amountBatches,
                price,
                duration,
                isAuction,
                amount,
                isNSFW
            }
            callback(bundle)
        })
    }

    #onSoldImpl(callback: (bundle: V2.BundleSold) => void): void {
        this.contract.on("Sold", (marketplaceId, nfts, tokenIds, amountBatches, price, buyer, seller, amount, event) => {
            const bundle: V2.BundleSold = {
                marketplaceId,
                nfts,
                tokenIds,
                amountBatches,
                price,
                buyer,
                seller,
                amount
            }
            callback(bundle)
        })
    }

    #onUnsoldImpl(callback: (bundle: V2.BundleUnsold) => void): void {
        this.contract.on("SaleFinished", (marketplaceId, nfts, tokenIds, amountBatches, failedSellAll, event) => {
            if (failedSellAll) {
                const bundle: V2.BundleUnsold = {
                    marketplaceId,
                    nfts,
                    tokenIds,
                    amountBatches
                }
                callback(bundle)
            }
        })
    }

    #onCancelledImpl(callback: (bundle: V2.BundleUnsold) => void): void {
        this.contract.on("CancelledSale", (marketplaceId, nfts, tokenIds, amountBatches, event) => {
            const bundle: V2.BundleUnsold = {
                marketplaceId,
                nfts,
                tokenIds,
                amountBatches
            }
            callback(bundle)
        })
    }

    #onPriceUpdateImpl(callback: (bundle: V2.BundlePriceUpdate) => void): void {
        // Not handled as individual pieces due to missing amountBatches information
        this.contract.on("UpdatePrice", (marketplaceId, price, nfts, tokenIds, event) => {
            const bundle: V2.BundlePriceUpdate = {
                marketplaceId,
                price
            }
            callback(bundle)
        })
    }

    #onDurationExtended(callback: (sale: V2.DurationExtended) => void): void {
        this.contract.on("UpdateEndTime", (marketplaceId, endTime, event) => {
            const extension: V2.DurationExtended = {
                marketplaceId,
                endTime
            }
            callback(extension)
        })
    }

    #onNewBid(callback: (bid: V2.NewBid) => void): void {
        this.contract.on("NewBid", (marketplaceId, bidder, bid, nextMinimum) => {
            const newBid: V2.NewBid = {
                marketplaceId,
                bidder,
                bid,
                nextMinimum
            }
            callback(newBid)
        })
    }

    #onNewOffer(callback: (offer: V2.NewOffer) => void): void {
        this.contract.on("NewOffer", (marketplaceId, offerrer, offer, nextMinimum) => {
            const newOffer: V2.NewOffer = {
                marketplaceId,
                offerrer,
                offer,
                nextMinimum
            }
            callback(newOffer)
        })
    }

    onNewSaleAsBundle(callback: (sale: V2.NewBundleSale) => void): void {
        this.#onNewSaleImpl(callback)
    }

    onNewSale(callback: (sale: V2.NewSale) => void): void {
        this.#onNewSaleImpl((bundle) => MarketplaceV2Utils.splitBundleNewSale(bundle).forEach(callback))
    }

    onSoldAsBundle(callback: (sale: V2.BundleSold) => void): void {
        this.#onSoldImpl(callback)
    }

    onSold(callback: (sale: V2.Sold) => void): void {
        this.#onSoldImpl((bundle) => MarketplaceV2Utils.splitBundleSold(bundle).forEach(callback))
    }

    onUnsoldAsBundle(callback: (sale: V2.BundleUnsold, cancelled: boolean) => void): void {
        this.#onUnsoldImpl((sale) => callback(sale, false)) // not cancelled
        this.#onCancelledImpl((sale) => callback(sale, true)) // cancelled
    }

    onUnsold(callback: (sale: V2.Unsold, cancelled: boolean) => void): void {
        this.#onUnsoldImpl((bundle) => MarketplaceV2Utils.splitBundleUnsold(bundle).forEach((sale) => callback(sale, false))) // not cancelled
        this.#onCancelledImpl((bundle) => MarketplaceV2Utils.splitBundleUnsold(bundle).forEach((sale) => callback(sale, true))) // cancelled
    }

    onPriceUpdate(callback: (sale: V2.BundlePriceUpdate) => void): void {
        this.#onPriceUpdateImpl(callback)
    }

    // Auctions with bids near the end get auto extended by 5 minutes
    onDurationExtended(callback: (extension: V2.DurationExtended) => void): void {
        this.#onDurationExtended(callback)
    }

    onNewBid(callback: (bid: V2.NewBid) => void): void {
        this.#onNewBid(callback)
    }

    onNewOffer(callback: (offer: V2.NewOffer) => void): void {
        this.#onNewOffer(callback)
    }

    async getSaleDetails(marketplaceId: ethers.BigNumber): Promise<V2.saleDetails> {
        return this.contract.getSaleDetails(marketplaceId).then((details: any): V2.saleDetails => ({
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
        }))
    }

    async getNextMinimumBidOrOffer(marketplaceId: ethers.BigNumber): Promise<ethers.BigNumber> {
        return this.contract.nextMinimumBidOrOffer(marketplaceId)
    }
}

export default MarketplaceV2