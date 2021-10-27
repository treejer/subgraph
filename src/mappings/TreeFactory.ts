import { Planter, TempTree, Tree, TreeSpec, TreeUpdate } from '../../generated/schema';
import {
    TreeListed,
    TreeAssigned,
    AssignedTreePlanted,
    AssignedTreeVerified,
    AssignedTreeRejected,
    TreePlanted,
    TreeVerified,
    TreeRejected,
    TreeUpdated,
    TreeUpdatedVerified,
    TreeUpdateRejected,
    TreeSpecsUpdated,
    TreeFactory__treesResult,
    TreeFactory__tempTreesResult,
    TreeFactory__treeUpdatesResult, TreeFactory as TreeFactoryContract
} from '../../generated/TreeFactory/TreeFactory';
import { BigInt, JSONValue, log, Value, ipfs, json, Bytes, store, JSONValueKind } from '@graphprotocol/graph-ts';
import { COUNTER_ID, getCount_treeSpecs, getCount_treeUpdates, ZERO_ADDRESS } from '../helpers';

function setTempTreeData(tempTree: TempTree | null, c_tempTree: TreeFactory__tempTreesResult): void {
    if (tempTree === null) return;
    tempTree.birthDate = c_tempTree.value0 as BigInt;
    tempTree.plantDate = c_tempTree.value1 as BigInt;
    tempTree.countryCode = c_tempTree.value2.toString();
    tempTree.planter = c_tempTree.value4.toHexString();
    tempTree.treeSpecs = c_tempTree.value5;

}
function setTreeData(tree: Tree | null, c_tree: TreeFactory__treesResult): void {
    if (tree === null) return;
    tree.planter = c_tree.value0.toHexString();
    tree.species = c_tree.value1 as BigInt;
    tree.countryCode = c_tree.value2.toString();
    tree.saleType = c_tree.value3 as BigInt;
    tree.treeStatus = c_tree.value4 as BigInt;
    tree.plantDate = c_tree.value5 as BigInt;
    tree.birthDate = c_tree.value6 as BigInt;
    tree.treeSpecs = c_tree.value7.toString();
}
function setTreeUpdateData(treeUpdate: TreeUpdate | null, c_treeUpdate: TreeFactory__treeUpdatesResult): void {
    if (treeUpdate === null) return;
    treeUpdate.updateSpecs = c_treeUpdate.value0.toString();
    treeUpdate.updateStatus = c_treeUpdate.value1 as BigInt;
}
function copyTree(t1: Tree | null, t2: Tree | null): void {
    if (t1 === null || t2 === null) return;
    t1.birthDate = t2.birthDate;
    t1.countryCode = t2.countryCode;
    t1.funder = t2.funder;
    t1.species = t2.species;
    t1.treeStatus = t2.treeStatus;
    t1.treeSpecs = t2.treeSpecs;
    t1.attribute = t2.attribute;
    t1.saleType = t2.saleType;
    t1.planter = t2.planter;
    t1.plantDate = t2.plantDate;
}
function upsertTree(tree: Tree | null): void {
    if (tree === null) return;
    let t = Tree.load(tree.id);
    if (t !== null) {
        copyTree(t, tree);
        t.save();
    } else {
        tree.save();
    }
}

