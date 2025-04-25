# Paintswap Marketplace Interaction

Provides a typescript-enabled wrapper around the PaintSwap MarketplaceV3 contract.

## Setup

Requires: yarn

```bash
yarn install
```

## Run

### Listen to different kinds of events from the marketplace

```bash
yarn listen
```

### Query sale details on a specific marketplace sale ID

```bash
yarn query
```

## @paintswap/marketplace-interactions

Types for Sonic are defined in [marketplaceTypes](./src/lib/marketplaceTypes.ts).

[Marketplace](./src/lib/marketplace.ts) defines a typescript-enabled wrapper around the events and getters of the main contract to make it simpler to use.

Scripts [listen.ts](./src/listen.ts) and [query.ts](./src/query.ts) provide examples of interactions all functions defined by the `Marketplace` class.

Script [filter.ts](./src/filter.ts) is more advanced and provides an example on building a `queryFilter` to retrieve past events. Great for testing without having to wait for new events!

### Use in your own scripts

First, include `@paintswap/marketplace-interactions` in your `package.json`.

As an example if you'd like to subscribe to Sold events:

```ts
import { Marketplace } from '@paintswap/marketplace-interactions';
import { ethers } from 'ethers'

const provider = new ethers.providers.JsonRpcProvider(
  "https://rpc.soniclabs.com/"
);

const marketplace = new Marketplace(provider)

marketplace.onSold((sale) => console.log(sale))
```

### Reliability and Guarantees

Please note this library is only as reliable as the given RPC provider and the events that come through it. There is no guarantee of event delivery.

## Upcoming

See existing [Enhancement Issues](https://github.com/PaintSwap/paintswap-marketplace-interaction/labels/enhancement)