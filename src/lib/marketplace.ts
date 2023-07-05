import { BigNumber, ethers } from 'ethers'
import * as V1 from './marketplaceTypes'
import MarketplaceABIRaw from '../abi/PaintSwapMarketplace.json'

export const MarketplaceABI: ethers.ContractInterface = MarketplaceABIRaw
export const MarketplaceAddress = '0xeb8E5876Eb79c628929944dDf3521Ad893d57827'

export class MarketplaceV1 {
  contract: ethers.Contract

  /**
   * @param providerOrSigner an ethers compatible provider or signer https://docs.ethers.io/v5/api/providers/
   * @param address if given, overrides the default marketplace contract address
   */
  constructor(providerOrSigner: ethers.providers.Provider | ethers.Signer, address: string = MarketplaceAddress) {
    this.contract = new ethers.Contract(address, MarketplaceABI, providerOrSigner)
  }

  handleNewListing(args, event): V1.NewListing {
    return {
      ...args,
      event,
    }
  }

  /**
   * @param callback called for new listings, as individual NFTs
   */
  onNewListing(callback: (sale: V1.NewListing) => void): void {
    this.contract.on('NewListing', (...args: any) => {
      const event = args.slice(-1)[0]
      callback(this.handleNewListing(event.args, event))
    })
  }

  handleNewListingBatch(args, event): V1.NewListingBatch {
    return {
      ...args,
      event,
    }
  }

  /**
   * @param callback called for new listings as a batch, as individual NFTs
   */
  onNewListingBatch(callback: (sales: V1.NewListingBatch) => void): void {
    this.contract.on('NewListingBatch', (...args: any) => {
      const event = args.slice(-1)[0]
      callback(this.handleNewListingBatch(event.args, event))
    })
  }

  handleSold(args, event): V1.Sold {
    return {
      ...args,
      event,
    }
  }

  /**
   * @param callback called for successfuly sold items, as individual NFTs
   */
  onSold(callback: (sale: V1.Sold) => void): void {
    this.contract.on('Sold', (...args: any) => {
      const event = args.slice(-1)[0]
      callback(this.handleSold(event.args, event))
    })
  }

  handleFinished(args, event): V1.SaleFinished {
    const sale: V1.SaleFinished = {
      ...args,
      event,
    }
    return sale
  }

  /**
   * @param callback called for finished sales
   * @note does not provide cancelled sales
   * @note sale may have been successful or not
   */
  onFinished(callback: (sale: V1.SaleFinished) => void): void {
    this.contract.on('SaleFinished', (...args: any) => {
      const event = args.slice(-1)[0]
      callback(this.handleFinished(event.args, event))
    })
  }

  handleCancelled(args, event): V1.Cancelled {
    // Not handled as individual pieces due to missing amountBatches information
    const sale: V1.Cancelled = {
      ...args,
      event,
    }
    return sale
  }

  /**
   * @param callback called for cancelled sales
   */
  onCancelled(callback: (bundle: V1.Cancelled) => void): void {
    this.contract.on('CancelledSale', (...args: any) => {
      const event = args.slice(-1)[0]
      callback(this.handleCancelled(event.args, event))
    })
  }

  handlePriceUpdate(args, event): V1.PriceUpdate {
    // Not handled as individual pieces due to missing amountBatches information
    const sale: V1.PriceUpdate = {
      ...args,
      event,
    }
    return sale
  }

  /**
   * @param callback called for price updates to sales
   */
  onPriceUpdate(callback: (bundle: V1.PriceUpdate) => void): void {
    this.contract.on('UpdatePrice', (...args: any) => {
      const event = args.slice(-1)[0]
      callback(this.handlePriceUpdate(event.args, event))
    })
  }

  handleDurationExtended(args, event): V1.DurationExtended {
    const sale: V1.DurationExtended = {
      ...args,
      event,
    }
    return sale
  }

  /**
   * @param callback called when sales are extended
   */
  onDurationExtended(callback: (sale: V1.DurationExtended) => void): void {
    this.contract.on('UpdateEndTime', (...args: any) => {
      const event = args.slice(-1)[0]
      callback(this.handleDurationExtended(event.args, event))
    })
  }

  handleNewBid(args, event): V1.NewBid {
    const newBid: V1.NewBid = {
      ...args,
      event,
    }
    return newBid
  }

