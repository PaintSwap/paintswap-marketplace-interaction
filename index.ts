#!/usr/bin/env ts-node

import { ethers } from "ethers"
import MarketplaceV2 from "./lib/marketplaceV2"
import { V2BundleSold, V2Sold } from "./lib/types";

const provider = new ethers.providers.JsonRpcProvider(
    "https://rpc.ftm.tools/"
);

const marketplace = new MarketplaceV2(provider)

marketplace.onSold(console.log)