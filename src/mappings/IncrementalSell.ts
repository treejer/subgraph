import { IncrementalSell as IncrementalSellContract, IncrementalSellUpdated, IncrementalSell__incrementalPriceResult, IncrementalTreeSold } from "../../generated/IncrementalSell/IncrementalSell";
import { IncrementalSell, Owner, Tree } from "../../generated/schema";
import { Address, BigInt, log } from '@graphprotocol/graph-ts';
import { COUNTER_ID, getCount_updateSpec, INCREMENTAL_SELL_ID, ZERO_ADDRESS } from '../helpers';



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
    for (let i = parseInt(incSell.startTree); i < parseInt(incSell.endTree); i++) {
        upsertTreeIncremental(BigInt.fromString(i.toString().split(".")[0]).toHexString());
    }

    incSell.save();
}


export function handleIncrementalTreeSold(event: IncrementalTreeSold): void {
    let tree = Tree.load(event.params.treeId.toHexString());
    if (!tree) tree = new Tree(event.params.treeId.toHexString()); // TODO: set tree params
    tree.owner = event.params.buyer.toHexString();
    tree.save();
    let owner = Owner.load(event.params.buyer.toHexString());
    if (!owner) owner = newOwner(event.params.buyer.toHexString());
    owner.treeCount = owner.treeCount.plus(BigInt.fromI32(1));
    owner.spentWeth = owner.spentWeth.plus(event.params.amount as BigInt);
    owner.save();
}

