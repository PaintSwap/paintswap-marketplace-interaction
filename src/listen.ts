#!/usr/bin/env ts-node
/* eslint-disable no-console */

import { ethers } from 'ethers'
import MarketplaceV2 from './lib/marketplaceV2'

const provider = new ethers.providers.JsonRpcProvider('https://rpc.ftm.tools/')

const marketplace = new MarketplaceV2(provider)

marketplace.onNewListing((sale) => {
  console.log('New listing!\n', sale)
})

marketplace.onSold((sale) => {
  console.log('Sold!\n', sale)
})

marketplace.onUnsold((sale, cancelled) => {
  if (cancelled) console.log('Cancelled sale\n', sale)
  else console.log('Failed to sell\n', sale)
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

marketplace.onNewOffer((offer) => {
  console.log('New offer\n', offer)
})
