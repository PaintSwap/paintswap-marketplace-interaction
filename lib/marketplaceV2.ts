import { ethers } from "ethers";
import { V2Sold, V2BundleSold } from "./types"

const MarketplaceV2ABI: ethers.ContractInterface = require("../abi/PaintSwapMarketplaceV2.json");
const MarketplaceV2Address = "0x6125fD14b6790d5F66509B7aa53274c93dAE70B9"

export class MarketplaceV2 {
    contract: ethers.Contract

    constructor(provider: ethers.providers.BaseProvider, address: string = MarketplaceV2Address) {
        this.contract = new ethers.Contract(address, MarketplaceV2ABI, provider)
    }

    #onSoldImpl(callback: (bundle: V2BundleSold) => void): void {
        this.contract.on("Sold", (marketplaceId, nfts, tokenIds, amountBatches, price, buyer, seller, amount, event) => {
            const bundle: V2BundleSold = {
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

    onSoldAsBundle(callback: (sale: V2BundleSold) => void): void {
        this.#onSoldImpl(callback)
    }

    onSold(callback: (sale: V2Sold) => void): void {
        this.#onSoldImpl((bundle) => MarketplaceV2.splitBundleSold(bundle).forEach(callback))
    }

    static splitBundleSold(bundle: V2BundleSold): Array<V2Sold> {
        const result = []

        const pieces = bundle.nfts.length

        const totalAmountInEachBundle = bundle.amountBatches.reduce((a: ethers.BigNumber, b: ethers.BigNumber) => a.add(b))

        // Bundles aren't used at the moment, so this loop will be for a single sale
        for (let i = 0; i < pieces; ++i) {

            // Price is for the *individual* NFT, so it's averaged taking into account the bundle composition and number of bundles sold
            const bundleRatio = bundle.amountBatches[i].toNumber() / totalAmountInEachBundle.toNumber()
            const price = bundle.price.mul(bundleRatio).div(bundle.amount)

            const sale: V2Sold = {
                marketplaceId: bundle.marketplaceId,
                collection: bundle.nfts[i],
                tokenID: bundle.tokenIds[i],
                amount: bundle.amount.mul(bundle.amountBatches[i]),
                price,
                buyer: bundle.buyer,
                seller: bundle.seller
            };

            result.push(sale)
        }

        return result
    }
}

export default MarketplaceV2