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
}

export default MarketplaceV2