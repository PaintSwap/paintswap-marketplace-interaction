import { BigNumber } from "ethers"

export type BundleSold = {
    marketplaceId: BigNumber
    nfts: Array<string>
    tokenIds: Array<string>
    amountBatches: Array<BigNumber>
    price: BigNumber
    buyer: string
    seller: string
    amount: BigNumber //@TODO
}

export type Sold = {
    marketPlaceId: BigNumber
    collection: string
    tokenID: BigNumber
    amount: BigNumber
    price: BigNumber
    buyer: string
    seller: string
}
