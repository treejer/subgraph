import { Planter, RegularTree, Tree, UpdateTree } from '../../generated/schema';
import { AddTreeCall, AssignTreeToPlanterCall, PlantRejected, PlantVerified, RegularPlantRejected, RegularPlantVerified, RegularTreePlanted, TreeAdded, TreeAssigned, TreeFactory as TreeFactoryContract, TreeFactory__regularTreesResult, TreeFactory__treeDataResult, TreeFactory__updateTreesResult, TreePlanted, TreeUpdated, UpdateRejected, UpdateVerified } from '../../generated/TreeFactory/TreeFactory';
import { Address, BigInt, log } from '@graphprotocol/graph-ts';
import { COUNTER_ID, getCount_updateSpec, ZERO_ADDRESS } from '../helpers';

/**
 * 
 struct TreeStruct {
        address planterId;
        uint256 treeType;
        uint16 mintStatus;
        uint16 countryCode;
        uint32 provideStatus;
        uint64 treeStatus;
        uint64 plantDate;
        uint64 birthDate;
        string treeSpecs;
    }


     struct UpdateTree {
        string updateSpecs;
        uint64 updateStatus;
    }

    struct RegularTree {
        uint64 birthDate;
        uint64 plantDate;
        uint64 countryCode;
        uint64 otherData;
        address planterAddress;
        string treeSpecs;
    }
 */
