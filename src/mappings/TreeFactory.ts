import { Address, BigInt, Bytes, JSONValue, Value, ipfs, json, log, store } from '@graphprotocol/graph-ts'
import {
  AssignedTreePlanted,
  AssignedTreeRejected,
  AssignedTreeVerified,
  AssignedTreeVerifiedWithSign,
  ITreeFactory__tempTreesResult,
  ITreeFactory__treeUpdatesResult,
  ITreeFactory__treesResult,
  TreeAssigned,
  ITreeFactory as TreeFactoryContract,
  TreeListed,
  TreePlanted,
  TreeRejected,
  TreeSpecsUpdated,
  TreeUpdateRejected,
  TreeUpdated,
  TreeUpdatedVerified,
  TreeUpdatedVerifiedWithSign,
  TreeVerified,
  TreeVerifiedWithSign,
} from '../../generated/TreeFactory/ITreeFactory'
import {
  PlanterJoined,
  IPlanter as PlanterContract,
  IPlanter__plantersResult,
  OrganizationJoined,
  PlanterUpdated,
  AcceptedByOrganization,
  RejectedByOrganization,
  OrganizationMemberShareUpdated
} from '../../generated/Planter/IPlanter';
import { Planter, TempTree, Tree, TreeSpec, TreeUpdate, UpdateSpec } from '../../generated/schema'
import { COUNTER_ID, addAddressHistory, addTreeHistory, getCount_treeSpecs, getCount_treeUpdates } from '../helpers'

function setTempTreeData(tempTree: TempTree | null, c_tempTree: ITreeFactory__tempTreesResult): void {
  if (tempTree === null) return
  tempTree.birthDate = c_tempTree.value0 as BigInt
  tempTree.plantDate = c_tempTree.value1 as BigInt
  tempTree.countryCode = c_tempTree.value2.toString()
  tempTree.planter = c_tempTree.value4.toHexString()
  tempTree.treeSpecs = c_tempTree.value5
}
function setTreeData(tree: Tree | null, c_tree: ITreeFactory__treesResult): void {
  if (tree === null) return
  tree.planter = c_tree.value0.toHexString()
  tree.species = c_tree.value1 as BigInt
  tree.countryCode = c_tree.value2.toString()
  tree.saleType = c_tree.value3 as BigInt
  tree.soldType = new BigInt(0)
  tree.requestId = ''
  tree.treeStatus = c_tree.value4 as BigInt
  tree.plantDate = c_tree.value5 as BigInt
  tree.birthDate = c_tree.value6 as BigInt
  tree.treeSpecs = c_tree.value7.toString()
}
function setTreeUpdateData(treeUpdate: TreeUpdate | null, c_treeUpdate: ITreeFactory__treeUpdatesResult): void {
  if (treeUpdate === null) return
  treeUpdate.updateSpecs = c_treeUpdate.value0.toString()
  treeUpdate.updateStatus = c_treeUpdate.value1 as BigInt
}

function setTreeUpdateDataOffchain(treeUpdate: TreeUpdate, c_tree: ITreeFactory__treesResult): void {
  treeUpdate.updateSpecs = c_tree.value7.toString()
  treeUpdate.updateStatus = BigInt.fromI32(3)
}

function copyTree(t1: Tree | null, t2: Tree | null): void {
  if (t1 === null || t2 === null) return
  t1.birthDate = t2.birthDate
  t1.countryCode = t2.countryCode
  t1.funder = t2.funder
  t1.species = t2.species
  t1.treeStatus = t2.treeStatus
  t1.treeSpecs = t2.treeSpecs
  t1.attribute = t2.attribute
  t1.symbol = t2.symbol
  t1.saleType = t2.saleType
  t1.planter = t2.planter
  t1.plantDate = t2.plantDate
}
function upsertTree(tree: Tree | null): void {
  if (tree === null) return
  let t = Tree.load(tree.id)
  if (t !== null) {
    copyTree(t, tree)
    t.save()
  } else {
    tree.save()
  }
}