  /**
   * @param callback called for new bids on auctions
   * @note a new bid refunds the previously highest bid
   */
  onNewBid(callback: (bid: V1.NewBid) => void): void {
    this.contract.on('NewBid', (...args: any) => {
      const event = args.slice(-1)[0]
      callback(this.handleNewBid(event.args, event))
    })
  }

  handleNewOffer(args, event): [V1.NewOffer, boolean] {
    const isSaleOffer = BigNumber.from(args.marketplaceId).isZero()
    const newOffer: V1.NewOffer = {
      ...args,
      marketplaceId: !isSaleOffer ? args.marketplaceId : null,
      event,
    }
    return [newOffer, isSaleOffer]
  }

  /**
   * @param callback called for new offers, as bundles
   */
  onNewOffer(callback: (offer: V1.NewOffer, isSaleOffer: boolean) => void): void {
    this.contract.on('NewOffer', (...args: any) => {
      const event = args.slice(-1)[0]
      callback(...this.handleNewOffer(event.args, event))
    })
  }

  handleOfferRemoved(args, event): V1.OfferRemoved {
    const offer: V1.OfferRemoved = {
      ...args,
      event,
    }
    return offer
  }

  /**
   * @param callback called for removed offers
   */
  onOfferRemoved(callback: (offer: V1.OfferRemoved) => void): void {
    this.contract.on('OfferRemoved', (...args: any) => {
      const event = args.slice(-1)[0]
      callback(this.handleOfferRemoved(event.args, event))
    })
  }

  handleOfferAccepted(args, event): V1.OfferAccepted {
    const offer: V1.OfferAccepted = {
      ...args,
      event,
    }
    return offer
  }

  /**
   * @param callback called for accepted offers
   */
  onOfferAccepted(callback: (offer: V1.OfferAccepted) => void): void {
    this.contract.on('OfferAccepted', (...args: any) => {
      const event = args.slice(-1)[0]
      callback(this.handleOfferAccepted(event.args, event))
    })
  }

  handleOfferUpdated(args, event): V1.OfferUpdated {
    const offerUpdated: V1.OfferUpdated = {
      ...args,
      event,
    }
    return offerUpdated
  }

  /**
   * @param callback called for updated offers
   */
  onOfferUpdated(callback: (offer: V1.OfferUpdated) => void): void {
    this.contract.on('UpdateOffer', (...args: any) => {
      const event = args.slice(-1)[0]
      callback(this.handleOfferUpdated(event.args, event))
    })
  }

  handleNewCollectionOffer(args, event): V1.NewCollectionOffer {
    const newCollectionOffer: V1.NewCollectionOffer = {
      ...args,
      event,
    }
    return newCollectionOffer
  }

  /**
   * @param callback called for new collection offers
   */
  onNewCollectionOffer(callback: (offer: V1.NewCollectionOffer) => void): void {
    this.contract.on('NewCollectionOffer', (...args: any) => {
      const event = args.slice(-1)[0]
      callback(this.handleNewCollectionOffer(event.args, event))
    })
  }

  handleNewFilteredCollectionOffer(args, event): V1.NewFilteredCollectionOffer {
    const newFilteredCollectionOffer: V1.NewFilteredCollectionOffer = {
      ...args,
      event,
    }
    return newFilteredCollectionOffer
  }

  /**
   * @param callback called for new filtered collection offers, i.e., on specific tokenIDs
   */
  onNewFilteredCollectionOffer(callback: (offer: V1.NewFilteredCollectionOffer) => void): void {
    this.contract.on('NewFilteredCollectionOffer', (...args: any) => {
      const event = args.slice(-1)[0]
      callback(this.handleNewFilteredCollectionOffer(event.args, event))
    })
  }

  /**
   * @param marketplaceId the sale ID for which to grab details. The one that goes into https://paintswap.finance/marketplace/<ID>
   * @returns a SaleDetails objects with details about this sale
   */
  async getSaleDetails(marketplaceId: ethers.BigNumber): Promise<V1.SaleDetails> {
    return this.contract.getSaleDetails(marketplaceId).then(
      (details: any): V1.SaleDetails => ({
        ...details,
      }),
    )
  }

  /**
   * @returns the next ID to be used when a new listing happens, as a BigNumber
   * @note the latest sale ID is simply the return of this function minus one
   * @note MarketplaceV3 did not start at ID 0
   */
  async getNextMarketplaceId(): Promise<ethers.BigNumber> {
    return this.contract.currentMarketplaceId()
  }
}

export default MarketplaceV1
