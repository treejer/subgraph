
import {
    RegularMint,
    RegularSale as RegularSaleContract,
    TreeFunded,
    TreeFundedById,
    PriceUpdated,
    ReferralRewardClaimed
} from "../../generated/RegularSale/RegularSale";
import { RegularRequest, Funder, Tree,Referrer } from "../../generated/schema";
import { BigInt } from '@graphprotocol/graph-ts';
import { COUNTER_ID, getCount_RegularRequest, getGlobalData,addTreeHistory } from '../helpers';
import { updateReferrer } from '../helpers/referrer';


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
    rr.funder = event.params.funder.toHexString();
    rr.amount = event.params.amount as BigInt;
    rr.createdAt = event.block.timestamp as BigInt;
    rr.updatedAt = event.block.timestamp as BigInt;
    rr.save();

    let funder = Funder.load(event.params.funder.toHexString());
    if (!funder) {
        funder = new Funder(event.params.funder.toHexString());
        flag = true;
        funder.createdAt = event.block.timestamp as BigInt;
    }
    funder.regularSpent = funder.regularSpent.plus(event.params.amount as BigInt);
    funder.spentDai = funder.spentDai.plus(event.params.amount as BigInt);

    funder.treeCount = funder.treeCount.plus(event.params.count as BigInt);
    funder.regularCount = funder.regularCount.plus(event.params.count as BigInt);
    funder.lastRequestId = rr.id;

    funder.updatedAt = event.block.timestamp as BigInt;
    funder.save();


    let gb = getGlobalData();
    gb.totalRegularTreeSaleAmount = gb.totalRegularTreeSaleAmount.plus(event.params.amount as BigInt);
    gb.totalRegularTreeSaleCount = gb.totalRegularTreeSaleCount.plus(event.params.count as BigInt);
    if (flag) gb.funderCount = gb.funderCount.plus(BigInt.fromI32(1));
    gb.save();

    updateReferrer(event.params.referrer, event.block.timestamp as BigInt);
}

export function handleRegularMint(event: RegularMint): void {
    let funder = Funder.load(event.transaction.from.toHexString());
    if (!funder){
        funder = newFunder(event.transaction.from.toHexString());
        funder.createdAt = event.block.timestamp as BigInt;

        let gb = getGlobalData();
        gb.funderCount = gb.funderCount.plus(BigInt.fromI32(1));
        gb.save();

        funder.regularSpent = funder.regularSpent.plus(event.params.price as BigInt);
        funder.regularCount = funder.regularCount.plus(BigInt.fromI32(1));
        funder.treeCount = funder.treeCount.plus(BigInt.fromI32(1));
        funder.spentDai = funder.spentDai.plus(event.params.price as BigInt);
        funder.treeCount = funder.treeCount.plus(BigInt.fromI32(1));
    }

    funder.updatedAt = event.block.timestamp as BigInt;
    funder.save();


    
    let tree = Tree.load(event.params.treeId.toHexString());
    if (!tree) {
        tree = new Tree(event.params.treeId.toHexString());
        tree.createdAt = event.block.timestamp as BigInt;
    }
    tree.soldType = BigInt.fromI32(4);
    tree.saleType = BigInt.fromI32(0);

    tree.funder = event.transaction.from.toHexString();
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
    let funder = Funder.load(event.params.funder.toHexString());
    let flag = false;
    if (!funder) {
        funder = newFunder(event.params.funder.toHexString());
        funder.createdAt = event.block.timestamp as BigInt;
        flag = true;
    }
    funder.regularSpent = funder.regularSpent.plus(event.params.amount as BigInt);
    funder.regularCount = funder.regularCount.plus(BigInt.fromI32(1));
    funder.treeCount = funder.treeCount.plus(BigInt.fromI32(1));
    funder.spentDai = funder.spentDai.plus(event.params.amount as BigInt);
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

    updateReferrer(event.params.referrer, event.block.timestamp as BigInt);
}

export function handlePriceUpdated(event: PriceUpdated): void {
    let gb = getGlobalData();
    gb.regularTreePrice = event.params.price as BigInt;
    gb.save();
}


export function handleReferralRewardClaimed(event: ReferralRewardClaimed): void {
    let regularSaleContract = RegularSaleContract.bind(event.address);

    let referrer = Referrer.load(event.params.referrer.toHexString());
    if (referrer) {
        referrer.claimableTreesDai = regularSaleContract.referrerClaimableTreesDai(event.params.referrer);
        referrer.claimableTreesWeth = regularSaleContract.referrerClaimableTreesWeth(event.params.referrer);;
        referrer.referrerCount = regularSaleContract.referrerCount(event.params.referrer);

        referrer.claimedCount = referrer.claimedCount.plus(event.params.count);

        referrer.updatedAt = event.block.timestamp as BigInt;
    
        referrer.save();
    }
}