export function saveTreeSpec(value: JSONValue, userData: Value): void {
    if (value.isNull()) { return; }
    let obj = value.toObject();

    let name = obj.get('name');
    let description = obj.get('description');
    let external_url = obj.get('external_url');
    let image = obj.get('image');
    let image_ipfs_hash = obj.get('image_ipfs_hash');
    let symbol = obj.get('symbol');
    let symbol_ipfs_hash = obj.get('symbol_ipfs_hash');
    let animation_url = obj.get('animation_url');
    let diameter = obj.get('diameter');
    let location = obj.get('location');
    let attributes = obj.get('attributes');
    let updates = obj.get('updates');

    let attrStr = '';
    if (attributes != null) {
        let attributesArray = attributes.toArray();


        attrStr = "[";
        for (let i = 0; i < attributesArray.length; i++) {
            let el = attributesArray[i];
            attrStr += "{";

            let trait_type_obj = el.toObject().get("trait_type");
            if (trait_type_obj != null) {
                let trait_type = trait_type_obj.toString();

                let value_obj = el.toObject().get("value");
                if (value_obj != null) {
                    if (trait_type == "birthday") {
                        attrStr += '"trait_type":"' + trait_type + '","value":"' + value_obj.toString() + '","display_type":"date"';
                    } else {
                        attrStr += '"trait_type":"' + trait_type + '","value":"' + value_obj.toString() + '"';
                    }
                }
            }

            if (i == attributesArray.length - 1) {
                attrStr += "}";
            } else {
                attrStr += "},";
            }
        }
        attrStr += "]";
    }

    let updateStr = '';
    if (updates != null) {
        let updatesArray = updates.toArray();


        updateStr = "[";
        for (let i = 0; i < updatesArray.length; i++) {
            let el = updatesArray[i];
            updateStr += "{";

            let image_obj = el.toObject().get("image");
            let image_hash_obj = el.toObject().get("image_hash");
            let created_at_obj = el.toObject().get("created_at");
            if (image_obj != null && image_hash_obj != null && created_at_obj != null) {            
                updateStr += '"image":"' + image_obj.toString() + '","image_hash":"' + image_hash_obj.toString() + '","created_at":"' + created_at_obj.toString() + '"';
            }

            if (i == updatesArray.length - 1) {
                updateStr += "}";
            } else {
                updateStr += "},";
            }
        }
        updateStr += "]";
    }


    let treeSpec = new TreeSpec(getCount_treeSpecs(COUNTER_ID).toHexString());
    treeSpec.name = name == null ? '' : name.toString();
    treeSpec.description = description == null ? '' : description.toString();
    treeSpec.externalUrl = external_url == null ? '' : external_url.toString();
    treeSpec.imageFs = image == null ? '' : image.toString();
    treeSpec.imageHash = image_ipfs_hash == null ? '' : image_ipfs_hash.toString();
    treeSpec.symbolFs = symbol == null ? '' : symbol.toString();
    treeSpec.symbolHash = symbol_ipfs_hash == null ? '' : symbol_ipfs_hash.toString();
    treeSpec.animationUrl = animation_url == null ? '' : animation_url.toString();
    treeSpec.diameter = diameter == null ? '' : diameter.toString();

    if (location != null) {
        let locationObj = location.toObject();

        let longitude = locationObj.get('longitude');
        let latitude = locationObj.get('latitude');

        if(longitude != null) {
            treeSpec.longitude = longitude.toString();
        }

        if(latitude != null) {
            treeSpec.latitude = latitude.toString();
        }

    }

    treeSpec.attributes = attrStr;
    treeSpec.updates = updateStr;
    treeSpec.save();

    let tree = Tree.load(userData.toString());
    if (tree) {
        tree.treeSpecsEntity = treeSpec.id;
        tree.save();
    } else {
        let tempTree = TempTree.load(userData.toString());
        if (tempTree == null) {
            log.info('Undefined tempTree in saveTreeSpec {}', [userData.toString()]);
            return;
        }
        tempTree.treeSpecsEntity = treeSpec.id;
        tempTree.save();
    }
}

function handleTreeSpecs(hash: string | null, treeId: string): void {
    // TODO: uncomment this
    // return;

    if (hash == null || hash == "") {
        return;
    }

    let data = ipfs.cat(hash as string);
    if (data) {
        let dd = data.toString();
        if (dd.length > 0) {
            let jsonValue = json.fromBytes(data as Bytes);
            saveTreeSpec(jsonValue, Value.fromString(treeId));
        }
    }
}

export function handleTreeListed(event: TreeListed): void {
    let tree = new Tree(event.params.treeId.toHexString());
    let treeFactoryContract = TreeFactoryContract.bind(event.address);
    let c_tree = treeFactoryContract.trees(event.params.treeId);

    setTreeData(tree, c_tree);

    tree.updatedAt = event.block.timestamp as BigInt;
    tree.createdAt = event.block.timestamp as BigInt;
    tree.save();

    handleTreeSpecs(tree.treeSpecs, tree.id);
}


export function handleTreeAssigned(event: TreeAssigned): void {
    let tree = Tree.load(event.params.treeId.toHexString());
    if (!tree) return;
    let treeFactoryContract = TreeFactoryContract.bind(event.address);
    let c_tree = treeFactoryContract.trees(event.params.treeId);
    setTreeData(tree, c_tree);
    tree.updatedAt = event.block.timestamp as BigInt;
    tree.save();
}


