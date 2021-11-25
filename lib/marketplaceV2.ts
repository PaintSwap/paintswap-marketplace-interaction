import { ethers } from "ethers";
import { Sold } from "./types"

const MarketplaceV2ABI: ethers.ContractInterface = require("../abi/PaintSwapMarketplaceV2.json");
const MarketplaceV2Address = "0x6125fD14b6790d5F66509B7aa53274c93dAE70B9"

export class MarketplaceV2 {
    contract: ethers.Contract

    constructor(provider: ethers.providers.BaseProvider, address: string = MarketplaceV2Address) {
        this.contract = new ethers.Contract(address, MarketplaceV2ABI, provider)
    }

    onSold(callback: (sale: Sold) => void): void {
        this.contract.on("Sold", (marketPlaceId, nfts, tokenIds, amountBatches, price, buyer, seller, amount, event) => {
            // @TODO document this is could be a bundle but we transform into individual NFTs here
            for (let i = 0; i < nfts.length; ++i) {
                const sale: Sold = {
                    marketPlaceId,
                    collection: nfts[i],
                    tokenID: tokenIds[i],
                    amount: amountBatches[i],
                    price,
                    buyer,
                    seller
                };

                callback(sale)
            }
        })
    }
}

export default MarketplaceV2