export function saveTreeSpec(value: JSONValue, userData: Value, type: string): void {
  if (value.isNull()) {
    return
  }
  let obj = value.toObject()

  let name = obj.get('name')
  let description = obj.get('description')
  let external_url = obj.get('external_url')
  let image = obj.get('image')
  let image_ipfs_hash = obj.get('image_ipfs_hash')
  let symbol = obj.get('symbol')
  let symbol_ipfs_hash = obj.get('symbol_ipfs_hash')
  let animation_url = obj.get('animation_url')
  let diameter = obj.get('diameter')
  let location = obj.get('location')
  let attributes = obj.get('attributes')
  let updates = obj.get('updates')
  let locations = obj.get('locations')
  let nursery = obj.get('nursery')

  let attrStr = ''
  if (attributes != null) {
    let attributesArray = attributes.toArray()

    attrStr = '['
    for (let i = 0; i < attributesArray.length; i++) {
      let el = attributesArray[i]
      attrStr += '{'

      let trait_type_obj = el.toObject().get('trait_type')
      if (trait_type_obj != null) {
        let trait_type = trait_type_obj.toString()

        let value_obj = el.toObject().get('value')
        if (value_obj != null) {
          if (trait_type == 'birthday') {
            attrStr += '"trait_type":"' + trait_type + '","value":"' + value_obj.toString() + '","display_type":"date"'
          } else {
            attrStr += '"trait_type":"' + trait_type + '","value":"' + value_obj.toString() + '"'
          }
        }
      }

      if (i == attributesArray.length - 1) {
        attrStr += '}'
      } else {
        attrStr += '},'
      }
    }
    attrStr += ']'
  }

  let updateStr = ''
  if (updates != null) {
    let updatesArray = updates.toArray()

    updateStr = '['
    for (let i = 0; i < updatesArray.length; i++) {
      let el = updatesArray[i]
      updateStr += '{'

      let image_obj = el.toObject().get('image')
      let image_hash_obj = el.toObject().get('image_hash')
      let created_at_obj = el.toObject().get('created_at')
      if (image_obj != null && image_hash_obj != null && created_at_obj != null) {
        updateStr +=
          '"image":"' +
          image_obj.toString() +
          '","image_hash":"' +
          image_hash_obj.toString() +
          '","created_at":"' +
          created_at_obj.toString() +
          '"'
      }

      if (i == updatesArray.length - 1) {
        updateStr += '}'
      } else {
        updateStr += '},'
      }
    }
    updateStr += ']'
  }

  let locationsStr = ''
  if (locations != null) {
    let locationsArray = locations.toArray()

    locationsStr = '['
    for (let i = 0; i < locationsArray.length; i++) {
      let el = locationsArray[i]
      locationsStr += '{'

      let longitude_obj = el.toObject().get('longitude')
      let latitude_obj = el.toObject().get('latitude')
      if (longitude_obj != null && latitude_obj != null) {
        locationsStr += '"longitude":"' + longitude_obj.toString() + '","latitude":"' + latitude_obj.toString() + '"'
      }

      if (i == locationsArray.length - 1) {
        locationsStr += '}'
      } else {
        locationsStr += '},'
      }
    }
    locationsStr += ']'
  }

  let treeSpec = new TreeSpec(getCount_treeSpecs(COUNTER_ID).toHexString())
  treeSpec.name = name == null ? '' : name.toString()
  treeSpec.description = description == null ? '' : description.toString()
  treeSpec.externalUrl = external_url == null ? '' : external_url.toString()
  treeSpec.imageFs = image == null ? '' : image.toString()
  treeSpec.imageHash = image_ipfs_hash == null ? '' : image_ipfs_hash.toString()
  treeSpec.symbolFs = symbol == null ? '' : symbol.toString()
  treeSpec.symbolHash = symbol_ipfs_hash == null ? '' : symbol_ipfs_hash.toString()
  treeSpec.animationUrl = animation_url == null ? '' : animation_url.toString()
  treeSpec.diameter = diameter == null ? '' : diameter.toString()
  treeSpec.nursery = nursery == null ? '' : nursery.toString()

  if (location != null) {
    let locationObj = location.toObject()

    let longitude = locationObj.get('longitude')
    let latitude = locationObj.get('latitude')

    if (longitude != null) {
      treeSpec.longitude = longitude.toString()
    } else {
      treeSpec.longitude = ''
    }

    if (latitude != null) {
      treeSpec.latitude = latitude.toString()
    } else {
      treeSpec.latitude = ''
    }
  } else {
    treeSpec.longitude = ''
    treeSpec.latitude = ''
  }

  treeSpec.attributes = attrStr
  treeSpec.updates = updateStr
  treeSpec.locations = locationsStr

  if (type === 'tree') {
    let tree = Tree.load(userData.toString())
    if (tree) {
      tree.treeSpecsEntity = treeSpec.id
      treeSpec.tree = tree.id
      tree.save()
    }
  } else {
    let tempTree = TempTree.load(userData.toString())
    if (tempTree) {
      tempTree.treeSpecsEntity = treeSpec.id
      treeSpec.tempTree = tempTree.id
      tempTree.save()
    }
  }

  treeSpec.save()
}

