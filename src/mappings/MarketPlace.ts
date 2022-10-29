import { Planter, Tree, Model, Funder } from '../../generated/schema'
import {
  ModelAdded,
  MarketPlace as MarketPlaceContract,
  ModelDataUpdated,
  PriceUpdated,
  ModelDeactivated,
  ModelDeleted,
  MarketPlaceMint,
  SaleModelFinished,
  TreeFunded,
  MarketPlace__modelsResult
} from '../../generated/MarketPlace/MarketPlace'
import {
  IPlanterFund as PlanterFundContract
} from "../../generated/MarketPlace/IPlanterFund";
import { Address, BigInt, log, store } from '@graphprotocol/graph-ts'
import { addTreeHistory, getGlobalData, addAddressHistory, newFunder, CONTRACT_PLANTER_FUND_ADDRESS } from '../helpers'
import { updateReferrer } from '../helpers/referrer'

function setModelData(model: Model | null, c_model: MarketPlace__modelsResult): void {
  if (model === null) return
  model.country = BigInt.fromI32(c_model.value0)
  model.species = BigInt.fromI32(c_model.value1)
  model.status = BigInt.fromI32(c_model.value2)
  model.planter = c_model.value3.toHexString()

  model.price = c_model.value4 as BigInt
  model.count = c_model.value5 as BigInt
  model.start = c_model.value6 as BigInt
  model.lastFund = c_model.value7 as BigInt
  model.lastPlant = c_model.value8 as BigInt
  model.lastReservePlant = c_model.value9 as BigInt
}

export function handleModelAdded(event: ModelAdded): void {
  let planter = Planter.load(event.params.creator.toHexString())
  if (!planter) {
    log.error('Planter not found: {}', [event.params.creator.toHexString()])
    return
  }

  let model = new Model(event.params.modelId.toHexString())

  model.planter = planter.id
  model.country = BigInt.fromI32(event.params.country)
  model.species = BigInt.fromI32(event.params.species)
  model.status = new BigInt(0)
  model.price = event.params.price as BigInt
  model.count = event.params.count as BigInt
  model.start = event.params.start as BigInt
  model.lastFund = event.params.lastFund as BigInt
  model.lastPlant = event.params.lastPlant as BigInt
  model.lastReservePlant = event.params.lastReservePlant as BigInt

  model.updatedAt = event.block.timestamp as BigInt
  model.createdAt = event.block.timestamp as BigInt

  let marketPlaceContract = MarketPlaceContract.bind(event.address)
  let c_model = marketPlaceContract.models(event.params.modelId)
  setModelData(model, c_model)

  model.save()
}

export function handleModelDataUpdated(event: ModelDataUpdated): void {
  let model = Model.load(event.params.modelId.toHexString())
  if (!model) {
    log.error('Model not found: {}', [event.params.modelId.toHexString()])
    return
  }

  model.species = BigInt.fromI32(event.params.species)
  model.country = BigInt.fromI32(event.params.country)
  model.updatedAt = event.block.timestamp as BigInt
  model.save()
}

export function handlePriceUpdated(event: PriceUpdated): void {
  let model = Model.load(event.params.modelId.toHexString())
  if (!model) {
    log.error('Model not found: {}', [event.params.modelId.toHexString()])
    return
  }

  model.price = event.params.price as BigInt
  model.updatedAt = event.block.timestamp as BigInt
  model.save()
}

export function handleModelDeactivated(event: ModelDeactivated): void {
  let model = Model.load(event.params.modelId.toHexString())
  if (!model) {
    log.error('Model not found: {}', [event.params.modelId.toHexString()])
    return
  }

  model.status = event.params.status as BigInt
  model.updatedAt = event.block.timestamp as BigInt
  model.save()
}

export function handleModelDeleted(event: ModelDeleted): void {
  let model = Model.load(event.params.modelId.toHexString())
  if (!model) {
    log.error('Model not found: {}', [event.params.modelId.toHexString()])
    return
  }

  store.remove('Model', event.params.modelId.toHexString())
}

