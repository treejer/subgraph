import { DistributionModelAdded, DistributionModelOfTreeNotExist, FundDistributionModelAssigned, LocalDevelopBalanceWithdrawn, OtherBalanceWithdrawn1, OtherBalanceWithdrawn2, PlanterBalanceWithdrawn, PlanterFunded, RescueBalanceWithdrawn, Treasury as TreasuryContract, Treasury__fundDistributionsResult, TreeFunded, TreejerDevelopBalanceWithdrawn, TreeResearchBalanceWithdrawn } from "../../generated/Treasury/Treasury";
import { AssignedFundDistribution, Counter, DistributionModelError, FundDistribution, Planter, PlanterPayment, TreeFund, Withdraw } from "../../generated/schema";
import { Address, BigInt, log, store } from '@graphprotocol/graph-ts';
import { COUNTER_ID, getCount_batchRegularTreeRequest, getCount_dme, getCount_planterPayment, getCount_treeFund, getCount_updateSpec, getCount_withdraws, INCREMENTAL_SELL_ID, ZERO_ADDRESS } from '../helpers';
// let withdrawTypes: object = {
//     TREE_RESEARCH: "treeReseach",
//     LOCAL_DEVELOP: "localDevelop",
//     RESCUE: "rescue",
//     TREEJER_DEVELOP: "treejerDevelop",
//     OTHER_BALANCE1: "otherBalance1",
//     OTHER_BALANCE2: "otherBalance2",
//     PLANTER: "planter",
// };
/*


    struct TotalFund {
        uint256 planterFund;
        uint256 referralFund;
        uint256 treeResearch;
        uint256 localDevelop;
        uint256 rescueFund;
        uint256 treejerDevelop;
        uint256 reserveFund1;
        uint256 reserveFund2;
}

    struct AssignModel {
        uint256 startingTreeId;
        uint256 distributionModelId;
}
  struct FundDistribution {
        uint16 planterFund;
        uint16 referralFund;
        uint16 treeResearch;
        uint16 localDevelop;
        uint16 rescueFund;
        uint16 treejerDevelop;
        uint16 reserveFund1;
        uint16 reserveFund2;
        uint16 exists;
}
*/
function setFdData(fd: FundDistribution, c_fd: Treasury__fundDistributionsResult): void {
    fd.planterFund = BigInt.fromString(c_fd.value0.toString());
    fd.referralFund = BigInt.fromString(c_fd.value1.toString());
    fd.treeResearch = BigInt.fromString(c_fd.value2.toString());
    fd.localDevelop = BigInt.fromString(c_fd.value3.toString());
    fd.rescueFund = BigInt.fromString(c_fd.value4.toString());
    fd.treejerDevelop = BigInt.fromString(c_fd.value5.toString());
    fd.reserveFund1 = BigInt.fromString(c_fd.value6.toString());
    fd.reserveFund2 = BigInt.fromString(c_fd.value7.toString());
    fd.exists = BigInt.fromString(c_fd.value8.toString());
}
export function handleDistributionModelAdded(event: DistributionModelAdded): void {
    let fd = new FundDistribution(event.params.modelId.toHexString());
    let treasuryContract = TreasuryContract.bind(event.address);
    let c_fd = treasuryContract.fundDistributions(event.params.modelId);
    setFdData(fd, c_fd);
    fd.save();
}

export function handleFundDistributionModelAssigned(event: FundDistributionModelAssigned): void {
    let counter = Counter.load(COUNTER_ID);
    let _lim = Number.parseInt(counter.assignedFunds.toString());
    for (let i = 0; i < _lim; i++) {
        store.remove("AssignedFundDistribution", BigInt.fromString(i.toString()).toHexString());
    }
    let treasuryContract = TreasuryContract.bind(event.address);
    // let _count = Number.parseInt(event.params.endingTreeId.toString()) - Number.parseInt(event.params.startingTreeId.toString());

    let _count = Number.parseInt(event.params.endingTreeId.minus(event.params.startingTreeId).toString());
    // log.warning("_count IS {}", [_count.toString()]);
    // if (_count > 0) {
    //     let assignModels = treasuryContract.assignModels(BigInt.fromI32(0));
    // }
    // for (let i = 0; i < _count; i++) {
    // log.warning("i = {}", [i.toString()]);
    // let assignModels = treasuryContract.assignModels(BigInt.fromString(i.toString().split(".")[0]));
    // let assignModels = treasuryContract.assignModels(BigInt.fromI32(i));
    // let assignedFund = new AssignedFundDistribution(BigInt.fromString(i.toString().split(".")[0]).toHexString());
    // let fund = new FundDistribution(i.toString());
    // log.warning("distmodel = {} , value0 = {}", [assignModels.value1.toString(), assignModels.value0.toHexString()]);
    // assignedFund.distributionModel = assignModels.value1.toHexString();
    // assignedFund.save();
    // }
    // counter.assignedFunds = BigInt.fromString(_count.toString());
    // counter.save();
}




