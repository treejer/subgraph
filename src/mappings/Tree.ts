
import {
    ITree as TreeContract,
    Transfer
} from "../../generated/Tree/ITree";
import { Tree, Owner } from "../../generated/schema";
import { Address, BigInt } from '@graphprotocol/graph-ts';
import { getGlobalData, ZERO_ADDRESS } from '../helpers';

export function handleTransfer(event: Transfer): void {

    let tree = Tree.load(event.params.tokenId.toHexString());
    if (!tree) {
        tree = new Tree(event.params.tokenId.toHexString());
        tree.createdAt = event.block.timestamp as BigInt;
    }
    tree.updatedAt = event.block.timestamp as BigInt;
    tree.owner = event.params.to.toHexString();
    tree.save();

    let ownerTo = Owner.load(event.params.to.toHexString());
    if (!ownerTo) {
        ownerTo = new Owner(event.params.to.toHexString());
        ownerTo.createdAt = event.block.timestamp as BigInt;
    }
    ownerTo.treeCount = ownerTo.treeCount.plus(BigInt.fromI32(1));

    //@todo fix this and make it dynamic
    if (event.params.tokenId.ge(BigInt.fromI32(10000))) {
        ownerTo.regularTreeCount = ownerTo.regularTreeCount.plus(BigInt.fromI32(1));
    } else {
        ownerTo.genesisTreeCount = ownerTo.genesisTreeCount.plus(BigInt.fromI32(1));
    }

    ownerTo.updatedAt = event.block.timestamp as BigInt;
    ownerTo.save();

    if (event.params.from.notEqual(Address.fromString(ZERO_ADDRESS))) {
        let ownerFrom = Owner.load(event.params.from.toHexString());
        if (!ownerFrom) {
            ownerFrom = new Owner(event.params.from.toHexString());
            ownerFrom.createdAt = event.block.timestamp as BigInt;
        }

        ownerFrom.treeCount = ownerFrom.treeCount.minus(BigInt.fromI32(1));

        //@todo fix this and make it dynamic
        if (event.params.tokenId.ge(BigInt.fromI32(10000))) {
            ownerFrom.regularTreeCount = ownerFrom.regularTreeCount.minus(BigInt.fromI32(1));
        } else {
            ownerFrom.genesisTreeCount = ownerFrom.genesisTreeCount.minus(BigInt.fromI32(1));
        }

        ownerFrom.updatedAt = event.block.timestamp as BigInt;
        ownerFrom.save();
    }

    let gb = getGlobalData();
    if (event.params.to.notEqual(Address.fromString(ZERO_ADDRESS))) {
        gb.ownedTreeCount = gb.ownedTreeCount.plus(BigInt.fromI32(1));
    } else {
        gb.ownedTreeCount = gb.ownedTreeCount.minus(BigInt.fromI32(1));
    }
    gb.save();

}




