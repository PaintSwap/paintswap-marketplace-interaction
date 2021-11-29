#!/usr/bin/env ts-node
/* eslint-disable no-console */

import { ethers } from 'ethers'
import { MarketplaceV2, SaleDetails } from './lib'

const provider = new ethers.providers.JsonRpcProvider('https://rpc.ftm.tools/')

const marketplace = new MarketplaceV2(provider)

const QueryID = 68897 // https://paintswap.finance/marketplace/68897

marketplace.getNextMarketplaceId().then((next: ethers.BigNumber) => {
  const current = next.sub(1)
  console.log(`The latest sale on the marketplace is ID ${current} : https://paintswap.finance/marketplace/${current}`)
})

marketplace.getSaleDetails(ethers.BigNumber.from(QueryID)).then((details: SaleDetails) => {
  console.log(`Sale details for sale ${QueryID}:\n`, details)
})

marketplace.getNextMinimumBidOrOffer(ethers.BigNumber.from(QueryID)).then((next) => {
  console.log(`Next minimum bid or offer for sale ${QueryID}: `, `${ethers.utils.formatEther(next.toString())} $FTM`)
})
