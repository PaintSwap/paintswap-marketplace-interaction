import { BigNumber, ethers } from 'ethers'
import MarketplaceABIRaw from '../abi/PaintSwapMarketplace.json'
import {
  Cancelled,
  DurationExtended,
  NewBid,
  NewCollectionOffer,
  NewFilteredCollectionOffer,
  NewListing,
  NewListingBatch,
  NewOffer,
  OfferAccepted,
  OfferRemoved,
  OfferUpdated,
  PriceUpdate,
  SaleDetails,
  SaleFinished,
  Sold,
} from './marketplaceTypes'

export const MarketplaceABI: ethers.ContractInterface = MarketplaceABIRaw
export const MarketplaceAddress = '0x0c558365eeff4b057fdbed91bc3650e1a00018b4' // Sonic Mainnet

export class Marketplace {
  contract: ethers.Contract

  /**
   * @param providerOrSigner an ethers compatible provider or signer https://docs.ethers.io/v5/api/providers/
   * @param address if given, overrides the default marketplace contract address
   */
  constructor(providerOrSigner: ethers.providers.Provider | ethers.Signer, address: string = MarketplaceAddress) {
    this.contract = new ethers.Contract(address, MarketplaceABI, providerOrSigner)
  }

  handleNewListing(args, event): NewListing {
    return {
      ...args,
      event,
    }
  }

  /**
   * @param callback called for new listings, as individual NFTs
   */
  onNewListing(callback: (sale: NewListing) => void): void {
    this.contract.on('NewListing', (...args: any) => {
      const event = args.slice(-1)[0]
      callback(this.handleNewListing(event.args, event))
    })
  }

  handleNewListingBatch(args, event): NewListingBatch {
    return {
      ...args,
      event,
    }
  }

  /**
   * @param callback called for new listings as a batch, as individual NFTs
   */
  onNewListingBatch(callback: (sales: NewListingBatch) => void): void {
    this.contract.on('NewListingBatch', (...args: any) => {
      const event = args.slice(-1)[0]
      callback(this.handleNewListingBatch(event.args, event))
    })
  }

  handleSold(args, event): Sold {
    return {
      ...args,
      event,
    }
  }

  /**
   * @param callback called for successfuly sold items, as individual NFTs
   */
  onSold(callback: (sale: Sold) => void): void {
    this.contract.on('Sold', (...args: any) => {
      const event = args.slice(-1)[0]
      callback(this.handleSold(event.args, event))
    })
  }

