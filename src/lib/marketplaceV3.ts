import { BigNumber, ethers } from 'ethers'
import * as V3 from './marketplaceV3Types'
import MarketplaceV3ABIRaw from '../abi/PaintSwapMarketplaceV3.json'

export const MarketplaceV3ABI: ethers.ContractInterface = MarketplaceV3ABIRaw
export const MarketplaceV3Address = '0xC21da4686569Bb9Edf6e00C4c4b214B58b728d6B'

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
        marketplaceId: value.marketplaceId,
        collection: value.collection,
        amountPerBundleUnit: value.amountPerBundleUnit,
        tokenID: value.tokenID,
        amount: bundle.amount.mul(value.amountPerBundleUnit),
        pricePerUnit: bundle.pricePerUnit, // in case of a bundle every NFT will show as the same price, as we simply don't know
        priceTotal: bundle.priceTotal,
      }
    })
  }

  static splitBundleSold(bundle: V3.BundleSold): Array<V3.Sold> {
    return MarketplaceV3Utils.splitBundlePriced(bundle).map((value): V3.Sold => {
      return {
        marketplaceId: value.marketplaceId,
        offerId: bundle.offerId,
        collection: value.collection,
        amountPerBundleUnit: value.amountPerBundleUnit,
        tokenID: value.tokenID,
        amount: value.amount,
        pricePerUnit: value.pricePerUnit,
        priceTotal: value.priceTotal,
        buyer: bundle.buyer,
        seller: bundle.seller,
        event: bundle.event,
      }
    })
  }

  static splitBundleNewSale(bundle: V3.NewBundleListing): Array<V3.NewListing> {
    return MarketplaceV3Utils.splitBundlePriced(bundle).map((value): V3.NewListing => {
      return {
        marketplaceId: value.marketplaceId,
        collection: value.collection,
        amountPerBundleUnit: value.amountPerBundleUnit,
        tokenID: value.tokenID,
        amount: value.amount,
        pricePerUnit: value.pricePerUnit,
        priceTotal: value.priceTotal,
        duration: bundle.duration,
        seller: bundle.seller,
        isAuction: bundle.isAuction,
        isNSFW: bundle.isNSFW,
        event: bundle.event,
      }
    })
  }

  static splitBundleNewOffer(bundle: V3.NewBundleOffer): Array<V3.NewOffer> {
    const asBase = bundle as unknown as V3.BundleBase
    return MarketplaceV3Utils.splitBundleBase(asBase).map(
      (value): V3.NewOffer => ({
        marketplaceId: value.marketplaceId,
        collection: value.collection,
        tokenID: value.tokenID,
        price: bundle.price,
        expires: bundle.expires,
        from: bundle.from,
        offerId: bundle.offerId,
        event: bundle.event,
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

  handleNewListingAsBundle(
    marketplaceId,
    nfts,
    tokenIds,
    amountBatches,
    price,
    duration,
    isAuction,
    amount,
    isNSFW,
    searchKeywords,
    routerAddresses,
    seller,
    event,
  ): V3.NewBundleListing {
    const bundle: V3.NewBundleListing = {
      marketplaceId,
      nfts,
      tokenIds,
      amountBatches,
      pricePerUnit: price,
      priceTotal: price.mul(amount),
      duration,
      isAuction,
      amount,
      isNSFW,
      seller,
      event,
    }
    return bundle
  }

  /**
   * @param callback called for new listings, as bundles
   */
  onNewListingAsBundle(callback: (sale: V3.NewBundleListing) => void): void {
    this.contract.on('NewSale', () => {
      callback(this.handleNewListingAsBundle.apply(this, arguments as any))
    })
  }

  /**
   * @param callback called for new listings, as individual NFTs
   */
  onNewListing(callback: (sale: V3.NewListing) => void): void {
    this.onNewListingAsBundle((bundle) => MarketplaceV3Utils.splitBundleNewSale(bundle).forEach(callback))
  }

  handleSoldAsBundle(
    marketplaceId,
    nfts,
    tokenIds,
    amountBatches,
    price,
    buyer,
    seller,
    amount,
    offerId,
    event,
  ): V3.BundleSold {
    const bundle: V3.BundleSold = {
      marketplaceId,
      nfts,
      tokenIds,
      amountBatches,
      pricePerUnit: price,
      priceTotal: price.mul(amount),
      buyer,
      seller,
      amount,
      offerId,
      event,
    }
    return bundle
  }

  /**
   * @param callback called for successfully sold items, as bundles
   */
  onSoldAsBundle(callback: (bundle: V3.BundleSold) => void): void {
    this.contract.on('Sold', () => {
      callback(this.handleSoldAsBundle.apply(this, arguments as any))
    })
  }

  /**
   * @param callback called for successfuly sold items, as individual NFTs
   */
  onSold(callback: (sale: V3.Sold) => void): void {
    this.onSoldAsBundle((bundle) => MarketplaceV3Utils.splitBundleSold(bundle).forEach(callback))
  }

  handleFinished(marketplaceId, event): V3.SaleFinished {
    const sale: V3.SaleFinished = {
      marketplaceId,
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
    this.contract.on('SaleFinished', () => {
      callback(this.handleFinished.apply(this, arguments as any))
    })
  }

  handleCancelled(marketplaceId, nfts, tokenIds, amountBatches, event): V3.Cancelled {
    // Not handled as individual pieces due to missing amountBatches information
    const sale: V3.Cancelled = {
      marketplaceId,
      event,
    }
    return sale
  }

  /**
   * @param callback called for cancelled sales
   */
  onCancelled(callback: (bundle: V3.Cancelled) => void): void {
    this.contract.on('CancelledSale', () => {
      callback(this.handleCancelled.apply(this, arguments as any))
    })
  }

  handlePriceUpdate(marketplaceId, price, nfts, tokenIds, event): V3.PriceUpdate {
    // Not handled as individual pieces due to missing amountBatches information
    const sale: V3.PriceUpdate = {
      marketplaceId,
      price,
      event,
    }
    return sale
  }

  /**
   * @param callback called for price updates to sales
   */
  onPriceUpdate(callback: (bundle: V3.PriceUpdate) => void): void {
    this.contract.on('UpdatePrice', () => {
      callback(this.handlePriceUpdate.apply(this, arguments as any))
    })
  }

  handleStartDelayed(marketplaceId, startTime, event): V3.StartDelayed {
    const sale: V3.StartDelayed = {
      marketplaceId,
      startTime,
      event,
    }
    return sale
  }

  /**
   * @param callback called when sales are delayed
   */
  onStartDelayed(callback: (sale: V3.StartDelayed) => void): void {
    this.contract.on('UpdateStartTime', () => {
      callback(this.handleStartDelayed.apply(this, arguments as any))
    })
  }

  handleDurationExtended(marketplaceId, endTime, event): V3.DurationExtended {
    const sale: V3.DurationExtended = {
      marketplaceId,
      endTime,
      event,
    }
    return sale
  }

  /**
   * @param callback called when sales are extended
   */
  onDurationExtended(callback: (sale: V3.DurationExtended) => void): void {
    this.contract.on('UpdateEndTime', () => {
      callback(this.handleDurationExtended.apply(this, arguments as any))
    })
  }

  handleNewBid(marketplaceId, bidder, bid, nextMinimum, event): V3.NewBid {
    const newBid: V3.NewBid = {
      marketplaceId,
      bidder,
      bid,
      nextMinimum,
      event,
    }
    return newBid
  }

  /**
   * @param callback called for new bids on auctions
   * @note a new bid refunds the previously highest bid
   */
  onNewBid(callback: (bid: V3.NewBid) => void): void {
    this.contract.on('NewBid', () => {
      callback(this.handleNewBid.apply(this, arguments as any))
    })
  }

  // Returns a pair, second is a boolean which is true if the offer was made on a sale and false if it was outside a sale
  handleNewOfferAsBundle(
    offerId,
    marketplaceId,
    nfts,
    tokenIds,
    from,
    price,
    expires,
    searchKeywords,
    event,
  ): [V3.NewBundleOffer, boolean] {
    const isSaleOffer = BigNumber.from(marketplaceId).isZero()
    const newOffer: V3.NewBundleOffer = {
      marketplaceId: !isSaleOffer ? marketplaceId : null,
      offerId,
      nfts,
      tokenIds,
      from,
      price,
      expires,
      event,
    }
    return [newOffer, isSaleOffer]
  }

  /**
   * @param callback called for new offers, as bundles
   */
  onNewOfferAsBundle(callback: (offer: V3.NewBundleOffer, isSaleOffer: boolean) => void): void {
    this.contract.on('NewOffer', () => {
      const [newOffer, isSaleOffer] = this.handleNewOfferAsBundle.apply(this, arguments as any)
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

  handleOfferRemoved(offerId, event): V3.OfferRemoved {
    const offer: V3.OfferRemoved = {
      offerId,
      event,
    }
    return offer
  }

  /**
   * @param callback called for removed offers
   */
  onOfferRemoved(callback: (offer: V3.OfferRemoved) => void): void {
    this.contract.on('OfferRemoved', () => {
      callback(this.handleOfferRemoved.apply(this, arguments as any))
    })
  }

  handleOfferAccepted(offerId, marketplaceId, event): V3.OfferAccepted {
    const offer: V3.OfferAccepted = {
      offerId,
      marketplaceId,
      event,
    }
    return offer
  }

  /**
   * @param callback called for accepted offers
   */
  onOfferAccepted(callback: (offer: V3.OfferAccepted) => void): void {
    this.contract.on('OfferAccepted', () => {
      callback(this.handleOfferAccepted.apply(this, arguments as any))
    })
  }

  handleOfferRejected(offerId, event): V3.OfferRejected {
    const offer: V3.OfferRejected = {
      offerId,
      event,
    }
    return offer
  }

  /**
   * @param callback called for rejected offers
   */
  onOfferRejected(callback: (offer: V3.OfferRejected) => void): void {
    this.contract.on('OfferRejected', () => {
      callback(this.handleOfferRejected.apply(this, arguments as any))
    })
  }

  handleOfferUpdated(offerId, newPrice, expires, event): V3.OfferUpdated {
    const offerUpdated: V3.OfferUpdated = {
      offerId,
      newPrice,
      expires,
      event,
    }
    return offerUpdated
  }

  /**
   * @param callback called for updated offers
   */
  onOfferUpdated(callback: (offer: V3.OfferUpdated) => void): void {
    this.contract.on('UpdateOffer', () => {
      callback(this.handleOfferUpdated.apply(this, arguments as any))
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
