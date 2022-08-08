import {
    IRegularSale as RegularSaleContract
} from "../../generated/RegularSale/IRegularSale";
import { BigInt, Address, log } from '@graphprotocol/graph-ts';
import { CONTRACT_REGULAR_SELL_ADDRESS, ZERO_ADDRESS } from "../helpers";
import { Referrer } from "../../generated/schema";


export function updateReferrer(id: Address, timestamp: BigInt): void {
    if (id.equals(Address.fromString(ZERO_ADDRESS))) {
        return;
    }

    let regularSaleContract = RegularSaleContract.bind(Address.fromString(CONTRACT_REGULAR_SELL_ADDRESS));

    let referrer = Referrer.load(id.toHexString());
    if (!referrer) {
        referrer = new Referrer(id.toHexString());
        referrer.createdAt = timestamp as BigInt;
        referrer.claimedCount = BigInt.fromI32(0);
        referrer.referrerCount = BigInt.fromI32(0);
        referrer.claimableTreesWeth = BigInt.fromI32(0);
        referrer.claimableTreesDai = BigInt.fromI32(0);
    }

    let checkreferrerClaimableTreesDai = regularSaleContract.try_referrerClaimableTreesDai(id);
    if (checkreferrerClaimableTreesDai.reverted) {
        log.info('checkreferrerClaimableTreesDai reverted {}', [id.toHexString()])
    }
    else {
        referrer.claimableTreesDai = regularSaleContract.referrerClaimableTreesDai(id);
    }


    let checkreferrerClaimableTreesWeth = regularSaleContract.try_referrerClaimableTreesWeth(id);
    if (checkreferrerClaimableTreesWeth.reverted) {
        log.info('checkreferrerClaimableTreesWeth reverted {}', [id.toHexString()])
    }
    else {
        referrer.claimableTreesWeth = regularSaleContract.referrerClaimableTreesWeth(id);
    }


    let checkreferrerCount = regularSaleContract.try_referrerCount(id);
    if (checkreferrerCount.reverted) {
        log.info('checkreferrerCount reverted {}', [id.toHexString()])
    }
    else {
        referrer.referrerCount = regularSaleContract.referrerCount(id);
    }

    referrer.updatedAt = timestamp as BigInt;

    referrer.save();
}