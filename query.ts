#!/usr/bin/env ts-node

import { ethers } from "ethers"
import MarketplaceV2 from "./lib/marketplaceV2"

const provider = new ethers.providers.JsonRpcProvider(
    "https://rpc.ftm.tools/"
);

const marketplace = new MarketplaceV2(provider)

const QueryID = 68897 // https://paintswap.finance/marketplace/68897

marketplace.getSaleDetails(ethers.BigNumber.from(QueryID)).then((details) => {
    console.log(`Sale details for sale ${QueryID}:\n`, details)
})

marketplace.getNextMinimumBidOrOffer(ethers.BigNumber.from(QueryID)).then((next) => {
    console.log(`Next minimum bid or offer for sale ${QueryID}: `, `${ethers.utils.formatEther(next.toString())} $FTM`)
})