# Paintswap Marketplace Interaction

## Setup

Requires: npm

```bash
npm install .
```

## Run

### Listen to different kinds of events from the marketplace

```bash
npm run listen
```

### Query sale details on a specific marketplace sale ID

```bash
npm run query
```

## For developers

Files `listen.ts` and `query.ts` provide examples of interactions with all functions defined by the `MarketplaceV2` class.

`MarketplaceV2` defines a wrapper around the events and getters of the main contract.

To better understand the types, you will want to take a look at the files within `lib/`.

## Upcoming

* Contract interaction: buy, make offers, make bids
* Examples to query the Paintswap API to get rich information about NFTs and sales