export function handleTreeFunded(event: TreeFunded): void {
  let marketPlaceContract = MarketPlaceContract.bind(event.address)

  for (let i = 0; i < event.params.models.length; i++) {
    let modelId = event.params.models[i].modelId.toHexString()

    let model = Model.load(modelId)
    if (!model) {
      log.error('Model not found: {}', [modelId])
      return
    }

    let c_model = marketPlaceContract.models(event.params.models[i].modelId)
    setModelData(model, c_model)
    model.updatedAt = event.block.timestamp as BigInt
    model.save()
  }

  let funder = Funder.load(event.params.funder.toHexString())
  if (!funder) {
    funder = newFunder(event.params.funder.toHexString())
    funder.createdAt = event.block.timestamp as BigInt
  }
  //data sets on MarketPlaceMint
  funder.updatedAt = event.block.timestamp as BigInt
  funder.save()

  let gb = getGlobalData()
  gb.totalMarketPlaceTreeSaleAmount = gb.totalMarketPlaceTreeSaleAmount.plus(event.params.amount as BigInt)
  gb.totalMarketPlaceTreeSaleCount = gb.totalMarketPlaceTreeSaleCount.plus(event.params.count as BigInt)
  gb.save()

  addAddressHistory(
    event.params.funder.toHexString(),
    'MarketPlaceTreeFunded',
    '',
    '',
    event.transaction.from.toHexString(),
    event.transaction.hash.toHexString(),
    event.block.number as BigInt,
    event.block.timestamp as BigInt,
    event.params.amount as BigInt,
    event.params.count as BigInt
  )

  updateReferrer(event.params.referrer, event.block.timestamp as BigInt)
}

export function handleMarketPlaceMint(event: MarketPlaceMint): void {
  let model = Model.load(event.params.modelId.toHexString())
  if (!model) {
    log.error('Model not found: {}', [event.params.modelId.toHexString()])
    return
  }

  let marketPlaceContract = MarketPlaceContract.bind(event.address)
  let c_model = marketPlaceContract.models(event.params.modelId)
  setModelData(model, c_model)

  model.updatedAt = event.block.timestamp as BigInt
  model.save()

  let funder = Funder.load(event.transaction.from.toHexString())
  if (!funder) {
    funder = newFunder(event.transaction.from.toHexString())
    funder.createdAt = event.block.timestamp as BigInt
    let gb = getGlobalData()
    gb.funderCount = gb.funderCount.plus(BigInt.fromI32(1))
    gb.save()
  }
  funder.marketPlaceSpent = funder.marketPlaceSpent.plus(event.params.price as BigInt)
  funder.marketPlaceCount = funder.marketPlaceCount.plus(event.params.count as BigInt)
  funder.treeCount = funder.treeCount.plus(event.params.count as BigInt)
  funder.spentDai = funder.spentDai.plus(event.params.price as BigInt)
  funder.updatedAt = event.block.timestamp as BigInt
  funder.save()


  let planterFundContract = PlanterFundContract.bind(Address.fromString(CONTRACT_PLANTER_FUND_ADDRESS));


  for (let i = BigInt.fromI32(0); i.lt(event.params.count); i = i.plus(BigInt.fromI32(1))) {
    let treeIdBigInt = event.params.start.plus(i);
    let treeId = treeIdBigInt.toHexString()

    let tree = Tree.load(treeId)
    if (!tree) {
      tree = new Tree(treeId)
      tree.createdAt = event.block.timestamp as BigInt
    }

    tree.funder = funder.id
    tree.updatedAt = event.block.timestamp as BigInt
    tree.soldType = BigInt.fromI32(6)
    tree.saleType = BigInt.fromI32(0)
    tree.model = model.id
    tree.save()

    if(!tree.planter) {

      let planter = Planter.load(model.planter)
      
      if(planter) {
        tree.planter = model.planter;
        tree.save()


        // planter.balance = planterFundContract.balances(Address.fromString(planter.id));
        planter.balanceProjected = planter.balanceProjected.plus( planterFundContract.treeToPlanterProjectedEarning(treeIdBigInt) );
        planter.updatedAt = event.block.timestamp as BigInt;
        planter.save();
      }
      


    }

    addTreeHistory(
      treeId,
      'MarketPlaceMint',
      event.transaction.from.toHexString(),
      event.transaction.hash.toHexString(),
      event.block.number as BigInt,
      event.block.timestamp as BigInt,
      event.params.price.div(event.params.count) as BigInt
    )
  }
}

export function handleSaleModelFinished(event: SaleModelFinished): void {
  let model = Model.load(event.params.modelId.toHexString())
  if (!model) {
    log.error('Model not found: {}', [event.params.modelId.toHexString()])
    return
  }

  model.status = new BigInt(2)
  model.updatedAt = event.block.timestamp as BigInt
  model.save()
}
