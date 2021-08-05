import { AuctionCreated, AuctionCreated__Params, AuctionSettled, HighestBidIncreased, TreeAuction as AuctionContract, TreeAuction__auctionsResult } from "../../generated/Auction/TreeAuction";
import { Auction, Bid, Tree } from "../../generated/schema";
import { BigInt } from "@graphprotocol/graph-ts";
import { COUNTER_ID, getCount_bid } from "../helpers";

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

function setAuctionData(auction: Auction, c_auction: TreeAuction__auctionsResult): void {
    auction.treeId = c_auction.value0.toHexString();
    auction.startDate = c_auction.value2 as BigInt;
    auction.expireDate = c_auction.value3 as BigInt;
    auction.initialPrice = c_auction.value4 as BigInt;
    auction.priceInterval = c_auction.value5 as BigInt;
}
export function handleAuctionCreated(event: AuctionCreated): void {
    let auction = new Auction(event.params.auctionId.toHexString());
    let auctionContract = AuctionContract.bind(event.address);
    let c_auction = auctionContract.auctions(event.params.auctionId);
    setAuctionData(auction, c_auction);
    auction.isActive = true;
    auction.save();
    let tree = Tree.load(auction.treeId);
    tree.provideStatus = BigInt.fromI32(1);;
    tree.save();
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
    bid.date = event.block.timestamp as BigInt;
    bid.save();
}

export function handleAuctionSettled(event: AuctionSettled): void {

}
