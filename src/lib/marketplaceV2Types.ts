import { ethers, BigNumber } from 'ethers'

export interface BundleBase {
  marketplaceId: BigNumber
  nfts: Array<string> // the collections
  tokenIds: Array<BigNumber>
  amountBatches: Array<BigNumber> // individual amounts within each bundle
}

export interface BundlePriced extends BundleBase {
  amount: BigNumber
  pricePerUnit: BigNumber
  priceTotal: BigNumber
}

export interface Base {
  marketplaceId: BigNumber
  collection: string
  tokenID: BigNumber
  amountPerBundleUnit: BigNumber
}

export interface Priced extends Base {
  amount: BigNumber
  pricePerUnit: BigNumber
  priceTotal: BigNumber
}

// -----------

interface NewListingBase {
  duration: BigNumber
  isAuction: boolean
  isNSFW: boolean
}

export interface NewBundleListing extends BundlePriced, NewListingBase {
  event: ethers.Event
}

// NewBundleListing splits into NewListing
export interface NewListing extends Priced, NewListingBase {
  event: ethers.Event
}

// -----------

// A type describing a successful sale (e.g. direct buy, offer accepted or auction finished with a bid)
interface SoldBase {
  buyer: string
  seller: string
}

export interface BundleSold extends BundlePriced, SoldBase {
  event: ethers.Event
}

// BundleSold splits into Sold
export interface Sold extends Priced, SoldBase {
  event: ethers.Event
}

// -----------

export interface BundleUnsold extends BundleBase {
  event: ethers.Event
}

// BundleUnsold splits into Unsold
export interface Unsold extends Base {
  event: ethers.Event
}

// -----------

export interface BundlePriceUpdate {
  marketplaceId: BigNumber
  price: BigNumber
  event: ethers.Event
}

// -----------

export interface DurationExtended {
  marketplaceId: BigNumber
  endTime: BigNumber // as defined by solidity, seconds since the unix epoch
  event: ethers.Event
}

// -----------

export interface NewBid {
  marketplaceId: BigNumber
  bidder: string
  bid: BigNumber
  nextMinimum: BigNumber
  event: ethers.Event
}

export interface NewOffer {
  marketplaceId: BigNumber
  offerrer: string
  offer: BigNumber
  nextMinimum: BigNumber
  event: ethers.Event
}

// -----------

export type SaleDetails = {
  nfts: Array<string>
  tokenIds: Array<BigNumber>
  amountBatches: Array<BigNumber>
  seller: string
  price: BigNumber // per unit, reserve price if auction
  startTime: BigNumber
  endTime: BigNumber // as defined by solidity, seconds since the unix epoch
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
