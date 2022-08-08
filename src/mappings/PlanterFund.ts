import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
    ProjectedEarningUpdated,
    IPlanterFund as PlanterFundContract,
    PlanterTotalClaimedUpdated,
    BalanceWithdrew
} from "../../generated/PlanterFund/IPlanterFund";
import { Planter, PlanterPayment, TotalPlanterFund, TreePlanterFinance, Withdraw } from "../../generated/schema";
import { getCount_planterPayment, COUNTER_ID, getCount_withdraws } from "../helpers";
export function handleProjectedEarningUpdated(event: ProjectedEarningUpdated): void {
    let totalPlanterFund = TotalPlanterFund.load('0');
    if (!totalPlanterFund) totalPlanterFund = new TotalPlanterFund('0');

    let planterFundContract = PlanterFundContract.bind(event.address);
    let obj = planterFundContract.totalBalances();
    totalPlanterFund.planterFund = BigInt.fromString(obj.value0.toString());
    totalPlanterFund.referalFund = BigInt.fromString(obj.value1.toString());
    totalPlanterFund.localDevelopFund = BigInt.fromString(obj.value2.toString());
    totalPlanterFund.totalBalance = (event.params.planterAmount).plus(event.params.ambassadorAmount);
    totalPlanterFund.save();
    let tpf = new TreePlanterFinance(event.params.treeId.toHexString());
    tpf.planterFund = event.params.planterAmount;
    tpf.referalFund = event.params.ambassadorAmount;
    tpf.planterPaid = BigInt.fromI32(0);
    tpf.refferalPaid = BigInt.fromI32(0);
    tpf.createdAt = event.block.timestamp as BigInt;
    tpf.updatedAt = event.block.timestamp as BigInt;
    tpf.save();
}

export function handlePlanterTotalClaimedUpdated(event: PlanterTotalClaimedUpdated): void {
    let planterFundContract = PlanterFundContract.bind(event.address);

    let planter = Planter.load(event.params.planter.toHexString());
    if (!planter) {
        return;
    }
    planter.balance = planterFundContract.balances(Address.fromString(planter.id));
    planter.save();

    let planterPayment = new PlanterPayment(getCount_planterPayment(COUNTER_ID).toHexString());
    planterPayment.tree = event.params.treeId.toHexString();
    planterPayment.planter = event.params.planter.toHexString();
    planterPayment.createdAt = event.block.timestamp as BigInt;
    planterPayment.isRefferal = false;
    planterPayment.amount = event.params.amount as BigInt;
    planterPayment.save();

    let tpf = TreePlanterFinance.load(event.params.treeId.toHexString());
    if (tpf) {
        tpf.planterPaid = planterFundContract.treeToPlanterTotalClaimed(event.params.treeId as BigInt) as BigInt;
        tpf.refferalPaid = (tpf.planterPaid.times(planterFundContract.treeToAmbassadorProjectedEarning(event.params.treeId)))
            .div(planterFundContract.treeToPlanterProjectedEarning(event.params.treeId as BigInt) as BigInt);
        tpf.updatedAt = event.block.timestamp as BigInt;
        tpf.save();
    }


    let totalPlanterFund = TotalPlanterFund.load('0');
    if (!totalPlanterFund) totalPlanterFund = new TotalPlanterFund('0');
    let obj = planterFundContract.totalBalances();
    totalPlanterFund.planterFund = BigInt.fromString(obj.value0.toString());
    totalPlanterFund.referalFund = BigInt.fromString(obj.value1.toString());
    totalPlanterFund.localDevelopFund = BigInt.fromString(obj.value2.toString());
    totalPlanterFund.save();

    if (planter.invitedBy && planter.invitedBy != null) {
        let ref = Planter.load(planter.invitedBy as string);
        if(!ref) {
            return;
        }
        let pp = new PlanterPayment(getCount_planterPayment(COUNTER_ID).toHexString());


        ref.balance = planterFundContract.balances(Address.fromString(ref.id));
        pp.planter = ref.id;
        ref.save();

        pp.createdAt = event.block.timestamp as BigInt;
        if (tpf) {
            pp.amount = tpf.refferalPaid;
        }
        pp.tree = planterPayment.tree;
        pp.isRefferal = true;
        pp.save();
    }
}


export function handleBalanceWithdrew(event: BalanceWithdrew): void {
    let withdraw = new Withdraw(getCount_withdraws(COUNTER_ID).toHexString());
    withdraw.type = "planter";
    withdraw.reason = "";
    withdraw.destAddress = event.params.account.toHexString();
    withdraw.createdAt = event.block.timestamp as BigInt;
    withdraw.amount = event.params.amount as BigInt;
    withdraw.save();

    let tpf = TotalPlanterFund.load('0');
    if (tpf && tpf != null) {
        tpf.totalBalance = tpf.totalBalance.minus(withdraw.amount);
        tpf.save();
    }

    let planter = Planter.load(withdraw.destAddress);
    if (planter) {
        let planterFundContract = PlanterFundContract.bind(event.address);
        planter.balance = planterFundContract.balances(event.params.account);
        planter.save();
    }

}