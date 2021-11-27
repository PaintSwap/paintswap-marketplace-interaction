#!/usr/bin/env ts-node

import { ethers } from "ethers"
import MarketplaceV2 from "./lib/marketplaceV2"

const provider = new ethers.providers.JsonRpcProvider(
    "https://rpc.ftm.tools/"
);

const marketplace = new MarketplaceV2(provider)

marketplace.onNewSale((sale) => {
    console.log('New listing!\n', sale)
})

marketplace.onSold((sale) => {
    console.log('Sold!\n', sale)
})