export function saveUpdateSpec(value: JSONValue, treeUpdateId: Value): void {
  if (value.isNull()) {
    return
  }
  let obj = value.toObject()

  let location = obj.get('location')
  let updates = obj.get('updates')
  let locations = obj.get('locations')
  let nursery = obj.get('nursery')

  let updateSpec = new UpdateSpec(treeUpdateId.toString())

  let updateStr = ''
  if (updates != null) {
    let updatesArray = updates.toArray()

    updateStr = '['
    for (let i = 0; i < updatesArray.length; i++) {
      let el = updatesArray[i]
      updateStr += '{'

      let image_obj = el.toObject().get('image')
      let image_hash_obj = el.toObject().get('image_hash')
      let created_at_obj = el.toObject().get('created_at')
      if (image_obj != null && image_hash_obj != null && created_at_obj != null) {
        updateStr +=
          '"image":"' +
          image_obj.toString() +
          '","image_hash":"' +
          image_hash_obj.toString() +
          '","created_at":"' +
          created_at_obj.toString() +
          '"'
      }

      if (i == updatesArray.length - 1) {
        updateStr += '}'
      } else {
        updateStr += '},'
      }
    }
    updateStr += ']'
  }

  let locationsStr = ''
  if (locations != null) {
    let locationsArray = locations.toArray()

    locationsStr = '['
    for (let i = 0; i < locationsArray.length; i++) {
      let el = locationsArray[i]
      locationsStr += '{'

      let longitude_obj = el.toObject().get('longitude')
      let latitude_obj = el.toObject().get('latitude')
      if (longitude_obj != null && latitude_obj != null) {
        locationsStr += '"longitude":"' + longitude_obj.toString() + '","latitude":"' + latitude_obj.toString() + '"'
      }

      if (i == locationsArray.length - 1) {
        locationsStr += '}'
      } else {
        locationsStr += '},'
      }
    }
    locationsStr += ']'
  }

  updateSpec.nursery = nursery == null ? '' : nursery.toString()

  if (location != null) {
    let locationObj = location.toObject()

    let longitude = locationObj.get('longitude')
    let latitude = locationObj.get('latitude')

    if (longitude != null) {
      updateSpec.longitude = longitude.toString()
    } else {
      updateSpec.longitude = ''
    }

    if (latitude != null) {
      updateSpec.latitude = latitude.toString()
    } else {
      updateSpec.latitude = ''
    }
  } else {
    updateSpec.longitude = ''
    updateSpec.latitude = ''
  }

  updateSpec.updates = updateStr
  updateSpec.locations = locationsStr

  updateSpec.treeUpdate = treeUpdateId.toString()

  updateSpec.save()
}

function handleTreeSpecs(hash: string | null, treeId: string, type: string): void {
  // TODO: uncomment this
  // return;

  if (hash == null || hash == '') {
    return
  }

  log.debug('handleTreeSpecs TreeId: {} Hash: {}', [treeId, hash as string])

  let data = ipfs.cat(hash as string)
  if (data) {
    let dd = data.toString()
    if (dd.length > 0) {
      let jsonValue = json.fromBytes(data as Bytes)
      saveTreeSpec(jsonValue, Value.fromString(treeId), type)
    }
  }
}

function handleUpdateSpecs(hash: string | null, treeUpdateId: string): void {
  // TODO: uncomment this
  // return;

  if (hash == null || hash == '') {
    return
  }

  log.debug('handleUpdateSpecs treeUpdateId: {} Hash: {}', [treeUpdateId, hash as string])

  let data = ipfs.cat(hash as string)
  if (data) {
    let dd = data.toString()
    if (dd.length > 0) {
      let jsonValue = json.fromBytes(data as Bytes)
      saveUpdateSpec(jsonValue, Value.fromString(treeUpdateId))
    }
  }
}

export function handleTreeListed(event: TreeListed): void {
  let tree = new Tree(event.params.treeId.toHexString())
  let treeFactoryContract = TreeFactoryContract.bind(event.address)
  let c_tree = treeFactoryContract.trees(event.params.treeId)

  setTreeData(tree, c_tree)

  tree.updatedAt = event.block.timestamp as BigInt
  tree.createdAt = event.block.timestamp as BigInt
  tree.save()

  handleTreeSpecs(tree.treeSpecs, tree.id, 'tree')

  addTreeHistory(
    event.params.treeId.toHexString(),
    'TreeListed',
    event.transaction.from.toHexString(),
    event.transaction.hash.toHexString(),
    event.block.number as BigInt,
    event.block.timestamp as BigInt,
    new BigInt(0)
  )
}

export function handleTreeAssigned(event: TreeAssigned): void {
  let tree = Tree.load(event.params.treeId.toHexString())
  if (!tree) return
  let treeFactoryContract = TreeFactoryContract.bind(event.address)
  let c_tree = treeFactoryContract.trees(event.params.treeId)
  setTreeData(tree, c_tree)
  tree.updatedAt = event.block.timestamp as BigInt
  tree.save()

  addTreeHistory(
    event.params.treeId.toHexString(),
    'TreeAssigned',
    event.transaction.from.toHexString(),
    event.transaction.hash.toHexString(),
    event.block.number as BigInt,
    event.block.timestamp as BigInt,
    new BigInt(0)
  )

  addAddressHistory(
    tree.planter as string,
    'TreeAssigned',
    'treeFactory',
    event.params.treeId.toHexString(),
    event.transaction.from.toHexString(),
    event.transaction.hash.toHexString(),
    event.block.number as BigInt,
    event.block.timestamp as BigInt,
    BigInt.fromI32(0),
    BigInt.fromI32(1)
  )
}

