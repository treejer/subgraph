import {
    HonoraryTree as HonoraryTreeContract,
    TreeRangeSet,
    RecipientAdded,
    RecipientUpdated,
    Claimed,
    ClaimFailed,
    HonoraryTree__recipientsResult
} from "../../generated/HonoraryTree/HonoraryTree";
import { Tree, HonoraryTree, HonoraryTreeRecipient } from "../../generated/schema";
import { BigInt } from '@graphprotocol/graph-ts';
import { addTreeHistory } from '../helpers';


function setRecipientFields(recipient: HonoraryTreeRecipient, recipientRes: HonoraryTree__recipientsResult): void {
    recipient.expiryDate = recipientRes.value0 as BigInt;
    recipient.startDate = recipientRes.value1 as BigInt;
    recipient.status = recipientRes.value2 as BigInt;
}

export function handleTreeRangeSet(event: TreeRangeSet): void {

    let hTreeContract = HonoraryTreeContract.bind(event.address);

    let startTreeId = hTreeContract.currentTreeId();
    let endTreeId = hTreeContract.upTo();

    let blockTimestamp = event.block.timestamp as BigInt;

    for (let i = parseInt(startTreeId.toString()); i < parseInt(endTreeId.toString()); i++) {

        let treeId = BigInt.fromString(i.toString().split(".")[0]).toHexString();


        let tree = Tree.load(treeId);
        if (!tree) {
            tree = new Tree(treeId);
            tree.createdAt = event.block.timestamp as BigInt;
            tree.updatedAt = event.block.timestamp as BigInt;
            tree.saleType = BigInt.fromI32(5);
            tree.save();


            addTreeHistory(treeId,
                'HonoraryTreeRangeSet',
                event.transaction.from.toHexString(),
                event.transaction.hash.toHexString(),
                event.block.number as BigInt,
                event.block.timestamp as BigInt, new BigInt(0));
        } else {

            if (tree.saleType.notEqual(BigInt.fromI32(5))) {
                tree.updatedAt = event.block.timestamp as BigInt;
                tree.saleType = BigInt.fromI32(5);
                tree.save();

                addTreeHistory(treeId,
                    'HonoraryTreeRangeSet',
                    event.transaction.from.toHexString(),
                    event.transaction.hash.toHexString(),
                    event.block.number as BigInt,
                    event.block.timestamp as BigInt, new BigInt(0));

            }

        }

        blockTimestamp = blockTimestamp.plus(BigInt.fromI32(1));

        let honoraryTree = HonoraryTree.load(treeId);
        if (!honoraryTree) {
            honoraryTree = new HonoraryTree(treeId);
            honoraryTree.tree = treeId;

            honoraryTree.claimed = false;
            honoraryTree.createdAt = blockTimestamp;
            honoraryTree.updatedAt = blockTimestamp;
            honoraryTree.save();
        } else {
            honoraryTree.updatedAt = blockTimestamp;
            honoraryTree.save();
        }

    }

}

export function handleRecipientAdded(event: RecipientAdded): void {

    let hTreeContract = HonoraryTreeContract.bind(event.address);

    let c_recipient = hTreeContract.recipients(event.params.recipient);

    let recipient = new HonoraryTreeRecipient(event.params.recipient.toHexString());
    setRecipientFields(recipient, c_recipient);
    recipient.createdAt = event.block.timestamp as BigInt;
    recipient.updatedAt = event.block.timestamp as BigInt;
    recipient.claimedFailed = false;
    recipient.save();
}

export function handleRecipientUpdated(event: RecipientUpdated): void {

    let hTreeContract = HonoraryTreeContract.bind(event.address);

    let recipient = HonoraryTreeRecipient.load(event.params.recipient.toHexString());
    if(recipient) {
        let c_recipient = hTreeContract.recipients(event.params.recipient);

        setRecipientFields(recipient, c_recipient);
        recipient.updatedAt = event.block.timestamp as BigInt;
        recipient.save();
    }
}

export function handleClaimed(event: Claimed): void {

    let treeId = event.params.treeId.toHexString();

    let honoraryTree = HonoraryTree.load(treeId);
    if (honoraryTree) {
        honoraryTree.recipient = event.transaction.from.toHexString();
        honoraryTree.claimed = true;
        honoraryTree.updatedAt = event.block.timestamp as BigInt;
        honoraryTree.save();
    }

    let tree = Tree.load(treeId);
    if (!tree) {
        tree = new Tree(treeId);
        tree.createdAt = event.block.timestamp as BigInt;
    }
    tree.updatedAt = event.block.timestamp as BigInt;
    tree.soldType = BigInt.fromI32(5);
    tree.saleType = BigInt.fromI32(0);
    tree.save();



    addTreeHistory(event.params.treeId.toHexString(),
        'HonoraryClaimed',
        event.transaction.from.toHexString(),
        event.transaction.hash.toHexString(),
        event.block.number as BigInt,
        event.block.timestamp as BigInt, new BigInt(0));
}

export function handleClaimFailed(event: ClaimFailed): void {
    let recipient = HonoraryTreeRecipient.load(event.params.recipient.toHexString());
    if (recipient) {
        recipient.claimedFailed = true;
        recipient.updatedAt = event.block.timestamp as BigInt;
        recipient.save();
    }
}