#!/usr/bin/env ts-node
"use strict";
/* eslint-disable no-console */
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const lib_1 = require("./lib");
const RPC = 'https://evm.kava.io';
const provider = new ethers_1.ethers.providers.JsonRpcProvider(RPC);
const marketplace = new lib_1.MarketplaceV1(provider);
const QueryID = 2; // https://paintswap.finance/marketplace/2
marketplace.getNextMarketplaceId().then((next) => {
    const current = next.sub(1);
    console.log(`The latest sale on the marketplace is ID ${current} : https://paintswap.finance/marketplace/${current}`);
});
marketplace.getSaleDetails(ethers_1.ethers.BigNumber.from(QueryID)).then((details) => {
    console.log(`Sale details for sale ${QueryID}:\n`, details);
});