export function handleDistributionModelOfTreeNotExist(event: DistributionModelOfTreeNotExist): void {
    let dme = new DistributionModelError(getCount_dme(COUNTER_ID).toHexString());
    dme.description = event.params.description;
    dme.date = event.block.timestamp as BigInt;
    dme.save();
}

export function handlePlanterFunded(event: PlanterFunded): void {
    let fund = new PlanterPayment(getCount_planterPayment(COUNTER_ID).toHexString());
    fund.amount = event.params.amount as BigInt;
    fund.planter = event.params.planterId.toHexString();
    fund.date = event.block.timestamp as BigInt;
    fund.tree = event.params.treeId.toHexString();
    let planter = Planter.load(fund.planter);
    if (planter.refferedBy) {
        fund.isRefferal = true;
    } else {
        fund.isRefferal = false;
    }
    fund.save();
}


export function handleTreeResearchBalanceWithdrawn(event: TreeResearchBalanceWithdrawn): void {
    let withdraw = new Withdraw(getCount_withdraws(COUNTER_ID).toHexString());
    withdraw.type = "treeReseach";
    withdraw.amount = event.params.amount as BigInt;
    withdraw.date = event.block.timestamp as BigInt;
    withdraw.destAddress = event.params.account.toHexString();
    withdraw.reason = event.params.reason;
    withdraw.save();
}

export function handleLocalDevelopBalanceWithdrawn(event: LocalDevelopBalanceWithdrawn): void {
    let withdraw = new Withdraw(getCount_withdraws(COUNTER_ID).toHexString());
    withdraw.type = "localDevelop";
    withdraw.amount = event.params.amount as BigInt;
    withdraw.date = event.block.timestamp as BigInt;
    withdraw.destAddress = event.params.account.toHexString();
    withdraw.reason = event.params.reason;
    withdraw.save();
}

export function handleRescueBalanceWithdrawn(event: RescueBalanceWithdrawn): void {
    let withdraw = new Withdraw(getCount_withdraws(COUNTER_ID).toHexString());
    withdraw.type = "rescue";
    withdraw.amount = event.params.amount as BigInt;
    withdraw.date = event.block.timestamp as BigInt;
    withdraw.destAddress = event.params.account.toHexString();
    withdraw.reason = event.params.reason;
    withdraw.save();
}

export function handleTreejerDevelopBalanceWithdrawn(event: TreejerDevelopBalanceWithdrawn): void {
    let withdraw = new Withdraw(getCount_withdraws(COUNTER_ID).toHexString());
    withdraw.type = "treejerDevelop";
    withdraw.amount = event.params.amount as BigInt;
    withdraw.date = event.block.timestamp as BigInt;
    withdraw.destAddress = event.params.account.toHexString();
    withdraw.reason = event.params.reason;
    withdraw.save();
}

export function handleOtherBalanceWithdrawn1(event: OtherBalanceWithdrawn1): void {
    let withdraw = new Withdraw(getCount_withdraws(COUNTER_ID).toHexString());
    withdraw.type = "otherBalance1";
    withdraw.amount = event.params.amount as BigInt;
    withdraw.date = event.block.timestamp as BigInt;
    withdraw.destAddress = event.params.account.toHexString();
    withdraw.reason = event.params.reason;
    withdraw.save();
}
export function handleOtherBalanceWithdrawn2(event: OtherBalanceWithdrawn2): void {
    let withdraw = new Withdraw(getCount_withdraws(COUNTER_ID).toHexString());
    withdraw.type = "otherBalance2";
    withdraw.amount = event.params.amount as BigInt;
    withdraw.date = event.block.timestamp as BigInt;
    withdraw.destAddress = event.params.account.toHexString();
    withdraw.reason = event.params.reason;
    withdraw.save();
}



export function handlePlanterBalanceWithdrawn(event: PlanterBalanceWithdrawn): void {
    let withdraw = new Withdraw(getCount_withdraws(COUNTER_ID).toHexString());
    withdraw.type = "planter";
    withdraw.amount = event.params.amount as BigInt;
    withdraw.date = event.block.timestamp as BigInt;
    withdraw.destAddress = event.params.account.toHexString();
    withdraw.reason = "";
    withdraw.save();
}

export function handleTreeFunded(event: TreeFunded): void {
    let treefund = new TreeFund(getCount_treeFund(COUNTER_ID).toHexString());
    // log.warning("treefund id = {}", [treefund.id]);
    treefund.tree = event.params.treeId.toHexString();
    treefund.date = event.block.timestamp as BigInt;
    treefund.distributionModel = event.params.modelId.toHexString();
    treefund.amount = event.params.amount as BigInt;
    treefund.save();
}