export function handleAssignedTreePlanted(event: AssignedTreePlanted): void {
  let treeFactoryContract = TreeFactoryContract.bind(event.address)
  let treeId = event.params.treeId.toHexString()

  let tree = Tree.load(treeId)
  if (!tree) return

  let c_treeUpdate = treeFactoryContract.treeUpdates(event.params.treeId)
  let treeUpdate = new TreeUpdate(getCount_treeUpdates(COUNTER_ID).toHexString())
  setTreeUpdateData(treeUpdate, c_treeUpdate)
  treeUpdate.tree = treeId
  treeUpdate.createdAt = event.block.timestamp as BigInt
  treeUpdate.updatedAt = event.block.timestamp as BigInt
  treeUpdate.save()

  let c_tree = treeFactoryContract.trees(event.params.treeId)
  setTreeData(tree, c_tree)
  tree.lastUpdate = treeUpdate.id
  tree.updatedAt = event.block.timestamp as BigInt
  tree.save()

  if (tree.planter != null) {
    let planter = Planter.load(tree.planter as string)
    if (planter != null) {
      planter.plantedCount = planter.plantedCount.plus(BigInt.fromI32(1))
      if (planter.plantedCount.equals(planter.supplyCap as BigInt)) {
        planter.status = BigInt.fromI32(2)
      }
      planter.updatedAt = event.block.timestamp as BigInt
      planter.save()
    }
  }

  addTreeHistory(
    event.params.treeId.toHexString(),
    'AssignedTreePlanted',
    event.transaction.from.toHexString(),
    event.transaction.hash.toHexString(),
    event.block.number as BigInt,
    event.block.timestamp as BigInt,
    new BigInt(0)
  )

  addAddressHistory(
    tree.planter as string,
    'AssignedTreePlanted',
    'treeFactory',
    event.params.treeId.toHexString(),
    event.transaction.from.toHexString(),
    event.transaction.hash.toHexString(),
    event.block.number as BigInt,
    event.block.timestamp as BigInt,
    BigInt.fromI32(0),
    BigInt.fromI32(1)
  )
}

export function handleAssignedTreeVerified(event: AssignedTreeVerified): void {
  let tree = Tree.load(event.params.treeId.toHexString())
  if (tree == null) {
    return
  }
  let treeFactoryContract = TreeFactoryContract.bind(event.address)
  let c_tree = treeFactoryContract.trees(event.params.treeId)
  setTreeData(tree, c_tree)
  tree.updatedAt = event.block.timestamp as BigInt
  tree.save()

  if (tree.lastUpdate != null) {
    let treeUpdate = TreeUpdate.load(tree.lastUpdate as string)
    if (treeUpdate != null) {
      treeUpdate.updateStatus = BigInt.fromI32(3)
      treeUpdate.updatedAt = event.block.timestamp as BigInt
      treeUpdate.save()
    }
  }

  if (tree.planter != null) {
    let planter = Planter.load(tree.planter as string)
    if (planter != null) {
      planter.verifiedPlantedCount = planter.verifiedPlantedCount.plus(BigInt.fromI32(1))
      planter.updatedAt = event.block.timestamp as BigInt
      planter.save()
    }
  }

  handleTreeSpecs(tree.treeSpecs, tree.id, 'tree')

  addTreeHistory(
    event.params.treeId.toHexString(),
    'AssignedTreeVerified',
    event.transaction.from.toHexString(),
    event.transaction.hash.toHexString(),
    event.block.number as BigInt,
    event.block.timestamp as BigInt,
    new BigInt(0)
  )

  addAddressHistory(
    tree.planter as string,
    'AssignedTreeVerified',
    'treeFactory',
    event.params.treeId.toHexString(),
    event.transaction.from.toHexString(),
    event.transaction.hash.toHexString(),
    event.block.number as BigInt,
    event.block.timestamp as BigInt,
    BigInt.fromI32(0),
    BigInt.fromI32(1)
  )
}

