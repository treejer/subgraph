
import {
    RegularMint,
    RegularSale as RegularSaleContract,
    TreeFunded,
    TreeFundedById,
    PriceUpdated
} from "../../generated/RegularSale/RegularSale";
import { RegularRequest, Funder, Tree } from "../../generated/schema";
import { BigInt } from '@graphprotocol/graph-ts';
import { COUNTER_ID, getCount_RegularRequest, getGlobalData,addTreeHistory } from '../helpers';


// TODO: handle recipient
export function handleTreeFunded(event: TreeFunded): void {
    // let brgtr = new RegularRequest(getCount_RegularRequest(COUNTER_ID).toHexString());
    // brgtr.count = event.params.count as BigInt;
    // brgtr.funder = event.params.recipient.toHexString();
    // brgtr.amount = event.params.amount as BigInt;
    // brgtr.save();
    // let funder = Funder.load(brgtr.funder);
    // if (!funder) funder = newFunder(brgtr.funder);
    // funder.lastRequestId = brgtr.id;
    // funder.spentDai = funder.spentDai.plus(event.params.amount as BigInt);
    // // funder.spentWeth = funder.spentWeth.plus(event.params.amount as BigInt); // DAI to WETH ???
    // funder.treeCount = funder.treeCount.plus(BigInt.fromI32(1));
    // funder.save();
    let flag = false;
    let rr = new RegularRequest(getCount_RegularRequest(COUNTER_ID).toHexString());
    rr.count = event.params.count as BigInt;
    rr.funder = event.params.recipient.toHexString();
    rr.amount = event.params.amount as BigInt;
    rr.createdAt = event.block.timestamp as BigInt;
    rr.updatedAt = event.block.timestamp as BigInt;
    rr.save();
    let funder = Funder.load(rr.funder as string);
    if (!funder) {
        funder = new Funder(rr.funder as string);
        flag = true;
        funder.regularSpent = event.params.amount as BigInt;
        funder.treeCount = event.params.count as BigInt;
        funder.regularCount = event.params.count as BigInt;
        funder.lastRequestId = rr.id;
        funder.createdAt = event.block.timestamp as BigInt;

    } else {
        funder.regularSpent = funder.regularSpent.plus(event.params.amount as BigInt);
        funder.treeCount = funder.treeCount.plus(event.params.count as BigInt);
        funder.regularCount = funder.regularCount.plus(event.params.count as BigInt);
        funder.lastRequestId = rr.id;
    }
    funder.updatedAt = event.block.timestamp as BigInt;

    funder.save();
    let gb = getGlobalData();
    gb.totalRegularTreeSellAmount = gb.totalRegularTreeSellAmount.plus(event.params.amount as BigInt);
    gb.totalRegularTreeSellCount = gb.totalRegularTreeSellCount.plus(event.params.count as BigInt);
    if (flag) gb.funderCount = gb.funderCount.plus(BigInt.fromI32(1));
    gb.ownedTreeCount = gb.ownedTreeCount.plus(event.params.count as BigInt);
    gb.save();


}

export function handleRegularMint(event: RegularMint): void {
    let funder = Funder.load(event.params.recipient.toHexString());
    if (!funder) funder = newFunder(event.params.recipient.toHexString());


    
    let tree = Tree.load(event.params.treeId.toHexString());
    // let tree = RegularTree.load(event.params.treeId.toHexString());
    if (!tree) {
        tree = new Tree(event.params.treeId.toHexString());
        tree.createdAt = event.block.timestamp as BigInt;
    }
    tree.funder = funder.id;
    tree.requestId = funder.lastRequestId;
    tree.updatedAt = event.block.timestamp as BigInt;

    tree.save();

    addTreeHistory(event.params.treeId.toHexString(),
    'RegularMint',
    event.transaction.from.toHexString(),
    event.transaction.hash.toHexString(),
    event.block.number as BigInt,
    event.block.timestamp as BigInt, event.params.price);
}
function newFunder(id: string): Funder {
    let funder = new Funder(id);
    funder.treeCount = BigInt.fromI32(0);
    funder.spentWeth = BigInt.fromI32(0);
    funder.spentDai = BigInt.fromI32(0);
    funder.auctionCount = BigInt.fromI32(0);
    funder.regularCount = BigInt.fromI32(0);
    funder.incrementalCount = BigInt.fromI32(0);
    funder.auctionSpent = BigInt.fromI32(0);
    funder.regularSpent = BigInt.fromI32(0);
    funder.incrementalSpent = BigInt.fromI32(0);
    return funder;
}

export function handleTreeFundedById(event: TreeFundedById): void {
    let funder = Funder.load(event.params.recipient.toHexString());
    let flag = false;
    if (!funder) {
        funder = newFunder(event.params.recipient.toHexString());
        funder.createdAt = event.block.timestamp as BigInt;
        flag = true;
    }
    funder.regularSpent = funder.regularSpent.plus(event.params.amount as BigInt);
    funder.regularCount = funder.regularCount.plus(BigInt.fromI32(1));
    funder.treeCount = funder.treeCount.plus(BigInt.fromI32(1));
    funder.spentDai = funder.spentDai.plus(event.params.amount as BigInt);
    // funder.spentWeth = funder.spentWeth.plus(event.params.amount as BigInt); // DAI to WETH ???
    funder.treeCount = funder.treeCount.plus(BigInt.fromI32(1));
    funder.updatedAt = event.block.timestamp as BigInt;
    funder.save();

    let tree = Tree.load(event.params.treeId.toHexString());
    if (tree) {
        tree.funder = funder.id;
        tree.updatedAt = event.block.timestamp as BigInt;

        tree.save();
    }

    if (flag) {
        let gb = getGlobalData();
        gb.funderCount = gb.funderCount.plus(BigInt.fromI32(1));
        gb.save();
    }
}

export function handlePriceUpdated(event: PriceUpdated): void {
    let gb = getGlobalData();
    gb.regularTreePrice = event.params.price as BigInt;
    gb.save();
}








