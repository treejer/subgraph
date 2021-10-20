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
import { BigInt, JSONValue, log, Value, ipfs, json, Bytes } from '@graphprotocol/graph-ts';
import { COUNTER_ID, getCount_treeSpecs, getCount_updateSpec, ZERO_ADDRESS } from '../helpers';

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
function setUpTreeData(uptree: TreeUpdate | null, c_uptree: TreeFactory__treeUpdatesResult): void {
    if (uptree === null) return;
    uptree.treeSpecs = c_uptree.value0.toString();
    uptree.status = c_uptree.value1 as BigInt;
}
function copyTree(t1: Tree | null, t2: Tree | null): void {
    if (t1 === null || t2 === null) return;
    t1.birthDate = t2.birthDate;
    t1.countryCode = t2.countryCode;
    t1.funder = t2.funder;
    t1.species = t2.species;
    t1.treeStatus = t2.treeStatus;
    t1.treeSpecs = t2.treeSpecs;
    t1.treeAttribute = t2.treeAttribute;
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
                        attrStr += '"trait_type":"' + trait_type + '","value":"' + value_obj.toBigInt().toString() + '","display_type":"date"';
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


    let treeSpec = new TreeSpec(getCount_treeSpecs(COUNTER_ID).toHexString());
    treeSpec.name = name == null ? '' : name.toString();
    treeSpec.description = description == null ? '' : description.toString();
    treeSpec.externalUrl = external_url == null ? '' : external_url.toString();
    treeSpec.imageFs = image == null ? '' : image.toString();
    treeSpec.imageHash = image_ipfs_hash == null ? '' : image_ipfs_hash.toString();
    treeSpec.symbolFs = symbol == null ? '' : symbol.toString();
    treeSpec.symbolHash = symbol_ipfs_hash == null ? '' : symbol_ipfs_hash.toString();
    treeSpec.animationUrl = animation_url == null ? '' : animation_url.toString();
    treeSpec.diameter = diameter == null ? new BigInt(0) : diameter.toBigInt();

    if (location != null) {
        let locationObj = location.toObject();

        let longitude = locationObj.get('longitude');
        let latitude = locationObj.get('latitude');

        treeSpec.longitude = longitude == null ? '' : (longitude.toBigInt().toString());
        treeSpec.latitude = latitude == null ? '' : (latitude.toBigInt().toString());
    }

    treeSpec.attributes = attrStr;
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

function handleTreeSpecs(hash: string, treeId: string): void {

    // return;
    
    if(hash == null || hash == "" || hash.length <= 5 ){
        return;
    }
    
    let data = ipfs.cat(hash);
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
    tree.treeStatus = BigInt.fromI32(2);
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

    // log.debug("treeID {}", [treeId]);
    let tree = new Tree(treeId);
    // log.debug("BIGINT treeId {}", [treeId])
    let c_tree = treeFactoryContract.trees(event.params.treeId);
    // log.debug("ctree planter: {}", [c_tree.value0.toHexString()]);
    let c_uptree = treeFactoryContract.treeUpdates(event.params.treeId);
    setTreeData(tree, c_tree);

    upsertTree(tree);
    let uptree = new TreeUpdate(getCount_updateSpec(COUNTER_ID).toHexString());
    uptree.treeSpecs = c_uptree.value0.toString();
    uptree.tree = treeId;
    uptree.updateDate = event.block.timestamp as BigInt;
    uptree.status = BigInt.fromString(c_uptree.value1.toString());
    uptree.type = true;
    tree.treeStatus = BigInt.fromI32(3);
    uptree.save();
    tree.lastUpdate = uptree.id;
    tree.updatedAt = event.block.timestamp as BigInt;
    tree.save();

    handleTreeSpecs(tree.treeSpecs, tree.id);

    if (tree.planter != null) {
        let planter = Planter.load(tree.planter as string);
        if (!planter && planter != null) {
            planter.plantedCount = planter.plantedCount.plus(BigInt.fromI32(1));
            if (planter.plantedCount.equals(planter.supplyCap as BigInt)) {
                planter.status = BigInt.fromI32(2);
            }
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
    tree.treeStatus = BigInt.fromI32(4);
    tree.updatedAt = event.block.timestamp as BigInt;
    tree.save();

    let uptree = TreeUpdate.load(tree.lastUpdate);
    if (uptree != null) {
        uptree.status = BigInt.fromI32(3);
        uptree.updatedAt = event.block.timestamp as BigInt;
        uptree.save();
    }

    if (tree.planter != null) {
        let planter = Planter.load(tree.planter as string);
        if (planter != null) {
            planter.verifiedPlantedCount = planter.verifiedPlantedCount.plus(BigInt.fromI32(1));
            planter.updatedAt = event.block.timestamp as BigInt;
            planter.save();
        }
    }
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



    let uptree = TreeUpdate.load(tree.lastUpdate);
    if (uptree) {
        uptree.status = BigInt.fromI32(2);
        uptree.updatedAt = event.block.timestamp as BigInt;
        uptree.save();
    }
}

export function handleTreePlanted(event: TreePlanted): void {
    let tempTree = new TempTree(event.params.treeId.toHexString());
    let treeFactoryContract = TreeFactoryContract.bind(event.address);
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
        planter.save();
    }

    handleTreeSpecs(tempTree.treeSpecs, tempTree.id);
}

export function handleTreeVerified(event: TreeVerified): void {
    let tempTree = new TempTree(event.params.treeId.toHexString());
    let treeFactoryContract = TreeFactoryContract.bind(event.address);
    let c_tempTree = treeFactoryContract.tempTrees(event.params.treeId);
    setTempTreeData(tempTree, c_tempTree);
    tempTree.status = BigInt.fromI32(4);
    let tree = Tree.load(event.params.treeId.toHexString());
    if (!tree) {
        tree = new Tree(event.params.treeId.toHexString());
    }
    // log.info("planter {} ", [tempTree.planter]);
    tree.planter = tempTree.planter;
    tree.birthDate = tempTree.birthDate;
    tree.plantDate = tempTree.plantDate as BigInt;
    tree.countryCode = tempTree.countryCode.toString();
    tree.treeSpecs = tempTree.treeSpecs;
    tree.treeStatus = BigInt.fromI32(4);
    tree.species = BigInt.fromI32(0);
    if (tree.funder == ZERO_ADDRESS) {
        tree.saleType = BigInt.fromI32(4);
    }
    let uptree = new TreeUpdate(getCount_updateSpec(COUNTER_ID).toHexString());
    uptree.tree = tree.id;
    uptree.updateDate = tree.plantDate;
    uptree.status = BigInt.fromI32(3);
    uptree.treeSpecs = tree.treeSpecs;
    uptree.type = true;

    uptree.updatedAt = event.block.timestamp as BigInt;
    uptree.save();

    tree.updatedAt = event.block.timestamp as BigInt;
    tree.save();

    tempTree.updatedAt = event.block.timestamp as BigInt;
    tempTree.save();
}

export function handleTreeRejected(event: TreeRejected): void {
    let tempTree = TempTree.load(event.params.treeId.toHexString());
    if (tempTree == null) {
        return;
    }
    tempTree.status = BigInt.fromI32(1);
    tempTree.updatedAt = event.block.timestamp as BigInt;
    tempTree.save();


    let planter = Planter.load(tempTree.planter);
    if (planter == null) {
        return;
    }

    planter.plantedCount = planter.plantedCount.minus(BigInt.fromI32(1));
    if (planter.status.equals(BigInt.fromI32(2))) {
        planter.status = BigInt.fromI32(1);
    }
    planter.updatedAt = event.block.timestamp as BigInt;
    planter.save();
}


export function handleTreeUpdated(event: TreeUpdated): void {
    let tree = Tree.load(event.params.treeId.toHexString());
    if (tree == null) {
        return;
    }
    let treeFactoryContract = TreeFactoryContract.bind(event.address);
    let c_uptree = treeFactoryContract.treeUpdates(event.params.treeId);
    let uptree = new TreeUpdate(getCount_updateSpec(COUNTER_ID).toHexString());
    uptree.tree = tree.id;
    uptree.updateDate = event.block.timestamp as BigInt;
    uptree.status = BigInt.fromI32(1);
    uptree.treeSpecs = c_uptree.value0;
    uptree.type = false;
    uptree.createdAt = event.block.timestamp as BigInt;
    uptree.updatedAt = event.block.timestamp as BigInt;

    uptree.save();
    // handleTreeSpecs(tree.treeSpecstree.id);
}


export function handleTreeUpdatedVerified(event: TreeUpdatedVerified): void {
    let tree = Tree.load(event.params.treeId.toHexString());
    if (!tree) {
        return;
    }
    let uptree = TreeUpdate.load(tree.lastUpdate);
    if (!uptree) {
        return;
    }
    let treeFactoryContract = TreeFactoryContract.bind(event.address);
    let c_tree = treeFactoryContract.trees(event.params.treeId);
    tree.treeSpecs = c_tree.value7;
    tree.treeStatus = c_tree.value4 as BigInt;
    tree.updatedAt = event.block.timestamp as BigInt;
    tree.save();

    uptree.status = BigInt.fromI32(3);
    uptree.updatedAt = event.block.timestamp as BigInt;
    uptree.save();

}

export function handleTreeUpdateRejected(event: TreeUpdateRejected): void {
    let tree = Tree.load(event.params.treeId.toHexString());
    if (!tree) {
        return;
    }
    let uptree = TreeUpdate.load(tree.lastUpdate);
    if (!uptree) {
        return;
    }

    uptree.status = BigInt.fromI32(2);
    uptree.updatedAt = event.block.timestamp as BigInt;
    uptree.save();
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







