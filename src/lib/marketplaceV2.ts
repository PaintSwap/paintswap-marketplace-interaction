import { ethers } from 'ethers'
import * as V2 from './marketplaceV2Types'
import MarketplaceV2ABIRaw from '../abi/PaintSwapMarketplaceV2.json'

export const MarketplaceV2ABI: ethers.ContractInterface = MarketplaceV2ABIRaw
export const MarketplaceV2Address = '0x6125fD14b6790d5F66509B7aa53274c93dAE70B9'

class MarketplaceV2Utils {
  /** @internal */
  static splitBundleBase(bundle: V2.BundleBase): Array<V2.Base> {
    const result = []
    const pieces = bundle.nfts.length
    // Bundles aren't used at the moment, so this loop will be for a single sale
    for (let i = 0; i < pieces; ++i) {
      const base: V2.Base = {
        marketplaceId: bundle.marketplaceId,
        collection: bundle.nfts[i],
        tokenID: bundle.tokenIds[i],
        amountPerBundleUnit: bundle.amountBatches[i],
      }
      result.push(base)
    }
    return result
  }

  /** @internal */
  static splitBundlePriced(bundle: V2.BundlePriced): Array<V2.Priced> {
    const base = MarketplaceV2Utils.splitBundleBase(bundle)
    return base.map((value): V2.Priced => {
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

  static splitBundleSold(bundle: V2.BundleSold): Array<V2.Sold> {
    return MarketplaceV2Utils.splitBundlePriced(bundle).map((value): V2.Sold => {
      return {
        marketplaceId: value.marketplaceId,
        collection: value.collection,
        amountPerBundleUnit: value.amountPerBundleUnit,
        tokenID: value.tokenID,
        amount: value.amount,
        pricePerUnit: value.pricePerUnit,
        priceTotal: value.priceTotal,
        buyer: bundle.buyer,
        seller: bundle.seller,
      }
    })
  }

  static splitBundleNewSale(bundle: V2.NewBundleListing): Array<V2.NewListing> {
    return MarketplaceV2Utils.splitBundlePriced(bundle).map((value): V2.NewListing => {
      return {
        marketplaceId: value.marketplaceId,
        collection: value.collection,
        amountPerBundleUnit: value.amountPerBundleUnit,
        tokenID: value.tokenID,
        amount: value.amount,
        pricePerUnit: value.pricePerUnit,
        priceTotal: value.priceTotal,
        duration: bundle.duration,
        isAuction: bundle.isAuction,
        isNSFW: bundle.isNSFW,
      }
    })
  }

  static splitBundleUnsold(bundle: V2.BundleUnsold): Array<V2.Unsold> {
    return this.splitBundleBase(bundle)
  }
}

export class MarketplaceV2 {
  contract: ethers.Contract

  /**
   * @param providerOrSigner an ethers compatible provider or signer https://docs.ethers.io/v5/api/providers/
   * @param address if given, overrides the default marketplace contract address
   */
  constructor(providerOrSigner: ethers.providers.Provider | ethers.Signer, address: string = MarketplaceV2Address) {
    this.contract = new ethers.Contract(address, MarketplaceV2ABI, providerOrSigner)
  }

  /**
   * @param callback called for new listings, as bundles
   */
  onNewListingAsBundle(callback: (sale: V2.NewBundleListing) => void): void {
    this.contract.on(
      'NewSale',
      (
        marketplaceId,
        nfts,
        tokenIds,
        amountBatches,
        price,
        duration,
        isAuction,
        amount,
        isNSFW,
        marketplaceURI,
        searchKeywords,
        routerAddresses,
        event,
      ) => {
        const bundle: V2.NewBundleListing = {
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
        }
        callback(bundle)
      },
    )
  }

  /**
   * @param callback called for new listings, as individual NFTs
   */
  onNewListing(callback: (sale: V2.NewListing) => void): void {
    this.onNewListingAsBundle((bundle) => MarketplaceV2Utils.splitBundleNewSale(bundle).forEach(callback))
  }

  /**
   * @param callback called for successfully sold items, as bundles
   */
  onSoldAsBundle(callback: (bundle: V2.BundleSold) => void): void {
    this.contract.on('Sold', (marketplaceId, nfts, tokenIds, amountBatches, price, buyer, seller, amount, event) => {
      const bundle: V2.BundleSold = {
        marketplaceId,
        nfts,
        tokenIds,
        amountBatches,
        pricePerUnit: price,
        priceTotal: price.mul(amount),
        buyer,
        seller,
        amount,
      }
      callback(bundle)
    })
  }

  /**
   * @param callback called for successfuly sold items, as individual NFTs
   */
  onSold(callback: (sale: V2.Sold) => void): void {
    this.onSoldAsBundle((bundle) => MarketplaceV2Utils.splitBundleSold(bundle).forEach(callback))
  }

  /**
   * @internal
   * @param callback called for finished unsuccessful sales, as bundles
   * @note does not provide cancelled sales
   */
  onUnsoldAsBundleImpl(callback: (bundle: V2.BundleUnsold) => void): void {
    this.contract.on('SaleFinished', (marketplaceId, nfts, tokenIds, amountBatches, failedSellAll, event) => {
      if (failedSellAll) {
        const bundle: V2.BundleUnsold = {
          marketplaceId,
          nfts,
          tokenIds,
          amountBatches,
        }
        callback(bundle)
      }
    })
  }

  /**
   * @param callback called for cancelled sales, as bundles
   */
  onCancelledAsBundleImpl(callback: (bundle: V2.BundleUnsold) => void): void {
    this.contract.on('CancelledSale', (marketplaceId, nfts, tokenIds, amountBatches, event) => {
      const bundle: V2.BundleUnsold = {
        marketplaceId,
        nfts,
        tokenIds,
        amountBatches,
      }
      callback(bundle)
    })
  }

  /**
   * @param callback called for unsuccessful sales as bundles, noting if it was due to a cancellation or simply ending without selling
   */
  onUnsoldAsBundle(callback: (sale: V2.BundleUnsold, cancelled: boolean) => void): void {
    this.onUnsoldAsBundleImpl((sale) => callback(sale, false)) // not cancelled
    this.onCancelledAsBundleImpl((sale) => callback(sale, true)) // cancelled
  }

  /**
   * @param callback called for unsuccessful sales as individual NFTs, noting if it was due to a cancellation or simply ending without selling
   */
  onUnsold(callback: (sale: V2.Unsold, cancelled: boolean) => void): void {
    this.onUnsoldAsBundle((bundle, was_cancelled) =>
      MarketplaceV2Utils.splitBundleUnsold(bundle).forEach((sale) => callback(sale, was_cancelled)),
    )
  }

  /**
   * @param callback called for price updates to sales
   */
  onPriceUpdate(callback: (bundle: V2.BundlePriceUpdate) => void): void {
    // Not handled as individual pieces due to missing amountBatches information
    this.contract.on('UpdatePrice', (marketplaceId, price, nfts, tokenIds, event) => {
      const bundle: V2.BundlePriceUpdate = {
        marketplaceId,
        price,
      }
      callback(bundle)
    })
  }

  /**
   * @param callback called when auctions are extended
   */
  onDurationExtended(callback: (sale: V2.DurationExtended) => void): void {
    this.contract.on('UpdateEndTime', (marketplaceId, endTime, event) => {
      const extension: V2.DurationExtended = {
        marketplaceId,
        endTime,
      }
      callback(extension)
    })
  }

  /**
   * @param callback called for new bids on auctions
   * @note a new bid refunds the previously highest bid
   */
  onNewBid(callback: (bid: V2.NewBid) => void): void {
    this.contract.on('NewBid', (marketplaceId, bidder, bid, nextMinimum) => {
      const newBid: V2.NewBid = {
        marketplaceId,
        bidder,
        bid,
        nextMinimum,
      }
      callback(newBid)
    })
  }

  /**
   * @param callback called for new offers on auctions
   * @note a new offer refunds the previously highest offer
   */
  onNewOffer(callback: (offer: V2.NewOffer) => void): void {
    this.contract.on('NewOffer', (marketplaceId, offerrer, offer, nextMinimum) => {
      const newOffer: V2.NewOffer = {
        marketplaceId,
        offerrer,
        offer,
        nextMinimum,
      }
      callback(newOffer)
    })
  }

  /**
   * @param marketplaceId the sale ID for which to grab details. The one that goes into https://paintswap.finance/marketplace/<ID>
   * @returns a SaleDetails objects with details about this sale
   */
  async getSaleDetails(marketplaceId: ethers.BigNumber): Promise<V2.SaleDetails> {
    return this.contract.getSaleDetails(marketplaceId).then(
      (details: any): V2.SaleDetails => ({
        amount: details.amount,
        amountBatches: details.amountBatches,
        amountRemaining: details.amountRemaining,
        complete: details.complete,
        devFeePercentage: details.devFeePercentage,
        startTime: details.startTime,
        endTime: details.endTime,
        isAuction: details.isAuction,
        maxBidOrOffer: details.maxBidOrOffer,
        maxBidderOrOfferer: details.maxBidderOrOfferer,
        nfts: details.nfts,
        tokenIds: details.tokenIds,
        price: details.price,
        seller: details.seller,
      }),
    )
  }

  /**
   * @param marketplaceId the sale ID for which to grab details. The one that goes into https://paintswap.finance/marketplace/<ID>
   * @returns the next minimum bid (or offer) that this sale will accept, as a BigNumber
   */
  async getNextMinimumBidOrOffer(marketplaceId: ethers.BigNumber): Promise<ethers.BigNumber> {
    return this.contract.nextMinimumBidOrOffer(marketplaceId)
  }

  /**
   * @returns the next ID to be used when a new listing happens, as a BigNumber
   * @note the latest sale ID is simply the return of this function minus one
   * @note MarketplaceV2 did not start at ID 0
   */
  async getNextMarketplaceId(): Promise<ethers.BigNumber> {
    return this.contract.currentMarketplaceId()
  }
}

export default MarketplaceV2
