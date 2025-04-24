#!/usr/bin/env ts-node
"use strict";
/* eslint-disable no-console */
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const lib_1 = require("./lib");
const RPC = 'https://rpc.soniclabs.com';
const provider = new ethers_1.ethers.providers.JsonRpcProvider(RPC);
const marketplace = new lib_1.Marketplace(provider);
marketplace.getNextMarketplaceId().then((next) => {
    const current = next.sub(1);
    console.log(`The latest listing on the marketplace is ID ${current} : https://paintswap.io/sonic/${current}`);
    marketplace.getSaleDetails(ethers_1.ethers.BigNumber.from(current)).then((details) => {
        console.log(`Sale details for sale ${current}:\n`, details);
    });
});
