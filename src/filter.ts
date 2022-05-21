#!/usr/bin/env ts-node
/* eslint-disable no-console */

/** This is a good example on testing without needing to wait for new events, as ethers queryFilter will retrieve past events */

import { ethers } from 'ethers'
import { MarketplaceV3, MarketplaceV3Utils } from './lib'

const provider = new ethers.providers.JsonRpcProvider('https://rpc.ftm.tools/')

const marketplace = new MarketplaceV3(provider)

// Options can be given to queryFilter
const fromBlock = null
const toBlock = null

/* ------- New Listings --------- */

const retrieveNewListings = () => {
  /**
   * The last part is the event name, which does NOT necessarily match the usual function names
   * Look in marketplaceV3.ts :  this.contract.on('EVENT_NAME', ...)
   */
  const newSalesFilter = marketplace.contract.filters.NewSale()

  // Then here query with the filter
  marketplace.contract.queryFilter(newSalesFilter, fromBlock, toBlock).then((newSales) => {
    // For each event retrieved...
    newSales.forEach((event) => {
      // Pass to the appropriate handler
      const bundle = marketplace.handleNewListingAsBundle(event.args, event)
      // console.log('Listing bundle:\n', bundle, '\n\n')

      // Some handlers return bundles, which can then be split into individual NFTs
      const split = MarketplaceV3Utils.splitBundleNewSale(bundle)
      split.forEach((listing) => {
        console.log('Listing:\n', listing, '\n\n')
      })
    })
    console.log(newSales.length, 'sales seen through filter')
  })
}

/* ------- New Offers --------- */

const retrieveNewOffers = () => {
  const newOffersFilter = marketplace.contract.filters.NewOffer()

  marketplace.contract.queryFilter(newOffersFilter, fromBlock, toBlock).then((newOffers) => {
    newOffers.forEach((event) => {
      const [bundle, isSaleOffer] = marketplace.handleNewOfferAsBundle(event.args, event)
      const split = MarketplaceV3Utils.splitBundleNewOffer(bundle)
      split.forEach((offer) => {
        console.log(`Offer (on a sale? ${isSaleOffer}):\n`, offer, '\n\n')
      })
    })
    console.log(newOffers.length, 'offers seen through filter')
  })
}

/* ------- Removed Offers --------- */

const retrieveRemovedOffers = () => {
  const removedOffersFilter = marketplace.contract.filters.OfferRemoved()

  marketplace.contract.queryFilter(removedOffersFilter, fromBlock, toBlock).then((removedOffers) => {
    removedOffers.forEach((event) => {
      const offer = marketplace.handleOfferRemoved(event.args, event)
        console.log(`Removed offer:\n`, offer, '\n\n')
    })
    console.log(removedOffers.length, 'removed offers seen through filter')
  })
}

/* ------- Finished sales --------- */

const retrieveFinished = () => {
  const finishedFilter = marketplace.contract.filters.SaleFinished()

  marketplace.contract.queryFilter(finishedFilter, fromBlock, toBlock).then((finished) => {
    finished.forEach((event) => {
      const sale = marketplace.handleFinished(event.args, event)
      console.log(`Sale finished:\n`, sale, '\n\n')
    })
    console.log(finished.length, 'finished sales seen through filter')
  })
}

/* ---------------------------- */
// Enable only one to avoid scrambling the terminal, as they happen async
// retrieveNewListings()
retrieveNewOffers()
// retrieveRemovedOffers()
// retrieveFinished()
