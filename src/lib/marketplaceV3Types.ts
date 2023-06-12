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
  nft: string
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
  seller: string
  antisnipe: boolean
  flashAuction: boolean
}

export interface NewBundleListing extends BundlePriced, NewListingBase {
  event?: ethers.Event
}

// NewBundleListing splits into NewListing
export interface NewListing extends Priced, NewListingBase {
  event?: ethers.Event
}

// -----------

// A type describing a successful sale (e.g. direct buy, offer accepted or auction finished with a bid)
interface SoldBase {
  buyer: string
  seller: string
  offerId: BigNumber
}

export interface BundleSold extends BundlePriced, SoldBase {
  event?: ethers.Event
}

// BundleSold splits into Sold
export interface Sold extends Priced, SoldBase {
  event?: ethers.Event
}

// -----------

// Sale finished, it was not cancelled. No information on whether the sale was successful here
export interface SaleFinished {
  marketplaceId: BigNumber
  event?: ethers.Event
}

// Sale was cancelled.
export interface Cancelled {
  marketplaceId: BigNumber
  event?: ethers.Event
}

// -----------

export interface PriceUpdate {
  marketplaceId: BigNumber
  price: BigNumber
  event?: ethers.Event
}

// -----------

export interface StartDelayed {
  marketplaceId: BigNumber
  startTime: BigNumber // as defined by solidity, seconds since the unix epoch
  event?: ethers.Event
}

export interface DurationExtended {
  marketplaceId: BigNumber
  endTime: BigNumber // as defined by solidity, seconds since the unix epoch
  event?: ethers.Event
}

// -----------

export interface NewOfferBase {
  marketplaceId?: BigNumber // offers can be made outside of sales, in which case this is null
  offerId: BigNumber
  from: string
  expires: BigNumber // as defined by solidity, seconds since the unix epoch
  price: BigNumber
  quantity: BigNumber
}

export interface NewBundleOffer extends NewOfferBase {
  nfts: Array<string> // the collections
  tokenIds: Array<BigNumber>
  event?: ethers.Event
}

// NewBundleOffer splits into NewOffer
export interface NewOffer extends NewOfferBase {
  nft: string
  tokenID: BigNumber
  event?: ethers.Event
}

export interface OfferRemoved {
  offerId: BigNumber
  event?: ethers.Event
}

export interface OfferAccepted {
  offerId: BigNumber
  nft: string
  tokenId: BigNumber
  quantity: BigNumber
  marketplaceId: BigNumber
  event?: ethers.Event
}

export interface OfferUpdated {
  offerId: BigNumber
  nft: string
  tokenId: BigNumber
  quantity: BigNumber
  newPrice: BigNumber
  expires: BigNumber // as defined by solidity, seconds since the unix epoch
  event?: ethers.Event
}

// -----------

export interface NewCollectionOffer {
  offerId: BigNumber
  nft: string
  from: string
  quantity: BigNumber
  price: BigNumber
  expires: BigNumber // as defined by solidity, seconds since the unix epoch
}

export interface NewFilteredCollectionOffer {
  offerId: BigNumber
  nft: string
  tokenIds: Array<BigNumber>
  from: string
  quantity: BigNumber
  price: BigNumber // if prices array is populated, disregard this
  prices: Array<BigNumber> // if not all the same price uses array
  expires: BigNumber // as defined by solidity, seconds since the unix epoch
}

// -----------

export interface NewBid {
  marketplaceId: BigNumber
  bidder: string
  bid: BigNumber
  nextMinimum: BigNumber
  event?: ethers.Event
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
  // For bids
  maxBid: BigNumber
  maxBidder: string
  // Whether this is an auction
  isAuction: boolean
  // How many are they selling and how many remain (the bundles themselves)
  amount: BigNumber
  amountRemaining: BigNumber
  // The token payment is expected for
  paymentToken: string
  complete: boolean
  devFeePercentage: BigNumber
  devFeeFNFTPercentage: BigNumber
  vault: string // 0 if no vault is involved
}
