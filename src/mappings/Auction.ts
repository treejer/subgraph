import { HighestBidIncreased } from "../../generated/Auction/TreeAuction";
export function handleHighestBidIncreased(event: HighestBidIncreased): void {
    let { amount, auctionId, bidder, treeId } = event.params;
}