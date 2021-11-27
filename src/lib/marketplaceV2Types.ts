import { BigNumber } from 'ethers'

export interface BundleBase {
  marketplaceId: BigNumber
  nfts: Array<string> // the collections
  tokenIds: Array<BigNumber>
  amountBatches: Array<BigNumber> // individual amounts within each bundle
}

export interface BundlePriced extends BundleBase {
  amount: BigNumber
  price: BigNumber
}

export interface Base {
  marketplaceId: BigNumber
  collection: string
  tokenID: BigNumber
  amountInBundle: BigNumber
}

export interface Priced extends Base {
  amount: BigNumber
  price: BigNumber
}

// -----------

// A type describing a new listing
interface NewSaleBase {
  duration: BigNumber
  isAuction: boolean
  isNSFW: boolean
}

export interface NewBundleSale extends BundlePriced, NewSaleBase {}

// NewBundleSale splits into NewSale
export interface NewSale extends Priced, NewSaleBase {}

// -----------

// A type describing a successful sale (e.g. direct buy, offer accepted or auction finished with a bid)
interface SoldBase {
  buyer: string
  seller: string
}

export interface BundleSold extends BundlePriced, SoldBase {}

// BundleSold splits into Sold
export interface Sold extends Priced, SoldBase {}

// -----------

export interface BundleUnsold extends BundleBase {}

// BundleUnsold splits into Unsold
export interface Unsold extends Base {}

// -----------

export interface BundlePriceUpdate {
  marketplaceId: BigNumber
  price: BigNumber
}

// -----------

export interface DurationExtended {
  marketplaceId: BigNumber
  endTime: BigNumber
}

// -----------

export interface NewBid {
  marketplaceId: BigNumber
  bidder: string
  bid: BigNumber
  nextMinimum: BigNumber
}

export interface NewOffer {
  marketplaceId: BigNumber
  offerrer: string
  offer: BigNumber
  nextMinimum: BigNumber
}

// -----------

export type saleDetails = {
  nfts: Array<string>
  tokenIds: Array<BigNumber>
  amountBatches: Array<BigNumber>
  seller: string
  price: BigNumber // reserve price if auction
  startTime: BigNumber
  endTime: BigNumber
  // For bids/offers
  maxBidOrOffer: BigNumber
  maxBidderOrOfferer: string
  // Whether this is an auction
  isAuction: boolean
  // How many are they selling and how many remain (the bundles themselves)
  amount: BigNumber
  amountRemaining: BigNumber
  complete: boolean
  devFeePercentage: BigNumber
}