export function handleAssignedTreeRejected(event: AssignedTreeRejected): void {
  let tree = Tree.load(event.params.treeId.toHexString())
  if (tree == null) {
    return
  }
  tree.treeStatus = BigInt.fromI32(2)
  tree.updatedAt = event.block.timestamp as BigInt
  tree.save()

  if (tree.planter != null) {
    let planter = Planter.load(tree.planter as string)
    if (planter != null) {
      planter.plantedCount = planter.plantedCount.minus(BigInt.fromI32(1))
      if (planter.status.equals(BigInt.fromI32(2))) {
        planter.status = BigInt.fromI32(1)
      }
      planter.updatedAt = event.block.timestamp as BigInt
      planter.save()
    }
  }

  if (tree.lastUpdate != null) {
    let treeUpdate = TreeUpdate.load(tree.lastUpdate as string)
    if (treeUpdate) {
      treeUpdate.updateStatus = BigInt.fromI32(2)
      treeUpdate.updatedAt = event.block.timestamp as BigInt
      treeUpdate.save()
    }
  }

  addTreeHistory(
    event.params.treeId.toHexString(),
    'AssignedTreeRejected',
    event.transaction.from.toHexString(),
    event.transaction.hash.toHexString(),
    event.block.number as BigInt,
    event.block.timestamp as BigInt,
    new BigInt(0)
  )

  addAddressHistory(
    tree.planter as string,
    'AssignedTreeRejected',
    'treeFactory',
    event.params.treeId.toHexString(),
    event.transaction.from.toHexString(),
    event.transaction.hash.toHexString(),
    event.block.number as BigInt,
    event.block.timestamp as BigInt,
    BigInt.fromI32(0),
    BigInt.fromI32(1)
  )
}

export function handleTreePlanted(event: TreePlanted): void {
  let treeFactoryContract = TreeFactoryContract.bind(event.address)

  let tempTree = new TempTree(event.params.treeId.toHexString())
  let c_tempTree = treeFactoryContract.tempTrees(event.params.treeId)
  setTempTreeData(tempTree, c_tempTree)
  tempTree.status = BigInt.fromI32(0)
  tempTree.createdAt = event.block.timestamp as BigInt
  tempTree.updatedAt = event.block.timestamp as BigInt

  // let treeModelId = treeFactoryContract.try_tempTreesModel(event.params.treeId)
  // if (!treeModelId.reverted) {
  //   let modelId = treeFactoryContract.tempTreesModel(event.params.treeId)
  //   if (modelId.gt(BigInt.fromI32(0))) {
  //     tempTree.model = modelId.toHexString()
  //   }
  // }

  tempTree.save()

  let planter = Planter.load(tempTree.planter)
  if (planter != null) {
    planter.plantedCount = planter.plantedCount.plus(BigInt.fromI32(1))
    if (planter.plantedCount.equals(planter.supplyCap as BigInt)) {
      planter.status = BigInt.fromI32(2)
    }
    planter.updatedAt = event.block.timestamp as BigInt
    planter.save()

    addAddressHistory(
      planter.id,
      'TreePlanted',
      'treeFactory',
      event.params.treeId.toHexString(),
      event.transaction.from.toHexString(),
      event.transaction.hash.toHexString(),
      event.block.number as BigInt,
      event.block.timestamp as BigInt,
      BigInt.fromI32(0),
      BigInt.fromI32(1)
    )
  }

  handleTreeSpecs(tempTree.treeSpecs, tempTree.id, 'tempTree')
}

//TO DO: remove temp tree object
export function handleTreeVerified(event: TreeVerified): void {
  let tree = new Tree(event.params.treeId.toHexString())
  let treeFactoryContract = TreeFactoryContract.bind(event.address)
  let c_tree = treeFactoryContract.trees(event.params.treeId)

  log.debug('TreeId: {}', [event.params.treeId.toString()])
  log.debug('TreeSpec: {}', [c_tree.value7.toString()])

  setTreeData(tree, c_tree)

  // let tempTree = TempTree.load(event.params.tempTreeId.toHexString())

  // if (tempTree && tempTree.model) {
  //   tree.model = tempTree.model
  // }

  tree.updatedAt = event.block.timestamp as BigInt
  tree.createdAt = event.block.timestamp as BigInt
  tree.save()

  handleTreeSpecs(tree.treeSpecs, tree.id, 'tree')

  store.remove('TempTree', event.params.tempTreeId.toHexString())

  addTreeHistory(
    event.params.treeId.toHexString(),
    'TreeVerified',
    event.transaction.from.toHexString(),
    event.transaction.hash.toHexString(),
    event.block.number as BigInt,
    event.block.timestamp as BigInt,
    new BigInt(0)
  )

  addAddressHistory(
    tree.planter as string,
    'TreeVerified',
    'treeFactory',
    event.params.treeId.toHexString(),
    event.transaction.from.toHexString(),
    event.transaction.hash.toHexString(),
    event.block.number as BigInt,
    event.block.timestamp as BigInt,
    BigInt.fromI32(0),
    BigInt.fromI32(1)
  )

  // let tempTree = TempTree.load(event.params.treeId.toHexString());
  // if(!tempTree){
  //     return;
  // }

  // let treeFactoryContract = TreeFactoryContract.bind(event.address);
  // let c_tempTree = treeFactoryContract.tempTrees(event.params.treeId);
  // setTempTreeData(tempTree, c_tempTree);
  // tempTree.status = BigInt.fromI32(4);
  // let tree = Tree.load(event.params.treeId.toHexString());
  // if (!tree) {
  //     tree = new Tree(event.params.treeId.toHexString());
  // }
  // // log.info("planter {} ", [tempTree.planter]);
  // tree.planter = tempTree.planter;
  // tree.birthDate = tempTree.birthDate;
  // tree.plantDate = tempTree.plantDate as BigInt;
  // tree.countryCode = tempTree.countryCode.toString();
  // tree.treeSpecs = tempTree.treeSpecs;
  // tree.treeStatus = BigInt.fromI32(4);
  // tree.species = BigInt.fromI32(0);
  // if (tree.funder == ZERO_ADDRESS) {
  //     tree.saleType = BigInt.fromI32(4);
  // }
  // let c_treeUpdate = treeFactoryContract.treeUpdates(event.params.treeId);
  // let treeUpdate = new TreeUpdate(getCount_treeUpdates(COUNTER_ID).toHexString());
  // setTreeUpdateData(treeUpdate, c_treeUpdate)
  // treeUpdate.tree = tree.id;
  // treeUpdate.createdAt = event.block.timestamp as BigInt;
  // treeUpdate.updatedAt = event.block.timestamp as BigInt;
  // treeUpdate.save();

  // tree.updatedAt = event.block.timestamp as BigInt;
  // tree.save();

  // tempTree.updatedAt = event.block.timestamp as BigInt;
  // tempTree.save();
}