  handleFinished(args, event): SaleFinished {
    const sale: SaleFinished = {
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
  onFinished(callback: (sale: SaleFinished) => void): void {
    this.contract.on('SaleFinished', (...args: any) => {
      const event = args.slice(-1)[0]
      callback(this.handleFinished(event.args, event))
    })
  }

  handleCancelled(args, event): Cancelled {
    // Not handled as individual pieces due to missing amountBatches information
    const sale: Cancelled = {
      ...args,
      event,
    }
    return sale
  }

  /**
   * @param callback called for cancelled sales
   */
  onCancelled(callback: (bundle: Cancelled) => void): void {
    this.contract.on('CancelledListing', (...args: any) => {
      const event = args.slice(-1)[0]
      callback(this.handleCancelled(event.args, event))
    })
  }

  handlePriceUpdate(args, event): PriceUpdate {
    // Not handled as individual pieces due to missing amountBatches information
    const sale: PriceUpdate = {
      ...args,
      event,
    }
    return sale
  }

  /**
   * @param callback called for price updates to sales
   */
  onPriceUpdate(callback: (bundle: PriceUpdate) => void): void {
    this.contract.on('UpdatePrice', (...args: any) => {
      const event = args.slice(-1)[0]
      callback(this.handlePriceUpdate(event.args, event))
    })
  }

  handleDurationExtended(args, event): DurationExtended {
    const sale: DurationExtended = {
      ...args,
      event,
    }
    return sale
  }

  /**
   * @param callback called when sales are extended
   */
  onDurationExtended(callback: (sale: DurationExtended) => void): void {
    this.contract.on('UpdateEndTime', (...args: any) => {
      const event = args.slice(-1)[0]
      callback(this.handleDurationExtended(event.args, event))
    })
  }

  handleNewBid(args, event): NewBid {
    const newBid: NewBid = {
      ...args,
      event,
    }
    return newBid
  }

  /**
   * @param callback called for new bids on auctions
   * @note a new bid refunds the previously highest bid
   */
  onNewBid(callback: (bid: NewBid) => void): void {
    this.contract.on('NewBid', (...args: any) => {
      const event = args.slice(-1)[0]
      callback(this.handleNewBid(event.args, event))
    })
  }

  handleNewOffer(args, event): [NewOffer, boolean] {
    const isSaleOffer = BigNumber.from(args.marketplaceId).isZero()
    const newOffer: NewOffer = {
      ...args,
      marketplaceId: !isSaleOffer ? args.marketplaceId : null,
      event,
    }
    return [newOffer, isSaleOffer]
  }

  /**
   * @param callback called for new offers, as bundles
   */
  onNewOffer(callback: (offer: NewOffer, isSaleOffer: boolean) => void): void {
    this.contract.on('NewOffer', (...args: any) => {
      const event = args.slice(-1)[0]
      callback(...this.handleNewOffer(event.args, event))
    })
  }

  handleOfferRemoved(args, event): OfferRemoved {
    const offer: OfferRemoved = {
      ...args,
      event,
    }
    return offer
  }

  /**
   * @param callback called for removed offers
   */
  onOfferRemoved(callback: (offer: OfferRemoved) => void): void {
    this.contract.on('OfferRemoved', (...args: any) => {
      const event = args.slice(-1)[0]
      callback(this.handleOfferRemoved(event.args, event))
    })
  }

  handleOfferAccepted(args, event): OfferAccepted {
    const offer: OfferAccepted = {
      ...args,
      event,
    }
    return offer
  }

  /**
   * @param callback called for accepted offers
   */
  onOfferAccepted(callback: (offer: OfferAccepted) => void): void {
    this.contract.on('OfferAccepted', (...args: any) => {
      const event = args.slice(-1)[0]
      callback(this.handleOfferAccepted(event.args, event))
    })
  }

  handleOfferUpdated(args, event): OfferUpdated {
    const offerUpdated: OfferUpdated = {
      ...args,
      event,
    }
    return offerUpdated
  }

  /**
   * @param callback called for updated offers
   */
  onOfferUpdated(callback: (offer: OfferUpdated) => void): void {
    this.contract.on('UpdateOffer', (...args: any) => {
      const event = args.slice(-1)[0]
      callback(this.handleOfferUpdated(event.args, event))
    })
  }

  handleNewCollectionOffer(args, event): NewCollectionOffer {
    const newCollectionOffer: NewCollectionOffer = {
      ...args,
      event,
    }
    return newCollectionOffer
  }

  /**
   * @param callback called for new collection offers
   */
  onNewCollectionOffer(callback: (offer: NewCollectionOffer) => void): void {
    this.contract.on('NewCollectionOffer', (...args: any) => {
      const event = args.slice(-1)[0]
      callback(this.handleNewCollectionOffer(event.args, event))
    })
  }

  handleNewFilteredCollectionOffer(args, event): NewFilteredCollectionOffer {
    const newFilteredCollectionOffer: NewFilteredCollectionOffer = {
      ...args,
      event,
    }
    return newFilteredCollectionOffer
  }

  /**
   * @param callback called for new filtered collection offers, i.e., on specific tokenIDs
   */
  onNewFilteredCollectionOffer(callback: (offer: NewFilteredCollectionOffer) => void): void {
    this.contract.on('NewFilteredCollectionOffer', (...args: any) => {
      const event = args.slice(-1)[0]
      callback(this.handleNewFilteredCollectionOffer(event.args, event))
    })
  }

  /**
   * @param marketplaceId the sale ID for which to grab details. The one that goes into https://paintswap.finance/marketplace/<ID>
   * @returns a SaleDetails objects with details about this sale
   */
  async getSaleDetails(marketplaceId: ethers.BigNumber): Promise<SaleDetails> {
    return this.contract.getSaleDetails(marketplaceId).then(
      (details: any): SaleDetails => ({
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

export default Marketplace
