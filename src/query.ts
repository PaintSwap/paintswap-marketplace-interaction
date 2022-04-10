#!/usr/bin/env ts-node
/* eslint-disable no-console */

import { ethers } from 'ethers'
import { MarketplaceV3 } from './lib'

const provider = new ethers.providers.JsonRpcProvider('https://rpc.ftm.tools/')

const marketplace = new MarketplaceV3(provider)

const QueryID = 30001 // https://paintswap.finance/marketplace/30001

marketplace.getNextMarketplaceId().then((next: ethers.BigNumber) => {
  const current = next.sub(1)
  console.log(`The latest sale on the marketplace is ID ${current} : https://paintswap.finance/marketplace/${current}`)
})

marketplace.getSaleDetails(ethers.BigNumber.from(QueryID)).then((details) => {
  console.log(`Sale details for sale ${QueryID}:\n`, details)
})

marketplace.getNextMinimumBid(ethers.BigNumber.from(QueryID)).then((next) => {
  console.log(`Next minimum bid for sale ${QueryID}: `, `${ethers.utils.formatEther(next.toString())} $FTM`)
})
