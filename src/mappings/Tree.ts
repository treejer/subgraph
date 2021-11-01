
import {
    Tree as TreeContract,
    Transfer
} from "../../generated/Tree/Tree";
import { Tree, Owner } from "../../generated/schema";
import { Address, BigInt } from '@graphprotocol/graph-ts';
import { getGlobalData, ZERO_ADDRESS } from '../helpers';


export function handleTransfer(event: Transfer): void {

    let treeContract = TreeContract.bind(event.address);

    let tree = Tree.load(event.params.tokenId.toHexString());
    if (!tree) {
        tree = new Tree(event.params.tokenId.toHexString());
        tree.createdAt = event.block.timestamp as BigInt;
    }
    tree.updatedAt = event.block.timestamp as BigInt;
    tree.owner = event.params.to.toHexString();
    tree.save();

    if(event.params.to.notEqual(Address.fromString(ZERO_ADDRESS))) {
        let ownerTo = Owner.load(event.params.to.toHexString());
        if (!ownerTo) {
            ownerTo = new Owner(event.params.to.toHexString());
            ownerTo.createdAt = event.block.timestamp as BigInt;
        }
        ownerTo.treeCount = treeContract.balanceOf(event.params.to);
        ownerTo.updatedAt = event.block.timestamp as BigInt;
        ownerTo.save();
    }
    
    if(event.params.from.notEqual(Address.fromString(ZERO_ADDRESS))) {
        let ownerFrom = Owner.load(event.params.from.toHexString());
        if (!ownerFrom) {
            ownerFrom = new Owner(event.params.from.toHexString());
            ownerFrom.createdAt = event.block.timestamp as BigInt;
        }
        ownerFrom.treeCount = treeContract.balanceOf(event.params.from);
        ownerFrom.updatedAt = event.block.timestamp as BigInt;
        ownerFrom.save();
    }


    if(event.params.to.notEqual(Address.fromString(ZERO_ADDRESS))) {
        let gb = getGlobalData();
        gb.ownedTreeCount = gb.ownedTreeCount.plus(BigInt.fromI32(1));
        gb.save();
    }
}




