
import {
    AuctionCreated,
    AuctionEnded,
    AuctionEndTimeIncreased,
    AuctionSettled,
    HighestBidIncreased,
    Auction as AuctionContract,
    Auction__auctionsResult
} from "../../generated/Auction/Auction";
import { Auction, Bid, Funder, Tree } from "../../generated/schema";
import { BigInt } from "@graphprotocol/graph-ts";
import { COUNTER_ID, getCount_bid, ZERO_ADDRESS, addTreeHistory, addAddressHistory } from "../helpers";
import { updateReferrer } from '../helpers/referrer';

/**
     struct Auction {
        uint256 treeId;
        address bidder;
        uint64 startDate;
        uint64 endDate;
        uint256 highestBid;
        uint256 bidInterval;
    }
 */

function setAuctionData(auction: Auction, c_auction: Auction__auctionsResult): void {
    auction.tree = c_auction.value0.toHexString();
    auction.startDate = c_auction.value2 as BigInt;
    auction.endDate = c_auction.value3 as BigInt;
    auction.initialPrice = c_auction.value4 as BigInt;
    auction.priceInterval = c_auction.value5 as BigInt;
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
export function handleAuctionCreated(event: AuctionCreated): void {
    let auction = new Auction(event.params.auctionId.toHexString());
    let auctionContract = AuctionContract.bind(event.address);
    let c_auction = auctionContract.auctions(event.params.auctionId);

    setAuctionData(auction, c_auction);
    auction.isActive = true;
    auction.createdAt = event.block.timestamp as BigInt;
    auction.updatedAt = event.block.timestamp as BigInt;
    auction.save();

    let tree = Tree.load(auction.tree);
    if (tree) {
        tree.saleType = BigInt.fromI32(1);
        tree.updatedAt = event.block.timestamp as BigInt;
        tree.save();
    }

    addTreeHistory(auction.tree,
        'AuctionCreated',
        event.transaction.from.toHexString(),
        event.transaction.hash.toHexString(),
        event.block.number as BigInt,
        event.block.timestamp as BigInt, auction.initialPrice);

}

export function handleHighestBidIncreased(event: HighestBidIncreased): void {
    // let { amount, auctionId, bidder, treeId } = event.params;
    let amount = event.params.amount;
    let auctionId = event.params.auctionId;
    let bidder = event.params.bidder;
    // let treeId = event.params.treeId;
    let bid = new Bid(getCount_bid(COUNTER_ID).toHexString());
    bid.auction = auctionId.toHexString();
    bid.bidder = bidder.toHexString();
    bid.bid = amount as BigInt;
    bid.createdAt = event.block.timestamp as BigInt;
    bid.save();

    let auction = Auction.load(auctionId.toHexString());
    if (auction) {
        auction.highestBid = amount as BigInt;
        auction.updatedAt = event.block.timestamp as BigInt;
        auction.save();

        addTreeHistory(auction.tree,
            'HighestBidIncreased',
            bidder.toHexString(),
            event.transaction.hash.toHexString(),
            event.block.number as BigInt,
            event.block.timestamp as BigInt, amount);

        addAddressHistory(bidder.toHexString(),
            'HighestBidIncreased',
            'auction',
            auctionId.toHexString(),
            event.transaction.from.toHexString(),
            event.transaction.hash.toHexString(),
            event.block.number as BigInt,
            event.block.timestamp as BigInt, amount as BigInt, BigInt.fromI32(0));
    }
}

export function handleAuctionSettled(event: AuctionSettled): void {
    let winner = event.params.winner;
    let treeId = event.params.treeId;
    let auctionId = event.params.auctionId;
    let amount = event.params.amount;
    let auction = Auction.load(auctionId.toHexString());
    if (auction) {
        auction.winner = winner.toHexString();
        auction.highestBid = amount;
        auction.isActive = false;
        auction.updatedAt = event.block.timestamp as BigInt;
        auction.save();

        addTreeHistory(auction.tree,
            'AuctionSettled',
            event.transaction.from.toHexString(),
            event.transaction.hash.toHexString(),
            event.block.number as BigInt,
            event.block.timestamp as BigInt, amount);

        addAddressHistory(event.transaction.from.toHexString(),
            'AuctionSettled',
            'auction',
            auctionId.toHexString(),
            event.transaction.from.toHexString(),
            event.transaction.hash.toHexString(),
            event.block.number as BigInt,
            event.block.timestamp as BigInt, BigInt.fromI32(0), BigInt.fromI32(0));    
    }


    let winnerId: string = winner.toHexString();
    let funder: Funder | null = Funder.load(winnerId);
    if (!funder) funder = newFunder(winner.toHexString());
    funder.treeCount = funder.treeCount.plus(BigInt.fromI32(1));
    funder.spentWeth = funder.spentWeth.plus(amount as BigInt);
    funder.updatedAt = event.block.timestamp as BigInt;
    funder.save();

    addAddressHistory(winnerId,
    'WonAuction',
    'auction',
    auctionId.toHexString(),
    event.transaction.from.toHexString(),
    event.transaction.hash.toHexString(),
    event.block.number as BigInt,
    event.block.timestamp as BigInt, amount as BigInt, BigInt.fromI32(1));


    let tree = Tree.load(treeId.toHexString());
    if (tree) {
        tree.funder = funder.id;
        tree.saleType = BigInt.fromI32(0);
        tree.soldType = BigInt.fromI32(1);
        tree.updatedAt = event.block.timestamp as BigInt;

        tree.save();
    }

    updateReferrer(event.params.referrer, event.block.timestamp as BigInt);

}

export function handleAuctionEnded(event: AuctionEnded): void {
    let tree = Tree.load(event.params.treeId.toHexString());
    let auction = Auction.load(event.params.auctionId.toHexString());

    if (auction) {
        auction.isActive = false;
        auction.updatedAt = event.block.timestamp as BigInt;
        auction.save();

    }

    if (tree) {
        tree.saleType = BigInt.fromI32(0);
        tree.updatedAt = event.block.timestamp as BigInt;
        tree.save();
    }

    addTreeHistory(event.params.treeId.toHexString(),
        'AuctionEnded',
        event.transaction.from.toHexString(),
        event.transaction.hash.toHexString(),
        event.block.number as BigInt,
        event.block.timestamp as BigInt, new BigInt(0));


    addAddressHistory(event.transaction.from.toHexString(),
        'AuctionEnded',
        'auction',
        event.params.auctionId.toHexString(),
        event.transaction.from.toHexString(),
        event.transaction.hash.toHexString(),
        event.block.number as BigInt,
        event.block.timestamp as BigInt, BigInt.fromI32(0), BigInt.fromI32(0)); 
}

export function handleAuctionEndTimeIncreased(event: AuctionEndTimeIncreased): void {
    let auction = Auction.load(event.params.auctionId.toHexString());
    if (auction) {
        auction.endDate = event.params.newAuctionEndTime as BigInt;
        auction.updatedAt = event.block.timestamp as BigInt;
        auction.save();
    }

}

