
import {
    Transfer
} from "../../generated/DAIToken/ERC20";
import { ERC20History, Planter } from "../../generated/schema";
import { BigInt } from '@graphprotocol/graph-ts';
import { COUNTER_ID, getCount_ERC20History, CONTRACT_DAI_TOKEN_ADDRESS } from '../helpers';

export function handleTransfer(event: Transfer): void {
    let erc20History = new ERC20History(getCount_ERC20History(COUNTER_ID).toString());

    let planterFrom = Planter.load(event.params.from.toHex());
    let planterTo = Planter.load(event.params.to.toHex());
    if(!planterFrom && !planterTo) {
        return;
    }

    erc20History.token = CONTRACT_DAI_TOKEN_ADDRESS;
    erc20History.from = event.params.from.toHexString();
    erc20History.to = event.params.to.toHexString();
    erc20History.event = "Transfer";
    erc20History.amount = event.params.value as BigInt;
    erc20History.transactionHash = event.transaction.hash.toHexString();
    erc20History.blockNumber = event.block.number;
    erc20History.createdAt = event.block.timestamp as BigInt;
    erc20History.save();
}