export function handleAssignedTreePlanted(event: AssignedTreePlanted): void {
    let treeFactoryContract = TreeFactoryContract.bind(event.address);
    let treeId = event.params.treeId.toHexString();

    let tree = Tree.load(treeId);
    if (!tree) return;


    let c_treeUpdate = treeFactoryContract.treeUpdates(event.params.treeId);
    let treeUpdate = new TreeUpdate(getCount_treeUpdates(COUNTER_ID).toHexString());
    setTreeUpdateData(treeUpdate, c_treeUpdate);
    treeUpdate.tree = treeId;
    treeUpdate.createdAt = event.block.timestamp as BigInt;
    treeUpdate.updatedAt = event.block.timestamp as BigInt;
    treeUpdate.save();

    let c_tree = treeFactoryContract.trees(event.params.treeId);
    setTreeData(tree, c_tree);
    tree.lastUpdate = treeUpdate.id;
    tree.updatedAt = event.block.timestamp as BigInt;
    tree.save();



    if (tree.planter != null) {
        let planter = Planter.load(tree.planter as string);
        if (planter != null) {
            planter.plantedCount = planter.plantedCount.plus(BigInt.fromI32(1));
            if (planter.plantedCount.equals(planter.supplyCap as BigInt)) {
                planter.status = BigInt.fromI32(2);
            }
            planter.updatedAt = event.block.timestamp as BigInt;
            planter.save();
        }
    }

}

export function handleAssignedTreeVerified(event: AssignedTreeVerified): void {
    let tree = Tree.load(event.params.treeId.toHexString());
    if (tree == null) {
        return;
    }
    let treeFactoryContract = TreeFactoryContract.bind(event.address);
    let c_tree = treeFactoryContract.trees(event.params.treeId);
    setTreeData(tree, c_tree);
    tree.updatedAt = event.block.timestamp as BigInt;
    tree.save();

    if (tree.lastUpdate != null) {
        let treeUpdate = TreeUpdate.load(tree.lastUpdate as string);
        if (treeUpdate != null) {
            treeUpdate.updateStatus = BigInt.fromI32(3);
            treeUpdate.updatedAt = event.block.timestamp as BigInt;
            treeUpdate.save();
        }
    }


    if (tree.planter != null) {
        let planter = Planter.load(tree.planter as string);
        if (planter != null) {
            planter.verifiedPlantedCount = planter.verifiedPlantedCount.plus(BigInt.fromI32(1));
            planter.updatedAt = event.block.timestamp as BigInt;
            planter.save();
        }
    }

    handleTreeSpecs(tree.treeSpecs, tree.id);

}

export function handleAssignedTreeRejected(event: AssignedTreeRejected): void {
    let tree = Tree.load(event.params.treeId.toHexString());
    if (tree == null) {
        return;
    }
    tree.treeStatus = BigInt.fromI32(2);
    tree.updatedAt = event.block.timestamp as BigInt;
    tree.save();

    if (tree.planter != null) {
        let planter = Planter.load(tree.planter as string);
        if (planter != null) {
            planter.plantedCount = planter.plantedCount.minus(BigInt.fromI32(1));
            if (planter.status.equals(BigInt.fromI32(2))) {
                planter.status = BigInt.fromI32(1);
            }
            planter.updatedAt = event.block.timestamp as BigInt;
            planter.save();
        }
    }

    if (tree.lastUpdate != null) {
        let treeUpdate = TreeUpdate.load(tree.lastUpdate as string);
        if (treeUpdate) {
            treeUpdate.updateStatus = BigInt.fromI32(2);
            treeUpdate.updatedAt = event.block.timestamp as BigInt;
            treeUpdate.save();
        }
    }
}

export function handleTreePlanted(event: TreePlanted): void {
    let treeFactoryContract = TreeFactoryContract.bind(event.address);

    let tempTree = new TempTree(event.params.treeId.toHexString());
    let c_tempTree = treeFactoryContract.tempTrees(event.params.treeId);
    setTempTreeData(tempTree, c_tempTree);
    tempTree.status = BigInt.fromI32(0);
    tempTree.createdAt = event.block.timestamp as BigInt;
    tempTree.updatedAt = event.block.timestamp as BigInt;
    tempTree.save();


    let planter = Planter.load(tempTree.planter);
    if (planter != null) {
        planter.plantedCount = planter.plantedCount.plus(BigInt.fromI32(1));
        if (planter.plantedCount.equals(planter.supplyCap as BigInt)) {
            planter.status = BigInt.fromI32(2);
        }
        planter.updatedAt = event.block.timestamp as BigInt;
        planter.save();
    }

    // handleTreeSpecs(tempTree.treeSpecs, tempTree.id);
}

