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
  const filter = marketplace.contract.filters.NewSale()

  // Then here query with the filter
  marketplace.contract.queryFilter(filter, fromBlock, toBlock).then((result) => {
    // For each event retrieved...
    result.forEach((event) => {
      // Pass to the appropriate handler
      const bundle = marketplace.handleNewListingAsBundle(event.args, event)
      // console.log('Listing bundle:\n', bundle, '\n\n')

      // Some handlers return bundles, which can then be split into individual NFTs
      const split = MarketplaceV3Utils.splitBundleNewSale(bundle)
      split.forEach((listing) => {
        console.log('Listing:\n', listing, '\n\n')
      })
    })
    console.log(result.length, 'sales seen through filter')
  })
}

/* ------- New Offers --------- */

const retrieveNewOffers = () => {
  const filter = marketplace.contract.filters.NewOffer()

  marketplace.contract.queryFilter(filter, fromBlock, toBlock).then((result) => {
    result.forEach((event) => {
      const [bundle, isSaleOffer] = marketplace.handleNewOfferAsBundle(event.args, event)
      const split = MarketplaceV3Utils.splitBundleNewOffer(bundle)
      split.forEach((offer) => {
        console.log(`Offer (on a sale? ${isSaleOffer}):\n`, offer, '\n\n')
      })
    })
    console.log(result.length, 'offers seen through filter')
  })
}

/* ------- New Collectioin Offers --------- */

const retrieveNewCollectionOffers = () => {
  const filter = marketplace.contract.filters.NewCollectionOffer()

  marketplace.contract.queryFilter(filter, fromBlock, toBlock).then((result) => {
    result.forEach((event) => {
      const offer = marketplace.handleNewCollectionOffer(event.args, event)
      console.log(`New collection offer:\n`, offer, '\n\n')
    })
    console.log(result.length, 'New collection offers seen through filter')
  })
}

/* ------- New Filtered Collectioin Offers --------- */

const retrieveNewFilteredCollectionOffers = () => {
  const filter = marketplace.contract.filters.NewFilteredCollectionOffer()

  marketplace.contract.queryFilter(filter, fromBlock, toBlock).then((result) => {
    result.forEach((event) => {
      const offer = marketplace.handleNewFilteredCollectionOffer(event.args, event)
      console.log(`New filtered collection offer:\n`, offer, '\n\n')
    })
    console.log(result.length, 'New filtered collection offers seen through filter')
  })
}

/* ------- Removed Offers --------- */

const retrieveRemovedOffers = () => {
  const filter = marketplace.contract.filters.OfferRemoved()

  marketplace.contract.queryFilter(filter, fromBlock, toBlock).then((result) => {
    result.forEach((event) => {
      const offer = marketplace.handleOfferRemoved(event.args, event)
      console.log(`Removed offer:\n`, offer, '\n\n')
    })
    console.log(result.length, 'removed offers seen through filter')
  })
}

/* ------- Accepted Offers --------- */

const retrieveAcceptedOffers = () => {
  const filter = marketplace.contract.filters.OfferAccepted()

  marketplace.contract.queryFilter(filter, fromBlock, toBlock).then((result) => {
    result.forEach((event) => {
      const offer = marketplace.handleOfferAccepted(event.args, event)
      console.log(`Accepted offer:\n`, offer, '\n\n')
    })
    console.log(result.length, 'accepted offers seen through filter')
  })
}


/* ------- Finished sales --------- */

const retrieveFinished = () => {
  const filter = marketplace.contract.filters.SaleFinished()

  marketplace.contract.queryFilter(filter, fromBlock, toBlock).then((result) => {
    result.forEach((event) => {
      const sale = marketplace.handleFinished(event.args, event)
      console.log(`Sale finished:\n`, sale, '\n\n')
    })
    console.log(result.length, 'finished sales seen through filter')
  })
}


/* ---------------------------- */
// Enable only one to avoid scrambling the terminal, as they happen async
retrieveNewListings()
// retrieveNewOffers()
// retrieveNewCollectionOffers()
// retrieveNewFilteredCollectionOffers()
// retrieveRemovedOffers()
// retrieveAcceptedOffers()
// retrieveFinished()
