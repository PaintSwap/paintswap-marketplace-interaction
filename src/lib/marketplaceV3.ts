import { BigNumber, ethers } from 'ethers'
import * as V3 from './marketplaceV3Types'
import MarketplaceV3ABIRaw from '../abi/PaintSwapMarketplaceV3.json'

export const MarketplaceV3ABI: ethers.ContractInterface = MarketplaceV3ABIRaw
export const MarketplaceV3Address = '0xDc6bC191FafD97c5d502cfb69E66d25C41935f87'

export class MarketplaceV3Utils {
  /** @internal */
  static splitBundleBase(bundle: V3.BundleBase): Array<V3.Base> {
    const result = []
    const pieces = bundle.nfts.length
    // Bundles aren't used at the moment, so this loop will be for a single sale
    for (let i = 0; i < pieces; ++i) {
      const base: V3.Base = {
        marketplaceId: bundle.marketplaceId,
        collection: bundle.nfts[i],
        tokenID: bundle.tokenIds[i],
        amountPerBundleUnit: bundle.amountBatches ? bundle.amountBatches[i] : null,
      }
      result.push(base)
    }
    return result
  }

  /** @internal */
  static splitBundlePriced(bundle: V3.BundlePriced): Array<V3.Priced> {
    const base = MarketplaceV3Utils.splitBundleBase(bundle)
    return base.map((value): V3.Priced => {
      return {
        ...value,
        ...bundle,
        amount: bundle.amount.mul(value.amountPerBundleUnit),
      }
    })
  }

  static splitBundleSold(bundle: V3.BundleSold): Array<V3.Sold> {
    return MarketplaceV3Utils.splitBundlePriced(bundle).map((value): V3.Sold => {
      return {
        ...value,
        ...bundle,
      }
    })
  }

  static splitBundleNewSale(bundle: V3.NewBundleListing): Array<V3.NewListing> {
    return MarketplaceV3Utils.splitBundlePriced(bundle).map((value): V3.NewListing => {
      return {
        ...value,
        ...bundle,
      }
    })
  }

  static splitBundleNewOffer(bundle: V3.NewBundleOffer): Array<V3.NewOffer> {
    const asBase = bundle as unknown as V3.BundleBase
    return MarketplaceV3Utils.splitBundleBase(asBase).map(
      (value): V3.NewOffer => ({
        ...value,
        ...bundle,
      }),
    )
  }
}

export class MarketplaceV3 {
  contract: ethers.Contract

  /**
   * @param providerOrSigner an ethers compatible provider or signer https://docs.ethers.io/v5/api/providers/
   * @param address if given, overrides the default marketplace contract address
   */
  constructor(providerOrSigner: ethers.providers.Provider | ethers.Signer, address: string = MarketplaceV3Address) {
    this.contract = new ethers.Contract(address, MarketplaceV3ABI, providerOrSigner)
  }

  handleNewListingAsBundle(args, event): V3.NewBundleListing {
    const bundle: V3.NewBundleListing = {
      ...args,
      pricePerUnit: args.price,
      priceTotal: args.price.mul(args.amount),
      event,
    }
    return bundle
  }

  /**
   * @param callback called for new listings, as bundles
   */
  onNewListingAsBundle(callback: (sale: V3.NewBundleListing) => void): void {
    this.contract.on('NewSale', (...args: any) => {
      const event = args.slice(-1)[0]
      callback(this.handleNewListingAsBundle(event.args, event))
    })
  }

  /**
   * @param callback called for new listings, as individual NFTs
   */
  onNewListing(callback: (sale: V3.NewListing) => void): void {
    this.onNewListingAsBundle((bundle) => MarketplaceV3Utils.splitBundleNewSale(bundle).forEach(callback))
  }

  handleSoldAsBundle(args, event): V3.BundleSold {
    const bundle: V3.BundleSold = {
      ...args,
      pricePerUnit: args.price,
      priceTotal: args.price.mul(args.amount),
      event,
    }
    return bundle
  }

  /**
   * @param callback called for successfully sold items, as bundles
   */
  onSoldAsBundle(callback: (bundle: V3.BundleSold) => void): void {
    this.contract.on('Sold', (...args: any) => {
      const event = args.slice(-1)[0]
      callback(this.handleSoldAsBundle(event.args, event))
    })
  }

  /**
   * @param callback called for successfuly sold items, as individual NFTs
   */
  onSold(callback: (sale: V3.Sold) => void): void {
    this.onSoldAsBundle((bundle) => MarketplaceV3Utils.splitBundleSold(bundle).forEach(callback))
  }

