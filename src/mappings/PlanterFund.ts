import { Address, BigInt } from "@graphprotocol/graph-ts";
import { PlanterFundSet, PlanterFund as PFC, PlanterFunded } from "../../generated/PlanterFund/PlanterFund";
import { Planter, PlanterPayment, TotalPlanterFund, TreePlanterFinance } from "../../generated/schema";
import { getCount_planterPayment, COUNTER_ID } from "../helpers";
export function handlePlanterFundSet(event: PlanterFundSet): void {
    let totalPlanterFund = TotalPlanterFund.load('0');
    if (!totalPlanterFund) totalPlanterFund = new TotalPlanterFund('0');

    let planterFundContract = PFC.bind(event.address);
    let obj = planterFundContract.totalFunds();
    totalPlanterFund.planterFund = BigInt.fromString(obj.value0.toString());
    totalPlanterFund.referalFund = BigInt.fromString(obj.value1.toString());
    totalPlanterFund.localDevelopFund = BigInt.fromString(obj.value2.toString());
    totalPlanterFund.totalBalance = (event.params.planterAmount).plus(event.params.referralAmount);
    totalPlanterFund.save();
    let tpf = new TreePlanterFinance(event.params.treeId.toHexString());
    tpf.planterFund = event.params.planterAmount;
    tpf.referalFund = event.params.referralAmount;
    tpf.planterPaid = BigInt.fromI32(0);
    tpf.refferalPaid = BigInt.fromI32(0);
    tpf.save();
}

export function handlePlanterFunded(event: PlanterFunded): void {
    let planterFundContract = PFC.bind(event.address);

    let planter = Planter.load(event.params.planterId.toHexString());
    planter.balance = planterFundContract.balances(Address.fromHexString(planter.id) as Address);
    planter.save();

    let planterPayment = new PlanterPayment(getCount_planterPayment(COUNTER_ID).toHexString());
    planterPayment.tree = event.params.treeId.toHexString();
    planterPayment.planter = event.params.planterId.toHexString();
    planterPayment.date = event.block.timestamp as BigInt;
    planterPayment.isRefferal = false;
    planterPayment.amount = event.params.amount as BigInt;
    planterPayment.save();

    let tpf = TreePlanterFinance.load(event.params.treeId.toHexString());
    tpf.planterPaid = planterFundContract.plantersPaid(event.params.treeId as BigInt) as BigInt;
    tpf.refferalPaid = (tpf.planterPaid.times(planterFundContract.referralFunds(event.params.treeId))).div(planterFundContract.planterFunds(event.params.treeId as BigInt) as BigInt);
    tpf.save();

    let totalPlanterFund = TotalPlanterFund.load('0');
    if (!totalPlanterFund) totalPlanterFund = new TotalPlanterFund('0');
    let obj = planterFundContract.totalFunds();
    totalPlanterFund.planterFund = BigInt.fromString(obj.value0.toString());
    totalPlanterFund.referalFund = BigInt.fromString(obj.value1.toString());
    totalPlanterFund.localDevelopFund = BigInt.fromString(obj.value2.toString());
    totalPlanterFund.save();

    if (planter.refferedBy) {
        let ref = Planter.load(planter.refferedBy);
        ref.balance = planterFundContract.balances(Address.fromHexString(ref.id) as Address);
        let pp = new PlanterPayment(getCount_planterPayment(COUNTER_ID).toHexString());
        pp.date = event.block.timestamp;
        pp.amount = tpf.refferalPaid;
        pp.tree = planterPayment.tree;
        pp.planter = ref.id;
        pp.isRefferal = true;
        ref.save();
        pp.save();
    }
}