#!/usr/bin/env ts-node
"use strict";
/* eslint-disable no-console */
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const lib_1 = require("./lib");
const provider = new ethers_1.ethers.providers.JsonRpcProvider('https://rpc.ftm.tools/');
const marketplace = new lib_1.MarketplaceV3(provider);
const QueryID = 300000; // https://paintswap.finance/marketplace/300000
marketplace.getNextMarketplaceId().then((next) => {
    const current = next.sub(1);
    console.log(`The latest sale on the marketplace is ID ${current} : https://paintswap.finance/marketplace/${current}`);
});
marketplace.getSaleDetails(ethers_1.ethers.BigNumber.from(QueryID)).then((details) => {
    console.log(`Sale details for sale ${QueryID}:\n`, details);
});
marketplace.getNextMinimumBid(ethers_1.ethers.BigNumber.from(QueryID)).then((next) => {
    console.log(`Next minimum bid for sale ${QueryID}: `, `${ethers_1.ethers.utils.formatEther(next.toString())} $FTM`);
});