export function handleTreeRejected(event: TreeRejected): void {
  let tempTree = TempTree.load(event.params.treeId.toHexString())
  if (tempTree == null) {
    return
  }

  let planter = Planter.load(tempTree.planter)
  if (planter != null) {
    planter.plantedCount = planter.plantedCount.minus(BigInt.fromI32(1))
    if (planter.status.equals(BigInt.fromI32(2))) {
      planter.status = BigInt.fromI32(1)
    }
    planter.updatedAt = event.block.timestamp as BigInt
    planter.save()

    addAddressHistory(
      planter.id,
      'TreeRejected',
      'treeFactory',
      event.params.treeId.toHexString(),
      event.transaction.from.toHexString(),
      event.transaction.hash.toHexString(),
      event.block.number as BigInt,
      event.block.timestamp as BigInt,
      BigInt.fromI32(0),
      BigInt.fromI32(1)
    )
  }

  store.remove('TempTree', event.params.treeId.toHexString())
}

export function handleTreeUpdated(event: TreeUpdated): void {
  let tree = Tree.load(event.params.treeId.toHexString())
  if (tree == null) {
    return
  }
  let treeFactoryContract = TreeFactoryContract.bind(event.address)
  let c_treeUpdate = treeFactoryContract.treeUpdates(event.params.treeId)
  let treeUpdate = new TreeUpdate(getCount_treeUpdates(COUNTER_ID).toHexString())
  setTreeUpdateData(treeUpdate, c_treeUpdate)
  treeUpdate.tree = tree.id
  treeUpdate.createdAt = event.block.timestamp as BigInt
  treeUpdate.updatedAt = event.block.timestamp as BigInt
  treeUpdate.updateSpecEntity = treeUpdate.id
  treeUpdate.save()

  tree.lastUpdate = treeUpdate.id
  tree.updatedAt = event.block.timestamp as BigInt

  tree.save()

  addTreeHistory(
    event.params.treeId.toHexString(),
    'TreeUpdated',
    event.transaction.from.toHexString(),
    event.transaction.hash.toHexString(),
    event.block.number as BigInt,
    event.block.timestamp as BigInt,
    new BigInt(0)
  )

  if (tree.planter && tree.planter != null) {
    addAddressHistory(
      tree.planter as string,
      'TreeUpdated',
      'treeFactory',
      event.params.treeId.toHexString(),
      event.transaction.from.toHexString(),
      event.transaction.hash.toHexString(),
      event.block.number as BigInt,
      event.block.timestamp as BigInt,
      BigInt.fromI32(0),
      BigInt.fromI32(1)
    )
  }

  handleUpdateSpecs(treeUpdate.updateSpecs, treeUpdate.id)
}

export function handleTreeUpdatedVerified(event: TreeUpdatedVerified): void {
  let tree = Tree.load(event.params.treeId.toHexString())
  if (!tree) {
    return
  }

  if (tree.lastUpdate == null) {
    return
  }

  let treeUpdate = TreeUpdate.load(tree.lastUpdate as string)

  if (!treeUpdate) {
    return
  }

  let treeFactoryContract = TreeFactoryContract.bind(event.address)
  let c_tree = treeFactoryContract.trees(event.params.treeId)
  setTreeData(tree, c_tree)
  tree.updatedAt = event.block.timestamp as BigInt
  tree.save()

  treeUpdate.updateStatus = BigInt.fromI32(3)
  treeUpdate.updatedAt = event.block.timestamp as BigInt
  treeUpdate.save()

  handleTreeSpecs(tree.treeSpecs, tree.id, 'tree')

  addTreeHistory(
    event.params.treeId.toHexString(),
    'TreeUpdatedVerified',
    event.transaction.from.toHexString(),
    event.transaction.hash.toHexString(),
    event.block.number as BigInt,
    event.block.timestamp as BigInt,
    new BigInt(0)
  )

  addAddressHistory(
    tree.planter as string,
    'TreeUpdatedVerified',
    'treeFactory',
    event.params.treeId.toHexString(),
    event.transaction.from.toHexString(),
    event.transaction.hash.toHexString(),
    event.block.number as BigInt,
    event.block.timestamp as BigInt,
    BigInt.fromI32(0),
    BigInt.fromI32(1)
  )
}

