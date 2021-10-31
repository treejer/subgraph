import {
    RegularSale as RegularSaleContract
} from "../../generated/RegularSale/RegularSale";
import { BigInt, Address } from '@graphprotocol/graph-ts';
import { REGULAR_SALE_CONTRACT_ADDRESS, ZERO_ADDRESS } from "../helpers";
import { Referrer } from "../../generated/schema";


export function updateReferrer(id: Address, timestamp: BigInt): void {
    if (id.equals(Address.fromString(ZERO_ADDRESS))) {
        return;
    }

    let regularSaleContract = RegularSaleContract.bind(Address.fromString(REGULAR_SALE_CONTRACT_ADDRESS));

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