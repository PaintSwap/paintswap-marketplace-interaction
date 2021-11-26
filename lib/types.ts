import { BigNumber } from "ethers"

// A direct translation of the Sold event
export type V2BundleSold = {
    marketplaceId: BigNumber
    nfts: Array<string> // the collection
    tokenIds: Array<BigNumber>
    amountBatches: Array<BigNumber> // individual amounts within each bundle sold
    price: BigNumber
    buyer: string
    seller: string
    amount: BigNumber // number of bundles sold
}

export type V2Sold = {
    marketplaceId: BigNumber
    collection: string
    tokenID: BigNumber
    amount: BigNumber
    price: BigNumber
    buyer: string
    seller: string
}