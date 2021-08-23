import { RegularMint, RegularSell as RegularSellContract, RegularTreeRequsted, RegularTreeRequstedById } from "../../generated/RegularSell/RegularSell";
import { BatchRegularTreeRequest, IncrementalSell, Owner, Tree } from "../../generated/schema";
import { Address, BigInt, log } from '@graphprotocol/graph-ts';
import { COUNTER_ID, getCount_batchRegularTreeRequest, getCount_updateSpec, INCREMENTAL_SELL_ID, ZERO_ADDRESS } from '../helpers';



export function handleRegularTreeRequsted(event: RegularTreeRequsted): void {
    let brgtr = new BatchRegularTreeRequest(getCount_batchRegularTreeRequest(COUNTER_ID).toHexString());
    brgtr.count = event.params.count as BigInt;
    brgtr.buyer = event.params.buyer.toHexString();
    brgtr.amount = event.params.amount as BigInt;
    brgtr.save();
    let owner = Owner.load(brgtr.buyer);
    if (!owner) owner = newOwner(brgtr.buyer);
    owner.lastRequestId = brgtr.id;
    owner.spentDai = owner.spentDai.plus(event.params.amount as BigInt);
    // owner.spentWeth = owner.spentWeth.plus(event.params.amount as BigInt); // DAI to WETH ???
    owner.treeCount = owner.treeCount.plus(BigInt.fromI32(1));
    owner.save();
}

export function handleRegularMint(event: RegularMint): void {
    let owner = Owner.load(event.params.buyer.toHexString());
    if (!owner) owner = newOwner(event.params.buyer.toHexString());
    let tree = Tree.load(event.params.treeId.toHexString());
    tree.owner = owner.id;
    tree.requestId = owner.lastRequestId;
    tree.save();
}
function newOwner(id: string): Owner {
    let owner = new Owner(id);
    owner.treeCount = BigInt.fromI32(0);
    owner.spentWeth = BigInt.fromI32(0);
    owner.spentDai = BigInt.fromI32(0);
    return owner;
}

export function handleRegularTreeRequstedById(event: RegularTreeRequstedById): void {
    let owner = Owner.load(event.params.buyer.toHexString());
    if (!owner) owner = newOwner(event.params.buyer.toHexString());
    owner.spentDai = owner.spentDai.plus(event.params.amount as BigInt);
    // owner.spentWeth = owner.spentWeth.plus(event.params.amount as BigInt); // DAI to WETH ???
    owner.treeCount = owner.treeCount.plus(BigInt.fromI32(1));
    let tree = Tree.load(event.params.treeId.toHexString());
    tree.owner = owner.id;
    tree.save();
    owner.save();
}