export function handleTreeUpdateRejected(event: TreeUpdateRejected): void {
  let tree = Tree.load(event.params.treeId.toHexString())
  if (!tree) {
    return
  }

  if (tree.lastUpdate == null) {
    return
  }

  let treeUpdate = TreeUpdate.load(tree.lastUpdate as string)
  if (!treeUpdate) {
    return
  }

  treeUpdate.updateStatus = BigInt.fromI32(2)
  treeUpdate.updatedAt = event.block.timestamp as BigInt
  treeUpdate.save()

  addTreeHistory(
    event.params.treeId.toHexString(),
    'TreeUpdateRejected',
    event.transaction.from.toHexString(),
    event.transaction.hash.toHexString(),
    event.block.number as BigInt,
    event.block.timestamp as BigInt,
    new BigInt(0)
  )

  addAddressHistory(
    tree.planter as string,
    'TreeUpdateRejected',
    'treeFactory',
    event.params.treeId.toHexString(),
    event.transaction.from.toHexString(),
    event.transaction.hash.toHexString(),
    event.block.number as BigInt,
    event.block.timestamp as BigInt,
    BigInt.fromI32(0),
    BigInt.fromI32(1)
  )
}

export function handleTreeSpecsUpdated(event: TreeSpecsUpdated): void {
  let tree = Tree.load(event.params.treeId.toHexString())
  if (!tree) {
    return
  }

  tree.treeSpecs = event.params.treeSpecs.toString()
  tree.updatedAt = event.block.timestamp as BigInt
  tree.save()

  handleTreeSpecs(tree.treeSpecs, tree.id, 'tree')

  addTreeHistory(
    event.params.treeId.toHexString(),
    'TreeSpecsUpdated',
    event.transaction.from.toHexString(),
    event.transaction.hash.toHexString(),
    event.block.number as BigInt,
    event.block.timestamp as BigInt,
    new BigInt(0)
  )
}


//---------------------------------------------// version offchain change


export function handleAssignedTreeVerifiedOffchain(event: AssignedTreeVerifiedWithSign): void {
  let treeFactoryContract = TreeFactoryContract.bind(event.address)


  log.info(event.params.treeId.toString(), [])
  log.info(event.address.toHexString(), [])
  
  
  let c_tree = treeFactoryContract.trees(event.params.treeId)

  log.info(c_tree.value7.toString(), [])

  let tree = Tree.load(event.params.treeId.toHexString()) as Tree
  
  let nonce = treeFactoryContract.plantersNonce(Address.fromString(tree.planter as string))
  
  log.info(nonce.toString(), [])


  let treeUpdate = new TreeUpdate(getCount_treeUpdates(COUNTER_ID).toHexString())
  
  setTreeUpdateDataOffchain(treeUpdate, c_tree)

  treeUpdate.tree = event.params.treeId.toString()

  treeUpdate.createdAt = event.block.timestamp as BigInt
  treeUpdate.updatedAt = event.block.timestamp as BigInt

  treeUpdate.save()
  

  setTreeData(tree, c_tree)

  tree.lastUpdate = treeUpdate.id

  tree.updatedAt = event.block.timestamp as BigInt

  tree.save()

  log.info(tree.planter as string, [])

  let planter = Planter.load(tree.planter as string) as Planter


  // planter.verifiedPlantedCount = planter.verifiedPlantedCount.plus(BigInt.fromI32(1))

  // planter.plantedCount = planter.plantedCount.plus(BigInt.fromI32(1))

  // if (planter.plantedCount.equals(planter.supplyCap as BigInt)) {
  //   planter.status = BigInt.fromI32(2)
  // }

  // planter.updatedAt = event.block.timestamp as BigInt
  // planter.nonce = nonce as BigInt
  // planter.save()

  

  // handleTreeSpecs(tree.treeSpecs, tree.id, 'tree')

  // addTreeHistory(
  //   event.params.treeId.toHexString(),
  //   'AssignedTreeVerified',
  //   event.transaction.from.toHexString(),
  //   event.transaction.hash.toHexString(),
  //   event.block.number as BigInt,
  //   event.block.timestamp as BigInt,
  //   new BigInt(0)
  // )

  // addAddressHistory(
  //   tree.planter as string,
  //   'AssignedTreeVerified',
  //   'treeFactory',
  //   event.params.treeId.toHexString(),
  //   event.transaction.from.toHexString(),
  //   event.transaction.hash.toHexString(),
  //   event.block.number as BigInt,
  //   event.block.timestamp as BigInt,
  //   BigInt.fromI32(0),
  //   BigInt.fromI32(1)
  // )
}