  handleFinished(args, event): V3.SaleFinished {
    const sale: V3.SaleFinished = {
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
  onFinished(callback: (sale: V3.SaleFinished) => void): void {
    this.contract.on('SaleFinished', (...args: any) => {
      const event = args.slice(-1)[0]
      callback(this.handleFinished(event.args, event))
    })
  }

  handleCancelled(args, event): V3.Cancelled {
    // Not handled as individual pieces due to missing amountBatches information
    const sale: V3.Cancelled = {
      ...args,
      event,
    }
    return sale
  }

  /**
   * @param callback called for cancelled sales
   */
  onCancelled(callback: (bundle: V3.Cancelled) => void): void {
    this.contract.on('CancelledSale', (...args: any) => {
      const event = args.slice(-1)[0]
      callback(this.handleCancelled(event.args, event))
    })
  }

  handlePriceUpdate(args, event): V3.PriceUpdate {
    // Not handled as individual pieces due to missing amountBatches information
    const sale: V3.PriceUpdate = {
      ...args,
      event,
    }
    return sale
  }

  /**
   * @param callback called for price updates to sales
   */
  onPriceUpdate(callback: (bundle: V3.PriceUpdate) => void): void {
    this.contract.on('UpdatePrice', (...args: any) => {
      const event = args.slice(-1)[0]
      callback(this.handlePriceUpdate(event.args, event))
    })
  }

  handleStartDelayed(args, event): V3.StartDelayed {
    const sale: V3.StartDelayed = {
      ...args,
      event,
    }
    return sale
  }

  /**
   * @param callback called when sales are delayed
   */
  onStartDelayed(callback: (sale: V3.StartDelayed) => void): void {
    this.contract.on('UpdateStartTime', (...args: any) => {
      const event = args.slice(-1)[0]
      callback(this.handleStartDelayed(event.args, event))
    })
  }

  handleDurationExtended(args, event): V3.DurationExtended {
    const sale: V3.DurationExtended = {
      ...args,
      event,
    }
    return sale
  }

  /**
   * @param callback called when sales are extended
   */
  onDurationExtended(callback: (sale: V3.DurationExtended) => void): void {
    this.contract.on('UpdateEndTime', (...args: any) => {
      const event = args.slice(-1)[0]
      callback(this.handleDurationExtended(event.args, event))
    })
  }

  handleNewBid(args, event): V3.NewBid {
    const newBid: V3.NewBid = {
      ...args,
      event,
    }
    return newBid
  }

  /**
   * @param callback called for new bids on auctions
   * @note a new bid refunds the previously highest bid
   */
  onNewBid(callback: (bid: V3.NewBid) => void): void {
    this.contract.on('NewBid', (...args: any) => {
      const event = args.slice(-1)[0]
      callback(this.handleNewBid(event.args, event))
    })
  }

  // Returns a pair, second is a boolean which is true if the offer was made on a sale and false if it was outside a sale
  handleNewOfferAsBundle(args, event): [V3.NewBundleOffer, boolean] {
    const isSaleOffer = BigNumber.from(args.marketplaceId).isZero()
    const newOffer: V3.NewBundleOffer = {
      ...args,
      marketplaceId: !isSaleOffer ? args.marketplaceId : null,
      event,
    }
    return [newOffer, isSaleOffer]
  }

  /**
   * @param callback called for new offers, as bundles
   */
  onNewOfferAsBundle(callback: (offer: V3.NewBundleOffer, isSaleOffer: boolean) => void): void {
    this.contract.on('NewOffer', (...args: any) => {
      const event = args.slice(-1)[0]
      const [newOffer, isSaleOffer] = this.handleNewOfferAsBundle(event.args, event)
      callback(newOffer, isSaleOffer)
    })
  }

  /**
   * @param callback called for new offers, as bundles
   */
  onNewOffer(callback: (offer: V3.NewOffer, isSaleOffer: boolean) => void): void {
    this.onNewOfferAsBundle((bundle, isSaleOffer) =>
      MarketplaceV3Utils.splitBundleNewOffer(bundle).forEach((offer) => callback(offer, isSaleOffer)),
    )
  }

  handleOfferAccepted(args, event): V3.OfferAccepted {
    const offer: V3.OfferAccepted = {
      ...args,
      event,
    }
    return offer
  }

  /**
   * @param callback called for accepted offers
   */
  onOfferAccepted(callback: (offer: V3.OfferAccepted) => void): void {
    this.contract.on('OfferAccepted', (...args: any) => {
      const event = args.slice(-1)[0]
      callback(this.handleOfferAccepted(event.args, event))
    })
  }

  handleOfferUpdated(args, event): V3.OfferUpdated {
    const offerUpdated: V3.OfferUpdated = {
      ...args,
      event,
    }
    return offerUpdated
  }

  /**
   * @param callback called for updated offers
   */
  onOfferUpdated(callback: (offer: V3.OfferUpdated) => void): void {
    this.contract.on('UpdateOffer', (...args: any) => {
      const event = args.slice(-1)[0]
      callback(this.handleOfferUpdated(event.args, event))
    })
  }

  /**
   * @param marketplaceId the sale ID for which to grab details. The one that goes into https://paintswap.finance/marketplace/<ID>
   * @returns a SaleDetails objects with details about this sale
   */
  async getSaleDetails(marketplaceId: ethers.BigNumber): Promise<V3.SaleDetails> {
    return this.contract.getSaleDetails(marketplaceId).then(
      (details: any): V3.SaleDetails => ({
        ...details,
      }),
    )
  }

  /**
   * @param marketplaceId the sale ID. The one that goes into https://paintswap.finance/marketplace/<ID>
   * @returns the next minimum bid that this sale will accept, as a BigNumber
   */
  async getNextMinimumBid(marketplaceId: ethers.BigNumber): Promise<ethers.BigNumber> {
    return this.contract.nextMinimumBid(marketplaceId)
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

export default MarketplaceV3
