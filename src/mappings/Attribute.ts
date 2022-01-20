import { IAttribute as AttributeContract, AttributeGenerated, AttributeGenerationFailed } from "../../generated/Attribute/IAttribute";
import { ITree as TreeContract, ITree__attributesResult, ITree__symbolsResult } from "../../generated/Tree/ITree";
import { Tree, Attribute, Symbol, TreeWithAttributeProblem } from "../../generated/schema";
import { Address, BigInt } from '@graphprotocol/graph-ts';
import { CONTRACT_TREE_ADDRESS } from '../helpers';


function setAttributeFields(attribute: Attribute, attributesRes: ITree__attributesResult): void {
    attribute.attribute1 = BigInt.fromI32(attributesRes.value0) as BigInt;
    attribute.attribute2 = BigInt.fromI32(attributesRes.value1) as BigInt;
    attribute.attribute3 = BigInt.fromI32(attributesRes.value2) as BigInt;
    attribute.attribute4 = BigInt.fromI32(attributesRes.value3) as BigInt;
    attribute.attribute5 = BigInt.fromI32(attributesRes.value4) as BigInt;
    attribute.attribute6 = BigInt.fromI32(attributesRes.value5) as BigInt;
    attribute.attribute7 = BigInt.fromI32(attributesRes.value6) as BigInt;
    attribute.attribute8 = BigInt.fromI32(attributesRes.value7) as BigInt;
    attribute.generationType = BigInt.fromI32(attributesRes.value8) as BigInt;
}

function setSymbolFields(symbol: Symbol, symbolRes: ITree__symbolsResult): void {
    symbol.shape = BigInt.fromI32(symbolRes.value0) as BigInt;
    symbol.trunkColor = BigInt.fromI32(symbolRes.value1) as BigInt;
    symbol.crownColor = BigInt.fromI32(symbolRes.value2) as BigInt;
    symbol.coefficient = BigInt.fromI32(symbolRes.value3) as BigInt;
    symbol.generationType = BigInt.fromI32(symbolRes.value4) as BigInt;
}

export function handleAttributeGenerated(event: AttributeGenerated): void {

    let treeContract = TreeContract.bind(Address.fromString(CONTRACT_TREE_ADDRESS));


    let attributesRes = treeContract.attributes(event.params.treeId);
    if (BigInt.fromI32(attributesRes.value8).gt(new BigInt(0))) {
        let attribute = new Attribute(event.params.treeId.toHexString());
        setAttributeFields(attribute, attributesRes);
        attribute.tree = event.params.treeId.toHexString();
        attribute.createdAt = event.block.timestamp as BigInt;
        attribute.save();
    }



    let symbolRes = treeContract.symbols(event.params.treeId);
    if (BigInt.fromI32(symbolRes.value4).gt(new BigInt(0))) {
        let symbol = new Symbol(event.params.treeId.toHexString());

        setSymbolFields(symbol, symbolRes);
        symbol.tree = event.params.treeId.toHexString();
        symbol.createdAt = event.block.timestamp as BigInt;
        symbol.save();
    }


    let tree = Tree.load(event.params.treeId.toHexString());
    if (tree) {
        tree.attribute = event.params.treeId.toHexString();
        tree.symbol = event.params.treeId.toHexString();
        tree.updatedAt = event.block.timestamp as BigInt;
        tree.save();
    }

}

export function handleAttributeGenerationFailed(event: AttributeGenerationFailed): void {
    let treeAttrProblem = new TreeWithAttributeProblem(event.params.treeId.toHexString());
    treeAttrProblem.tree = event.params.treeId.toHexString();
    treeAttrProblem.createdAt = event.block.timestamp as BigInt;
    treeAttrProblem.save();
}