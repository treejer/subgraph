import { LocalDevelopBalanceWithdrawn, RescueBalanceWithdrawn, TreeFunded, TreejerDevelopBalanceWithdrawn, TreeResearchBalanceWithdrawn, DaiFunds as DFcontract } from "../../generated/DaiFunds/DaiFunds";
import { FinancialModel as FMcontract } from "../../generated/DaiFunds/FinancialModel";
import { AssignedFundDistribution, Counter, DistributionModelError, FundDistribution, Planter, PlanterPayment, TotalFund, TreeFund, Withdraw } from "../../generated/schema";
import { Address, BigInt, log, store } from '@graphprotocol/graph-ts';
import { COUNTER_ID, getCount_batchRegularTreeRequest, getCount_dme, getCount_planterPayment, getCount_treeFund, getCount_updateSpec, getCount_withdraws, INCREMENTAL_SELL_ID, ZERO_ADDRESS } from '../helpers';
// import {  } from "../../generated/FinancialModel/FinancialModel";

function getTotalFund(): TotalFund | null {
    let totalFunds = TotalFund.load("dai");
    if (totalFunds == null) {
        totalFunds = new TotalFund('dai');
        totalFunds.localDevelop = new BigInt(0);
        totalFunds.totalBalance = new BigInt(0);
        totalFunds.planterFund = new BigInt(0);
        totalFunds.referralFund = new BigInt(0);
        totalFunds.treeResearch = new BigInt(0);
        totalFunds.rescueFund = new BigInt(0);
        totalFunds.treejerDevelop = new BigInt(0);
        totalFunds.reserveFund1 = new BigInt(0);
        totalFunds.reserveFund2 = new BigInt(0);
    }
    return totalFunds;
}

export function handleTreeResearchBalanceWithdrawn(event: TreeResearchBalanceWithdrawn): void {
    let withdraw = new Withdraw(getCount_withdraws(COUNTER_ID).toHexString());
    withdraw.type = "treeReseach";
    withdraw.amount = event.params.amount as BigInt;
    withdraw.date = event.block.timestamp as BigInt;
    withdraw.destAddress = event.params.account.toHexString();
    withdraw.reason = event.params.reason;
    withdraw.save();

    let dfc = DFcontract.bind(event.address);

    let totalFunds = getTotalFund();

    totalFunds.totalBalance = totalFunds.totalBalance.minus(withdraw.amount);
    totalFunds.treeResearch = dfc.totalFunds().value0 as BigInt;
    totalFunds.save();
}

export function handleLocalDevelopBalanceWithdrawn(event: LocalDevelopBalanceWithdrawn): void {
    let withdraw = new Withdraw(getCount_withdraws(COUNTER_ID).toHexString());
    withdraw.type = "localDevelop";
    withdraw.amount = event.params.amount as BigInt;
    withdraw.date = event.block.timestamp as BigInt;
    withdraw.destAddress = event.params.account.toHexString();
    withdraw.reason = event.params.reason;
    withdraw.save();
    let totalFunds = getTotalFund();
    totalFunds.totalBalance = totalFunds.totalBalance.minus(withdraw.amount);
    let dfc = DFcontract.bind(event.address);
    totalFunds.localDevelop = dfc.totalFunds().value1 as BigInt;
    totalFunds.save();
}

export function handleRescueBalanceWithdrawn(event: RescueBalanceWithdrawn): void {
    let withdraw = new Withdraw(getCount_withdraws(COUNTER_ID).toHexString());
    withdraw.type = "rescue";
    withdraw.amount = event.params.amount as BigInt;
    withdraw.date = event.block.timestamp as BigInt;
    withdraw.destAddress = event.params.account.toHexString();
    withdraw.reason = event.params.reason;
    withdraw.save();
    let totalFunds = getTotalFund();
    totalFunds.totalBalance = totalFunds.totalBalance.minus(withdraw.amount);
    let dfc = DFcontract.bind(event.address);
    totalFunds.rescueFund = dfc.totalFunds().value2 as BigInt;
    totalFunds.save();
}

export function handleTreejerDevelopBalanceWithdrawn(event: TreejerDevelopBalanceWithdrawn): void {
    let withdraw = new Withdraw(getCount_withdraws(COUNTER_ID).toHexString());
    withdraw.type = "treejerDevelop";
    withdraw.amount = event.params.amount as BigInt;
    withdraw.date = event.block.timestamp as BigInt;
    withdraw.destAddress = event.params.account.toHexString();
    withdraw.reason = event.params.reason;
    withdraw.save();
    let totalFunds = getTotalFund();
    totalFunds.totalBalance = totalFunds.totalBalance.minus(withdraw.amount);
    let dfc = DFcontract.bind(event.address);
    totalFunds.treejerDevelop = dfc.totalFunds().value3 as BigInt;
    totalFunds.save();
}


export function handleTreeFunded(event: TreeFunded): void {
    let fmc = FMcontract.bind(Address.fromString('0xd5784E9F70D4C81B800491B799f6c33AF984caD7'));
    let modelId = fmc.getFindDistributionModelId(event.params.treeId);
    let treeFunds = new TreeFund(getCount_treeFund(COUNTER_ID).toHexString());
    treeFunds.tree = event.params.treeId.toHexString();
    treeFunds.distributionModel = modelId.toHexString();
    treeFunds.amount = event.params.amount as BigInt;
    treeFunds.date = event.block.timestamp as BigInt;
    treeFunds.save();

    let dfc = DFcontract.bind(event.address);
    let tfc = dfc.totalFunds();
    let totalFunds = getTotalFund();
    totalFunds.totalBalance = totalFunds.totalBalance.plus(treeFunds.amount.minus(event.params.planterPart as BigInt));
    totalFunds.treeResearch = tfc.value0 as BigInt;
    totalFunds.localDevelop = tfc.value1 as BigInt;
    totalFunds.rescueFund = tfc.value2 as BigInt;
    totalFunds.treejerDevelop = tfc.value3 as BigInt;
    totalFunds.reserveFund1 = tfc.value4 as BigInt;
    totalFunds.reserveFund2 = tfc.value5 as BigInt;
    totalFunds.save();
}