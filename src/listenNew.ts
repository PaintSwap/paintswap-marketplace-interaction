#!/usr/bin/env ts-node
/* eslint-disable no-console */

import { ethers } from 'ethers'
import { MarketplaceV1 } from './lib'

const RPC = 'https://evm.kava.io'
const provider = new ethers.providers.JsonRpcProvider(RPC)

const marketplace = new MarketplaceV1(provider)

marketplace.onNewListing((sale) => {
  console.log('New listing!\n', sale)
})

marketplace.onNewListingBatch((sales) => {
  console.log('New listing batch!\n', sales)
})

marketplace.onSold((sale) => {
  console.log('Sold!\n', sale)
})

marketplace.onFinished((sale) => {
  console.log('Finished sale\n', sale)
})

marketplace.onCancelled((sale) => {
  console.log('Cancelled sale\n', sale)
})

marketplace.onPriceUpdate((sale) => {
  console.log('Price updated\n', sale)
})

marketplace.onDurationExtended((extension) => {
  console.log('Auction duration extended\n', extension)
})

marketplace.onNewBid((bid) => {
  console.log('New bid\n', bid)
})

marketplace.onNewOffer((offer, isSaleOffer) => {
  console.log(`New offer (on a sale? ${isSaleOffer})\n`, offer)
})

marketplace.onOfferRemoved((offer) => {
  console.log('Offer removed\n', offer)
})

marketplace.onOfferAccepted((offer) => {
  console.log('Offer accepted\n', offer)
})

marketplace.onOfferUpdated((offer) => {
  console.log('Offer updated\n', offer)
})
