import {
    LocalDevelopmentBalanceWithdrew,
    InsuranceBalanceWithdrew,
    TreasuryBalanceWithdrew,
    ResearchBalanceWithdrew,
    WethFund as WethFundcontract,
    TreeFunded
} from "../../generated/WethFund/WethFund";
import { Planter, PlanterPayment, TotalFund, TreeFund, Withdraw } from "../../generated/schema";
import { Address, BigInt, log, store } from '@graphprotocol/graph-ts';
import { COUNTER_ID, getCount_treeFund, getCount_withdraws } from '../helpers';
import { Allocation as AllocationContract } from "../../generated/WethFund/Allocation";

function getTotalFund(): TotalFund | null {
    let totalFunds = TotalFund.load("weth");
    if (totalFunds == null) {
        totalFunds = new TotalFund('weth');
        totalFunds.localDevelopment = new BigInt(0);
        totalFunds.totalBalance = new BigInt(0);
        totalFunds.planter = new BigInt(0);
        totalFunds.referral = new BigInt(0);
        totalFunds.research = new BigInt(0);
        totalFunds.insurance = new BigInt(0);
        totalFunds.treasury = new BigInt(0);
        totalFunds.reserve1 = new BigInt(0);
        totalFunds.reserve2 = new BigInt(0);
    }
    return totalFunds;
}

export function handleResearchBalanceWithdrew(event: ResearchBalanceWithdrew): void {
    let withdraw = new Withdraw(getCount_withdraws(COUNTER_ID).toHexString());
    withdraw.type = "treeReseach";
    withdraw.amount = event.params.amount as BigInt;
    withdraw.createdAt = event.block.timestamp as BigInt;
    withdraw.destAddress = event.params.account.toHexString();
    withdraw.reason = event.params.reason;
    withdraw.save();

    let wfc = WethFundcontract.bind(event.address);

    let totalFunds = getTotalFund();
    if (totalFunds) {
        totalFunds.totalBalance = totalFunds.totalBalance.minus(withdraw.amount);
        totalFunds.research = wfc.totalBalances().value0 as BigInt;
        totalFunds.save();
    }
}

export function handleLocalDevelopmentBalanceWithdrew(event: LocalDevelopmentBalanceWithdrew): void {
    let withdraw = new Withdraw(getCount_withdraws(COUNTER_ID).toHexString());
    withdraw.type = "localDevelopment";
    withdraw.amount = event.params.amount as BigInt;
    withdraw.createdAt = event.block.timestamp as BigInt;
    withdraw.destAddress = event.params.account.toHexString();
    withdraw.reason = event.params.reason;
    withdraw.save();
    let totalFunds = getTotalFund();
    if (totalFunds) {
        totalFunds.totalBalance = totalFunds.totalBalance.minus(withdraw.amount);
        let wfc = WethFundcontract.bind(event.address);
        totalFunds.localDevelopment = wfc.totalBalances().value1 as BigInt;
        totalFunds.save();
    }
}

export function handleInsuranceBalanceWithdrew(event: InsuranceBalanceWithdrew): void {
    let withdraw = new Withdraw(getCount_withdraws(COUNTER_ID).toHexString());
    withdraw.type = "rescue";
    withdraw.amount = event.params.amount as BigInt;
    withdraw.createdAt = event.block.timestamp as BigInt;
    withdraw.destAddress = event.params.account.toHexString();
    withdraw.reason = event.params.reason;
    withdraw.save();
    let totalFunds = getTotalFund();
    if (totalFunds) {
        totalFunds.totalBalance = totalFunds.totalBalance.minus(withdraw.amount);
        let wfc = WethFundcontract.bind(event.address);
        totalFunds.insurance = wfc.totalBalances().value2 as BigInt;
        totalFunds.save();
    }
}

export function handleTreasuryBalanceWithdrew(event: TreasuryBalanceWithdrew): void {
    let withdraw = new Withdraw(getCount_withdraws(COUNTER_ID).toHexString());
    withdraw.type = "treasury";
    withdraw.amount = event.params.amount as BigInt;
    withdraw.createdAt = event.block.timestamp as BigInt;
    withdraw.destAddress = event.params.account.toHexString();
    withdraw.reason = event.params.reason;
    withdraw.save();
    let totalFunds = getTotalFund();
    if (totalFunds) {
        totalFunds.totalBalance = totalFunds.totalBalance.minus(withdraw.amount);
        let wfc = WethFundcontract.bind(event.address);
        totalFunds.treasury = wfc.totalBalances().value3 as BigInt;
        totalFunds.save();
    }
}



export function handleTreeFunded(event: TreeFunded): void {
    let fmc = AllocationContract.bind(Address.fromString('0xd5784E9F70D4C81B800491B799f6c33AF984caD7'));
    // let modelId = fmc.getFindDistributionModelId(event.params.treeId);
    let treeFunds = new TreeFund(getCount_treeFund(COUNTER_ID).toHexString());
    treeFunds.tree = event.params.treeId.toHexString();
    // treeFunds.allocation = modelId.toHexString();
    treeFunds.amount = event.params.amount as BigInt;
    treeFunds.createdAt = event.block.timestamp as BigInt;
    treeFunds.save();

    let dfc = WethFundcontract.bind(event.address);
    let tfc = dfc.totalBalances();
    let totalFunds = getTotalFund();
    if (totalFunds) {
        totalFunds.totalBalance = totalFunds.totalBalance.plus(treeFunds.amount.minus(event.params.planterPart as BigInt));
        totalFunds.research = tfc.value0 as BigInt;
        totalFunds.localDevelopment = tfc.value1 as BigInt;
        totalFunds.insurance = tfc.value2 as BigInt;
        totalFunds.treasury = tfc.value3 as BigInt;
        totalFunds.reserve1 = tfc.value4 as BigInt;
        totalFunds.reserve2 = tfc.value5 as BigInt;
        totalFunds.save();
    }
}