export function handleTreeVerifiedOffchain(event: TreeVerifiedWithSign): void { 
  let tree = new Tree(event.params.treeId.toHexString())

  let treeFactoryContract = TreeFactoryContract.bind(event.address)
  
  let c_tree = treeFactoryContract.trees(event.params.treeId)
  
  let nonce = treeFactoryContract.plantersNonce(tree.planter as unknown as Address)



  setTreeData(tree, c_tree)


  let treeUpdate = new TreeUpdate(getCount_treeUpdates(COUNTER_ID).toHexString())
  
  setTreeUpdateDataOffchain(treeUpdate, c_tree)

  treeUpdate.tree = event.params.treeId.toString()

  treeUpdate.createdAt = event.block.timestamp as BigInt
  treeUpdate.updatedAt = event.block.timestamp as BigInt

  treeUpdate.save()


  tree.updatedAt = event.block.timestamp as BigInt
  tree.createdAt = event.block.timestamp as BigInt


  tree.lastUpdate = treeUpdate.id;
  
  tree.save()
  


  let planter = Planter.load(tree.planter as string) as Planter

  
  planter.plantedCount = planter.plantedCount.plus(BigInt.fromI32(1))
  planter.verifiedPlantedCount = planter.verifiedPlantedCount.plus(BigInt.fromI32(1))

  if (planter.plantedCount.equals(planter.supplyCap as BigInt)) {
    planter.status = BigInt.fromI32(2)
  }

  planter.updatedAt = event.block.timestamp as BigInt
  planter.nonce = nonce as BigInt
  planter.save() 
  

  handleTreeSpecs(tree.treeSpecs, tree.id, 'tree')



  addTreeHistory(
    event.params.treeId.toHexString(),
    'TreeVerified',
    event.transaction.from.toHexString(),
    event.transaction.hash.toHexString(),
    event.block.number as BigInt,
    event.block.timestamp as BigInt,
    new BigInt(0)
  )

  addAddressHistory(
    tree.planter as string,
    'TreeVerified',
    'treeFactory',
    event.params.treeId.toHexString(),
    event.transaction.from.toHexString(),
    event.transaction.hash.toHexString(),
    event.block.number as BigInt,
    event.block.timestamp as BigInt,
    BigInt.fromI32(0),
    BigInt.fromI32(1)
  )
}


export function handleTreeUpdatedVerifiedOffchain(event: TreeUpdatedVerifiedWithSign): void {
  let tree = Tree.load(event.params.treeId.toHexString()) as Tree
  
  let treeFactoryContract = TreeFactoryContract.bind(event.address)

  let c_tree = treeFactoryContract.trees(event.params.treeId)

  let nonce = treeFactoryContract.plantersNonce(tree.planter as unknown as Address)


  //---------------------> tree update section
  
  let treeUpdate = new TreeUpdate(getCount_treeUpdates(COUNTER_ID).toHexString()) as TreeUpdate

  setTreeUpdateDataOffchain(treeUpdate, c_tree)

  treeUpdate.tree = tree.id
  treeUpdate.createdAt = event.block.timestamp as BigInt
  treeUpdate.updatedAt = event.block.timestamp as BigInt
  treeUpdate.updateSpecEntity = treeUpdate.id
  
  treeUpdate.save()

  setTreeData(tree, c_tree)

  tree.lastUpdate = treeUpdate.id

  tree.updatedAt = event.block.timestamp as BigInt

  tree.save()


  let planter = Planter.load(tree.planter as string) as Planter

  planter.nonce = nonce as BigInt
  planter.updatedAt = event.block.timestamp as BigInt
  planter.save()

  handleTreeSpecs(tree.treeSpecs, tree.id, 'tree')

  addTreeHistory(
    event.params.treeId.toHexString(),
    'TreeUpdatedVerified',
    event.transaction.from.toHexString(),
    event.transaction.hash.toHexString(),
    event.block.number as BigInt,
    event.block.timestamp as BigInt,
    new BigInt(0)
  )

  addAddressHistory(
    tree.planter as string,
    'TreeUpdatedVerified',
    'treeFactory',
    event.params.treeId.toHexString(),
    event.transaction.from.toHexString(),
    event.transaction.hash.toHexString(),
    event.block.number as BigInt,
    event.block.timestamp as BigInt,
    BigInt.fromI32(0),
    BigInt.fromI32(1)
  )
}