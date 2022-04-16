#!/usr/bin/env ts-node
/* eslint-disable no-console */

import { ethers } from 'ethers'
import { MarketplaceV3 } from './lib'

const provider = new ethers.providers.JsonRpcProvider('https://rpc.ftm.tools/')

const marketplace = new MarketplaceV3(provider)

marketplace.onNewListing((sale) => {
  console.log('New listing!\n', sale)
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

marketplace.onStartDelayed((delay) => {
  console.log('Sale start delayed\n', delay)
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

marketplace.onOfferAccepted((offer) => {
  console.log('Offer accepted\n', offer)
})

marketplace.onOfferRejected((offer) => {
  console.log('Offer rejected\n', offer)
})

marketplace.onOfferUpdated((offer) => {
  console.log('Offer updated\n', offer)
})
