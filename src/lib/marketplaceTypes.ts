import { ethers, BigNumber } from 'ethers'

// -----------

export interface Listing {
  nft:string
  tokenId:BigNumber
  price:BigNumber
  duration:Number
  amount:Number
  isUsingVault:Boolean
  isAuction:Boolean
  isAntisnipe:Boolean
  isFlashAuction:Boolean
  isNSFW:Boolean
  searchKeywords:string
  donationAddress:string
  donationPercent:Number
}

export interface NewListing {
  marketplaceId: BigNumber
  listing: Listing
  seller: string
  event?: ethers.Event
}

export interface NewListingBatch {
  firstMarketplaceId: BigNumber
  listings: Listing[]
  seller: string
  event?: ethers.Event
}

// -----------

export interface Sold {
  marketplaceId: BigNumber
  price: BigNumber
  buyer: string
  amount: Number
  offerId: BigNumber
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

export interface DurationExtended {
  marketplaceId: BigNumber
  endTime: BigNumber // as defined by solidity, seconds since the unix epoch
  event?: ethers.Event
}

// -----------

export interface NewOffer {
  offerId: BigNumber
  marketplaceId?: BigNumber // offers can be made outside of sales, in which case this is null
  nft: string
  tokenId: BigNumber
  from: string
  quantity: Number
  price: BigNumber
  expires: BigNumber // as defined by solidity, seconds since the unix epoch
  searchKeywords: string
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
  quantity: Number
  price: BigNumber
  expires: BigNumber // as defined by solidity, seconds since the unix epoch
  searchKeywords: string
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
  searchKeywords: Array<string>
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
  nft: string
  tokenId: BigNumber
  endTime: Number
  price: BigNumber // per unit, reserve price if auction
  seller: string
  // For auctions
  isAuction: boolean
  auctionStartTime: Number
  highestBid: BigNumber
  highestBidder: string
  antisnipe: boolean
  flashAuction: boolean
  // Donation info
  donationAddress: string // 0 if there is no donation
  donationPercent: Number
  // How many remain
  amountRemaining: Number
  // The token payment is expected for
  vault: string // 0 if no vault is involved
}
