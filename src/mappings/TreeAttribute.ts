import { BuyerRankSet, TreeAttribute as TreeAttributeContract, TreeAttributesGenerated, TreeAttributesNotGenerated } from "../../generated/TreeAttribute/TreeAttribute";
import { Owner, TreeAttribute, Tree, TreeWithAttributeProblem } from "../../generated/schema";
import { Address, BigInt, log } from '@graphprotocol/graph-ts';
import { COUNTER_ID, getCount_updateSpec, ZERO_ADDRESS } from '../helpers';


export function handleBuyerRankSet(event: BuyerRankSet): void {
    let owner = Owner.load(event.params.buyer.toHexString());
    owner.rank = BigInt.fromI32(event.params.rank);
    owner.save();
}


export function handleTreeAttributesGenerated(event: TreeAttributesGenerated): void {
    let tree = Tree.load(event.params.treeId.toHexString());
    let treeAttributeContract = TreeAttributeContract.bind(event.address);
    tree.treeAttribute = treeAttributeContract.treeAttributes(BigInt.fromString(tree.id)).value6.toHexString(); // universalCode
    tree.save();
    let treeAttribute = new TreeAttribute(tree.treeAttribute);
    treeAttribute.buyerRank = treeAttributeContract.rankOf(Address.fromString(tree.planter)) as BigInt;
    treeAttribute.save();
}

export function handleTreeAttributesNotGenerated(event: TreeAttributesNotGenerated): void {
    let treeAttrProblem = new TreeWithAttributeProblem(event.params.treeId.toHexString());
    treeAttrProblem.tree = treeAttrProblem.id;
    treeAttrProblem.save();
}