//TO DO: remove temp tree object
export function handleTreeVerified(event: TreeVerified): void {

    let tree = new Tree(event.params.treeId.toHexString());
    let treeFactoryContract = TreeFactoryContract.bind(event.address);
    let c_tree = treeFactoryContract.trees(event.params.treeId);

    log.debug("TreeId: {}", [event.params.treeId.toString()])
    log.debug("TreeSpec: {}", [c_tree.value7.toString()])

    
    setTreeData(tree, c_tree);

    tree.updatedAt = event.block.timestamp as BigInt;
    tree.createdAt = event.block.timestamp as BigInt;
    tree.save();

    handleTreeSpecs(tree.treeSpecs, tree.id);

    store.remove('TempTree', event.params.tempTreeId.toHexString());


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
    let tempTree = TempTree.load(event.params.treeId.toHexString());
    if (tempTree == null) {
        return;
    }

    let planter = Planter.load(tempTree.planter);
    if (planter != null) {
        planter.plantedCount = planter.plantedCount.minus(BigInt.fromI32(1));
        if (planter.status.equals(BigInt.fromI32(2))) {
            planter.status = BigInt.fromI32(1);
        }
        planter.updatedAt = event.block.timestamp as BigInt;
        planter.save();
    }

    store.remove('TempTree', event.params.treeId.toHexString());
}


export function handleTreeUpdated(event: TreeUpdated): void {
    let tree = Tree.load(event.params.treeId.toHexString());
    if (tree == null) {
        return;
    }
    let treeFactoryContract = TreeFactoryContract.bind(event.address);
    let c_treeUpdate = treeFactoryContract.treeUpdates(event.params.treeId);
    let treeUpdate = new TreeUpdate(getCount_treeUpdates(COUNTER_ID).toHexString());
    setTreeUpdateData(treeUpdate, c_treeUpdate);
    treeUpdate.tree = tree.id;
    treeUpdate.createdAt = event.block.timestamp as BigInt;
    treeUpdate.updatedAt = event.block.timestamp as BigInt;
    treeUpdate.save();


    tree.lastUpdate = treeUpdate.id;
    tree.updatedAt = event.block.timestamp as BigInt;
    tree.save();
}


export function handleTreeUpdatedVerified(event: TreeUpdatedVerified): void {
    let tree = Tree.load(event.params.treeId.toHexString());
    if (!tree) {
        return;
    }

    if(tree.lastUpdate == null) {
        return;
    }

    let treeUpdate = TreeUpdate.load(tree.lastUpdate as string);
    if (!treeUpdate) {
        return;
    }

    let treeFactoryContract = TreeFactoryContract.bind(event.address);
    let c_tree = treeFactoryContract.trees(event.params.treeId);
    setTreeData(tree, c_tree);
    tree.updatedAt = event.block.timestamp as BigInt;
    tree.save();

    treeUpdate.updateStatus = BigInt.fromI32(3);
    treeUpdate.updatedAt = event.block.timestamp as BigInt;
    treeUpdate.save();

    handleTreeSpecs(tree.treeSpecs, tree.id);


}

export function handleTreeUpdateRejected(event: TreeUpdateRejected): void {
    let tree = Tree.load(event.params.treeId.toHexString());
    if (!tree) {
        return;
    }

    if(tree.lastUpdate == null) {
        return;
    }

    let treeUpdate = TreeUpdate.load(tree.lastUpdate as string);
    if (!treeUpdate) {
        return;
    }

    treeUpdate.updateStatus = BigInt.fromI32(2);
    treeUpdate.updatedAt = event.block.timestamp as BigInt;
    treeUpdate.save();
}


export function handleTreeSpecsUpdated(event: TreeSpecsUpdated): void {
    let tree = Tree.load(event.params.treeId.toHexString());
    if (!tree) {
        return;
    }

    tree.treeSpecs = event.params.treeSpecs.toString();
    tree.updatedAt = event.block.timestamp as BigInt;
    tree.save();

    handleTreeSpecs(tree.treeSpecs, tree.id);
}







