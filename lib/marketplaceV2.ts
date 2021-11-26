import { ethers } from "ethers";
import { V2Sold, V2BundleSold } from "./types"

const MarketplaceV2ABI: ethers.ContractInterface = require("../abi/PaintSwapMarketplaceV2.json");
const MarketplaceV2Address = "0x6125fD14b6790d5F66509B7aa53274c93dAE70B9"

export class MarketplaceV2 {
    contract: ethers.Contract

    constructor(provider: ethers.providers.BaseProvider, address: string = MarketplaceV2Address) {
        this.contract = new ethers.Contract(address, MarketplaceV2ABI, provider)
    }

    onSold(callback: (sale: V2Sold) => void): void {
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

            this.#handleBundleSold(bundle, callback)
        })
    }

    #handleBundleSold(bundle: V2BundleSold, callback: (sale: V2Sold) => void): void {
        for (let i = 0; i < bundle.nfts.length; ++i) {
            const sale: V2Sold = {
                marketplaceId: bundle.marketplaceId,
                collection: bundle.nfts[i],
                tokenID: bundle.tokenIds[i],
                amount: bundle.amount.mul(bundle.amountBatches[i]),
                price: bundle.price,
                buyer: bundle.buyer,
                seller: bundle.seller
            };

            callback(sale)
        }
    }
}

export default MarketplaceV2