function setRegularTreeData(rtree: RegularTree | null, c_rtree: TreeFactory__regularTreesResult): void {
    if (rtree === null) return;
    rtree.birthDate = c_rtree.value0 as BigInt;
    rtree.plantDate = c_rtree.value1 as BigInt;
    rtree.countryCode = c_rtree.value2 as BigInt;
    rtree.planter = c_rtree.value4.toHexString();
    rtree.treeSpecs = c_rtree.value5;

}
function setTreeData(tree: Tree | null, c_tree: TreeFactory__treeDataResult): void {
    if (tree === null) return;
    tree.planter = c_tree.value0.toHexString();
    tree.treeType = c_tree.value1 as BigInt;
    tree.mintStatus = c_tree.value2.toString();
    tree.countryCode = c_tree.value3.toString();
    tree.provideStatus = c_tree.value4 as BigInt;
    tree.treeStatus = c_tree.value5 as BigInt;
    tree.plantDate = c_tree.value6 as BigInt;
    tree.birthDate = c_tree.value7 as BigInt;
    tree.treeSpecs = c_tree.value8.toString();
}
function setUpTreeData(uptree: UpdateTree | null, c_uptree: TreeFactory__updateTreesResult): void {
    if (uptree === null) return;
    uptree.treeSpecs = c_uptree.value0.toString();
    uptree.status = c_uptree.value1 as BigInt;
}
function copyTree(t1: Tree | null, t2: Tree | null): void {
    if (t1 === null || t2 === null) return;
    t1.birthDate = t2.birthDate;
    t1.countryCode = t2.countryCode;
    t1.mintStatus = t2.mintStatus;
    t1.owner = t2.owner;
    t1.treeType = t2.treeType;
    t1.treeStatus = t2.treeStatus;
    t1.treeSpecs = t2.treeSpecs;
    t1.treeAttribute = t2.treeAttribute;
    t1.provideStatus = t2.provideStatus;
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
export function handleTreePlanted(event: TreePlanted): void {
    let treeFactoryContract = TreeFactoryContract.bind(event.address);
    let treeId = event.params.treeId.toHexString();

    // log.debug("treeID {}", [treeId]);
    let tree = new Tree(treeId);
    // log.debug("BIGINT treeId {}", [BigInt.fromString(treeId)])
    let c_tree = treeFactoryContract.treeData(event.params.treeId);
    // log.debug("ctree planter: {}", [c_tree.value0.toHexString()]);
    let c_uptree = treeFactoryContract.updateTrees(event.params.treeId);
    setTreeData(tree, c_tree);

    upsertTree(tree);
    let uptree = new UpdateTree(getCount_updateSpec(COUNTER_ID).toHexString());
    uptree.treeSpecs = c_uptree.value0.toString();
    uptree.tree = treeId;
    uptree.updateDate = event.block.timestamp as BigInt;
    uptree.status = BigInt.fromString(c_uptree.value1.toString());
    uptree.type = true;
    tree.treeStatus = BigInt.fromI32(3);
    uptree.save();
    tree.lastUpdate = uptree.id;
    tree.save();
    let planter = Planter.load(tree.planter);
    if (!planter) return;
    planter.plantedCount = planter.plantedCount.plus(BigInt.fromI32(1));
    if (planter.plantedCount.equals(planter.capacity as BigInt)) {
        planter.status = BigInt.fromI32(2);
    }
    planter.save();
}

export function handleTreeAdded(event: TreeAdded): void {
    let tree = new Tree(event.params.treeId.toHexString());
    let treeFactoryContract = TreeFactoryContract.bind(event.address);
    let c_tree = treeFactoryContract.treeData(event.params.treeId);
    setTreeData(tree, c_tree);
    tree.treeStatus = BigInt.fromI32(2);
    // tree.treeSpecs = call.inputs._treeDescription;
    tree.save();
}

export function handleTreeAssigned(event: TreeAssigned): void {
    let tree = Tree.load(event.params.treeId.toHexString());
    if (!tree) return;
    let treeFactoryContract = TreeFactoryContract.bind(event.address);
    let c_tree = treeFactoryContract.treeData(event.params.treeId);
    setTreeData(tree, c_tree);
    tree.save();
}

export function handlePlantVerified(event: PlantVerified): void {
    let tree = Tree.load(event.params.treeId.toHexString());
    if (!tree) return;
    let treeFactoryContract = TreeFactoryContract.bind(event.address);
    let c_tree = treeFactoryContract.treeData(event.params.treeId);
    setTreeData(tree, c_tree);
    tree.treeStatus = BigInt.fromI32(4);
    let uptree = UpdateTree.load(tree.lastUpdate);
    uptree.status = BigInt.fromI32(3);
    uptree.save();
    tree.save();
}

export function handlePlantRejected(event: PlantRejected): void {
    let tree = Tree.load(event.params.treeId.toHexString());
    if (!tree) return;
    let planter = Planter.load(tree.planter);
    if (planter) {
        planter.plantedCount = planter.plantedCount.minus(BigInt.fromI32(1));
        if (planter.status.equals(BigInt.fromI32(2))) {
            planter.status = BigInt.fromI32(1);
        }
        planter.save();
    }
    let uptree = UpdateTree.load(tree.lastUpdate);
    uptree.status = BigInt.fromI32(2);
    uptree.save();
    tree.treeStatus = BigInt.fromI32(2);
    tree.save();
}

export function handleRegularTreePlanted(event: RegularTreePlanted): void {
    let rtree = new RegularTree(event.params.treeId.toHexString());
    let treeFactoryContract = TreeFactoryContract.bind(event.address);
    let c_rtree = treeFactoryContract.regularTrees(event.params.treeId);
    setRegularTreeData(rtree, c_rtree);
    rtree.status = BigInt.fromI32(0);
    rtree.save();
    let planter = Planter.load(rtree.planter);
    log.warning("planter {} ", [planter.id]);
    planter.plantedCount = planter.plantedCount.plus(BigInt.fromI32(1));
    if (planter.plantedCount.equals(planter.capacity as BigInt)) {
        planter.status = BigInt.fromI32(2);
    }
    planter.save();
}

export function handleRegularPlantVerified(event: RegularPlantVerified): void {
    let rtree = new RegularTree(event.params.treeId.toHexString());
    let treeFactoryContract = TreeFactoryContract.bind(event.address);
    let c_rtree = treeFactoryContract.regularTrees(event.params.treeId);
    setRegularTreeData(rtree, c_rtree);
    rtree.status = BigInt.fromI32(4);
    let tree = Tree.load(event.params.treeId.toHexString());
    if (!tree) {
        tree = new Tree(event.params.treeId.toHexString());
    }
    log.warning("planter {} ", [rtree.planter]);
    tree.planter = rtree.planter;
    tree.birthDate = rtree.birthDate;
    tree.plantDate = rtree.plantDate as BigInt;
    tree.countryCode = rtree.countryCode.toString();
    tree.treeSpecs = rtree.treeSpecs;
    tree.treeStatus = BigInt.fromI32(4);
    tree.treeType = BigInt.fromI32(0);
    if (tree.owner == ZERO_ADDRESS) {
        tree.provideStatus = BigInt.fromI32(4);
    }
    let uptree = new UpdateTree(getCount_updateSpec(COUNTER_ID).toHexString());
    uptree.tree = tree.id;
    uptree.updateDate = tree.plantDate;
    uptree.status = BigInt.fromI32(3);
    uptree.treeSpecs = tree.treeSpecs;
    uptree.type = true;
    uptree.save();
    tree.save();
    rtree.save();
}

export function handleRegularPlantRejected(event: RegularPlantRejected): void {
    let rtree = RegularTree.load(event.params.treeId.toHexString());
    let planter = Planter.load(rtree.planter);
    planter.plantedCount = planter.plantedCount.minus(BigInt.fromI32(1));
    if (planter.status.equals(BigInt.fromI32(2))) {
        planter.status = BigInt.fromI32(1);
    }
    planter.save();
    rtree.status = BigInt.fromI32(1);
    rtree.save();
}

export function handleTreeUpdated(event: TreeUpdated): void {
    let tree = Tree.load(event.params.treeId.toHexString());
    let treeFactoryContract = TreeFactoryContract.bind(event.address);
    let c_rtree = treeFactoryContract.regularTrees(event.params.treeId);
    let c_uptree = treeFactoryContract.updateTrees(event.params.treeId);
    let uptree = new UpdateTree(getCount_updateSpec(COUNTER_ID).toHexString());
    uptree.tree = tree.id;
    uptree.updateDate = event.block.timestamp;
    uptree.status = BigInt.fromI32(1);
    uptree.treeSpecs = c_uptree.value0;
    uptree.type = false;
    uptree.save();
}


export function handleUpdateVerified(event: UpdateVerified): void {
    let tree = Tree.load(event.params.treeId.toHexString());
    let upTree = UpdateTree.load(tree.lastUpdate);
    upTree.status = BigInt.fromI32(3);
    let treeFactoryContract = TreeFactoryContract.bind(event.address);
    let c_tree = treeFactoryContract.treeData(event.params.treeId);
    tree.treeSpecs = c_tree.value8;
    tree.treeStatus = c_tree.value4 as BigInt;
    tree.save();
    upTree.save();
}

export function handleUpdateRejected(event: UpdateRejected): void {
    let tree = Tree.load(event.params.treeId.toHexString());
    let uptree = UpdateTree.load(tree.lastUpdate);
    uptree.status = BigInt.fromI32(2);
    uptree.save();
}
