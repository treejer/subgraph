
import { IncrementalSell as IncrementalSellContract, IncrementalSellUpdated, IncrementalSell__incrementalPriceResult, IncrementalTreeSold } from "../../generated/IncrementalSell/IncrementalSell";
import { IncrementalSell, Owner, Tree } from "../../generated/schema";
import { Address, BigInt, log } from '@graphprotocol/graph-ts';
import { COUNTER_ID, getCount_updateSpec, getGlobalData, INCREMENTAL_SELL_ID, ZERO_ADDRESS } from '../helpers';



function upsertTreeIncremental(id: string): void {
    let tree = Tree.load(id);
    if (!tree) tree = new Tree(id);
    tree.provideStatus = BigInt.fromI32(2);
    tree.treeStatus = BigInt.fromI32(2);
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


/*
  struct IncrementalPrice {
        uint256 startTree;
        uint256 endTree;
        uint256 initialPrice;
        uint64 increaseStep;
        uint64 increaseRatio;
    }
 */
function setIncSellData(incSell: IncrementalSell | null, c_incSell: IncrementalSell__incrementalPriceResult): void {
    incSell.startTree = c_incSell.value0.toHexString();
    incSell.endTree = c_incSell.value1.toHexString();
    incSell.startTreeId = c_incSell.value0 as BigInt;
    incSell.endTreeId = c_incSell.value1 as BigInt;
    incSell.initialPrice = c_incSell.value2 as BigInt;
    incSell.increaseStep = BigInt.fromI32(c_incSell.value3.toI32());
    incSell.increaseRatio = BigInt.fromI32(c_incSell.value4.toI32());
}
export function handleIncrementalSellUpdated(event: IncrementalSellUpdated): void {
    let incrementalSellContract = IncrementalSellContract.bind(event.address);
    let c_incSell = incrementalSellContract.incrementalPrice();
    let incSell = IncrementalSell.load(INCREMENTAL_SELL_ID);
    if (!incSell) incSell = new IncrementalSell(INCREMENTAL_SELL_ID);
    setIncSellData(incSell, c_incSell);
    for (let i = parseInt(incSell.startTree); i <= parseInt(incSell.endTree); i++) {
        upsertTreeIncremental(BigInt.fromString(i.toString().split(".")[0]).toHexString());
    }

    incSell.save();
}


export function handleIncrementalTreeSold(event: IncrementalTreeSold): void {
    let tree = Tree.load(event.params.treeId.toHexString());
    if (!tree) tree = new Tree(event.params.treeId.toHexString()); // TODO: set tree params
    tree.owner = event.params.buyer.toHexString();
    tree.save();
    let flag = false;
    let owner = Owner.load(event.params.buyer.toHexString());
    if (!owner) {
        owner = newOwner(event.params.buyer.toHexString());
        flag = true;
    }
    owner.incrementalCount = owner.incrementalCount.plus(BigInt.fromI32(1));
    owner.incrementalSpent = owner.incrementalSpent.plus(event.params.amount as BigInt);
    owner.treeCount = owner.treeCount.plus(BigInt.fromI32(1));
    owner.spentWeth = owner.spentWeth.plus(event.params.amount as BigInt);
    owner.save();
    let gb = getGlobalData();
    gb.totalIncrementalSellCount = gb.totalIncrementalSellCount.plus(BigInt.fromI32(1));
    gb.totalIncrementalSellAmount = gb.totalIncrementalSellAmount.plus(event.params.amount as BigInt);
    if (event.params.treeId.gt(gb.lastIncrementalSold as BigInt)) {
        gb.lastIncrementalSold = event.params.treeId as BigInt;
    }
    let incSell = IncrementalSell.load(INCREMENTAL_SELL_ID);
    gb.prevIncrementalPrice = ((event.params.treeId.minus(incSell.startTreeId as BigInt)).div(incSell.increaseStep as BigInt)).times(incSell.increaseRatio as BigInt).times(incSell.initialPrice as BigInt).plus(incSell.initialPrice as BigInt);
    gb.nowIncrementalPrice = event.params.treeId.plus(BigInt.fromI32(1)).minus(incSell.startTreeId as BigInt).div(incSell.increaseStep as BigInt).times(incSell.increaseRatio as BigInt).times(incSell.initialPrice as BigInt).plus(incSell.initialPrice as BigInt);
    gb.nextIncremetalPrice = event.params.treeId.plus(BigInt.fromI32(2)).minus(incSell.startTreeId as BigInt).div(incSell.increaseStep as BigInt).times(incSell.increaseRatio as BigInt).times(incSell.initialPrice as BigInt).plus(incSell.initialPrice as BigInt);
    gb.ownedTreeCount = gb.ownedTreeCount.plus(BigInt.fromI32(1));
    if (flag) {
        gb.ownerCount = gb.ownerCount.plus(BigInt.fromI32(1));
    }
    gb.save();
}
