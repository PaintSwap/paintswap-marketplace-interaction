# Paintswap Marketplace Interaction

Provides a typescript-enabled wrapper around the PaintSwap MarketplaceV2 contract.

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

Types are deefined in [marketplaceV2Types](./src/lib/marketplaceV2Types.ts).

[MarketplaceV2](./src/lib/marketplaceV2.ts) defines a typescript-enabled wrapper around the events and getters of the main contract to make it simpler to use.

Scripts [listen.ts](./src/listen.ts) and [query.ts](./src/query.ts) provide examples of interactions all functions defined by the `MarketplaceV2` class.

### Use in your own scripts

First, include `@paintswap/marketplace-interactions` in your `package.json`.

As an example if you'd like to subscribe to Sold events:

```ts
import { MarketplaceV2, Sold } from '@paintswap/marketplace-interactions';

const provider = new ethers.providers.JsonRpcProvider(
  "https://rpc.ftm.tools/"
);

const marketplace = new MarketplaceV2(provider)

v2.onSold((sale) => console.log(sale))
```

### Reliability and Guarantees

Please note this library is only as reliable as the given RPC provider and the events that come through it. There is no guarantee of event delivery.

## Upcoming

See existing [Enhancement Issues](https://github.com/PaintSwap/paintswap-marketplace-interaction/labels/enhancement)