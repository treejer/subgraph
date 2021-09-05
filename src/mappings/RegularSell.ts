
import { RegularMint, RegularSell as RegularSellContract, RegularTreeRequsted, RegularTreeRequstedById, TreePriceUpdated } from "../../generated/RegularSell/RegularSell";
import { RegularRequest, IncrementalSell, Owner, Tree, GlobalData, RegularTree } from "../../generated/schema";
import { Address, BigInt, log } from '@graphprotocol/graph-ts';
import { COUNTER_ID, getCount_RegularRequest, getCount_updateSpec, getGlobalData, INCREMENTAL_SELL_ID, ZERO_ADDRESS } from '../helpers';



export function handleRegularTreeRequsted(event: RegularTreeRequsted): void {
    // let brgtr = new RegularRequest(getCount_RegularRequest(COUNTER_ID).toHexString());
    // brgtr.count = event.params.count as BigInt;
    // brgtr.buyer = event.params.buyer.toHexString();
    // brgtr.amount = event.params.amount as BigInt;
    // brgtr.save();
    // let owner = Owner.load(brgtr.buyer);
    // if (!owner) owner = newOwner(brgtr.buyer);
    // owner.lastRequestId = brgtr.id;
    // owner.spentDai = owner.spentDai.plus(event.params.amount as BigInt);
    // // owner.spentWeth = owner.spentWeth.plus(event.params.amount as BigInt); // DAI to WETH ???
    // owner.treeCount = owner.treeCount.plus(BigInt.fromI32(1));
    // owner.save();
    let flag = false;
    let rr = new RegularRequest(getCount_RegularRequest(COUNTER_ID).toHexString());
    rr.count = event.params.count as BigInt;
    rr.owner = event.params.buyer.toHexString();
    rr.amount = event.params.amount as BigInt;
    rr.date = event.block.timestamp;
    rr.save();
    let owner = Owner.load(rr.owner);
    if (!owner) {
        owner = new Owner(rr.owner);
        flag = true;
        owner.regularSpent = event.params.amount as BigInt;
        owner.treeCount = event.params.count as BigInt;
        owner.regularCount = event.params.count as BigInt;
        owner.lastRequestId = rr.id;
    } else {
        owner.regularSpent = owner.regularSpent.plus(event.params.amount as BigInt);
        owner.treeCount = owner.treeCount.plus(event.params.count as BigInt);
        owner.regularCount = owner.regularCount.plus(event.params.count as BigInt);
        owner.lastRequestId = rr.id;
    }
    owner.save();
    let gb = getGlobalData();
    gb.totalRegularTreeSellAmount = gb.totalRegularTreeSellAmount.plus(event.params.amount as BigInt);
    gb.totalRegularTreeSellCount = gb.totalRegularTreeSellCount.plus(event.params.count as BigInt);
    if (flag) gb.ownerCount = gb.ownerCount.plus(BigInt.fromI32(1));
    gb.ownedTreeCount = gb.ownedTreeCount.plus(event.params.count as BigInt);
    gb.save();


}

export function handleRegularMint(event: RegularMint): void {
    let owner = Owner.load(event.params.buyer.toHexString());
    if (!owner) owner = newOwner(event.params.buyer.toHexString());
    let tree = Tree.load(event.params.treeId.toHexString());
    // let tree = RegularTree.load(event.params.treeId.toHexString());
    if (!tree) {
        return; // TODO:  Fix this
    }
    tree.owner = owner.id;
    tree.requestId = owner.lastRequestId;
    tree.save();
}
function newOwner(id: string): Owner {
    let owner = new Owner(id);
    owner.treeCount = BigInt.fromI32(0);
    owner.spentWeth = BigInt.fromI32(0);
    owner.spentDai = BigInt.fromI32(0);
    owner.auctionCount = BigInt.fromI32(0);
    owner.regularCount = BigInt.fromI32(0);
    owner.incrementalCount = BigInt.fromI32(0);
    owner.auctionSpent = BigInt.fromI32(0);
    owner.regularSpent = BigInt.fromI32(0);
    owner.incrementalSpent = BigInt.fromI32(0);
    return owner;
}

export function handleRegularTreeRequstedById(event: RegularTreeRequstedById): void {
    let owner = Owner.load(event.params.buyer.toHexString());
    let flag = false;
    if (!owner) {
        owner = newOwner(event.params.buyer.toHexString());
        flag = true;
    }
    owner.regularSpent = owner.regularSpent.plus(event.params.amount as BigInt);
    owner.regularCount = owner.regularCount.plus(BigInt.fromI32(1));
    owner.treeCount = owner.treeCount.plus(BigInt.fromI32(1));
    owner.spentDai = owner.spentDai.plus(event.params.amount as BigInt);
    // owner.spentWeth = owner.spentWeth.plus(event.params.amount as BigInt); // DAI to WETH ???
    owner.treeCount = owner.treeCount.plus(BigInt.fromI32(1));
    let tree = Tree.load(event.params.treeId.toHexString());
    tree.owner = owner.id;
    tree.save();
    owner.save();
    if (flag) {
        let gb = getGlobalData();
        gb.ownerCount = gb.ownerCount.plus(BigInt.fromI32(1));
        gb.save();
    }
}

export function handleTreePriceUpdated(event: TreePriceUpdated): void {
    let gb = getGlobalData();
    gb.regularTreePrice = event.params.price as BigInt;
    gb.save();
}








