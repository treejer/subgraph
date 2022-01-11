import {
    IRegularSale as RegularSaleContract
} from "../../generated/RegularSale/IRegularSale";
import { BigInt, Address } from '@graphprotocol/graph-ts';
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
    }

    referrer.claimableTreesDai = regularSaleContract.referrerClaimableTreesDai(id);
    referrer.claimableTreesWeth = regularSaleContract.referrerClaimableTreesWeth(id);;
    referrer.referrerCount = regularSaleContract.referrerCount(id);
    referrer.updatedAt = timestamp as BigInt;

    referrer.save();
}