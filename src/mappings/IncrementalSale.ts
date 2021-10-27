
import {
    IncrementalSale as IncrementalSaleContract,
    IncrementalSaleUpdated,
    IncrementalSaleDataUpdated,
    TreeFunded,
    IncrementalSale__incrementalSaleDataResult
} from "../../generated/IncrementalSale/IncrementalSale";
import { IncrementalSale, Funder, Tree } from "../../generated/schema";
import { Address, BigInt, log } from '@graphprotocol/graph-ts';
import { INCREMENTAL_SELL_ID } from '../helpers';



function upsertTreeIncremental(id: string, timestamp: BigInt): void {
    let tree = Tree.load(id);
    if (!tree){
        tree = new Tree(id);
        tree.createdAt = timestamp as BigInt;
        tree.updatedAt = timestamp as BigInt;
    } else {
        tree.updatedAt = timestamp as BigInt;
    }
    tree.saleType = BigInt.fromI32(2);
    tree.treeStatus = BigInt.fromI32(2);
    tree.save();
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


/*
  struct IncrementalPrice {
        uint256 startTree;
        uint256 endTree;
        uint256 initialPrice;
        uint64 increments;
        uint64 priceJump;
    }
 */
function setIncSellData(incSell: IncrementalSale | null, c_incSell: IncrementalSale__incrementalSaleDataResult): void {
    if(!incSell) return;
    incSell.startTree = c_incSell.value0.toHexString();
    incSell.endTree = c_incSell.value1.toHexString();
    incSell.startTreeId = c_incSell.value0 as BigInt;
    incSell.endTreeId = c_incSell.value1 as BigInt;
    incSell.initialPrice = c_incSell.value2 as BigInt;
    incSell.increments = BigInt.fromI32(c_incSell.value3.toI32());
    incSell.priceJump = BigInt.fromI32(c_incSell.value4.toI32());
}
export function handleIncrementalSaleUpdated(event: IncrementalSaleUpdated): void {
    let incrementalSellContract = IncrementalSaleContract.bind(event.address);
    let c_incSell = incrementalSellContract.incrementalSaleData();
    let incSell = IncrementalSale.load(INCREMENTAL_SELL_ID);
    if (!incSell) incSell = new IncrementalSale(INCREMENTAL_SELL_ID);
    setIncSellData(incSell, c_incSell);
    for (let i = parseInt(incSell.startTree); i <= parseInt(incSell.endTree); i++) {
        upsertTreeIncremental(BigInt.fromString(i.toString().split(".")[0]).toHexString(), event.block.timestamp as BigInt);
        // upsertTreeIncremental(BigInt.fromString(i.toString()).toHexString());
    }

    incSell.save();
}
export function handleIncrementalSaleDataUpdated(event: IncrementalSaleDataUpdated): void {
    
}

// TODO: handle recipient and global data
export function handleTreeFunded(event: TreeFunded): void {

    let endTreeId = parseInt(event.params.startTreeId.toString()) + parseInt(event.params.count.toString());

    for (let i = parseInt(event.params.startTreeId.toString()); i < endTreeId; i++) {

        let fundedTreeId = BigInt.fromI32(i as i32).toHexString();

        let tree = Tree.load(fundedTreeId);
        if (!tree) {
            tree = new Tree(fundedTreeId); // TODO: set tree params
            tree.createdAt = event.block.timestamp as BigInt;
        }

        tree.funder = event.params.recipient.toHexString();
        tree.updatedAt = event.block.timestamp as BigInt;
        tree.save();
    }


    
    let flag = false;
    let funder = Funder.load(event.params.recipient.toHexString());
    if (!funder) {
        funder = newFunder(event.params.recipient.toHexString());
        flag = true;
        funder.createdAt = event.block.timestamp as BigInt;
    }
    funder.incrementalCount = funder.incrementalCount.plus(event.params.count as BigInt);
    // funder.incrementalSpent = funder.incrementalSpent.plus(event.params.amount as BigInt);
    funder.treeCount = funder.treeCount.plus(event.params.count as BigInt);
    // funder.spentWeth = funder.spentWeth.plus(event.params.amount as BigInt);
    funder.updatedAt = event.block.timestamp as BigInt;
    funder.save();
    // let gb = getGlobalData();
    // gb.totalIncrementalSaleCount = gb.totalIncrementalSaleCount.plus(BigInt.fromI32(1));
    // gb.totalIncrementalSaleAmount = gb.totalIncrementalSaleAmount.plus(event.params.amount as BigInt);
    // if (event.params.startTreeId.gt(gb.lastIncrementalSold as BigInt)) {
    //     gb.lastIncrementalSold = event.params.startTreeId as BigInt;
    // }
    // let incSell = IncrementalSale.load(INCREMENTAL_SELL_ID);
    // gb.prevIncrementalPrice = ((event.params.startTreeId.minus(incSell.startTreeId as BigInt)).div(incSell.increments as BigInt)).times(incSell.priceJump as BigInt).times(incSell.initialPrice as BigInt).plus(incSell.initialPrice as BigInt);
    // gb.nowIncrementalPrice = event.params.startTreeId.plus(BigInt.fromI32(1)).minus(incSell.startTreeId as BigInt).div(incSell.increments as BigInt).times(incSell.priceJump as BigInt).times(incSell.initialPrice as BigInt).plus(incSell.initialPrice as BigInt);
    // gb.nextIncremetalPrice = event.params.startTreeId.plus(BigInt.fromI32(2)).minus(incSell.startTreeId as BigInt).div(incSell.increments as BigInt).times(incSell.priceJump as BigInt).times(incSell.initialPrice as BigInt).plus(incSell.initialPrice as BigInt);
    // gb.ownedTreeCount = gb.ownedTreeCount.plus(BigInt.fromI32(1));
    // if (flag) {
    //     gb.funderCount = gb.funderCount.plus(BigInt.fromI32(1));
    // }
    // gb.save();
}
