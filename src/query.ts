#!/usr/bin/env ts-node
/* eslint-disable no-console */

import { ethers } from 'ethers'
import { Marketplace } from './lib'

const RPC = 'https://rpc.soniclabs.com'
const provider = new ethers.providers.JsonRpcProvider(RPC)

const marketplace = new Marketplace(provider)

marketplace.getNextMarketplaceId().then((next: ethers.BigNumber) => {
  const current = next.sub(1)
  console.log(`The latest listing on the marketplace is ID ${current} : https://paintswap.io/sonic/${current}`)

  marketplace.getSaleDetails(ethers.BigNumber.from(current)).then((details) => {
    console.log(`Sale details for sale ${current}:\n`, details)
  })
})
