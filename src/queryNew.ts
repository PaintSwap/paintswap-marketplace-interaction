#!/usr/bin/env ts-node
/* eslint-disable no-console */

import { ethers } from 'ethers'
import { MarketplaceV1 } from './lib'

const RPC = 'https://evm.kava.io'
const provider = new ethers.providers.JsonRpcProvider(RPC)

const marketplace = new MarketplaceV1(provider)

const QueryID = 2 // https://paintswap.finance/marketplace/2

marketplace.getNextMarketplaceId().then((next: ethers.BigNumber) => {
  const current = next.sub(1)
  console.log(`The latest sale on the marketplace is ID ${current} : https://paintswap.finance/marketplace/${current}`)
})

marketplace.getSaleDetails(ethers.BigNumber.from(QueryID)).then((details) => {
  console.log(`Sale details for sale ${QueryID}:\n`, details)
})
