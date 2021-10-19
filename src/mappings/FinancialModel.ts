import { AssignedFundDistribution, Counter, FundDistribution } from "../../generated/schema";
import { DistributionModelAdded, FinancialModel, FinancialModel__fundDistributionsResult, FundDistributionModelAssigned } from "../../generated/FinancialModel/FinancialModel";
import { BigInt, log, store } from "@graphprotocol/graph-ts";
import { COUNTER_ID } from "../helpers";


/*
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
function setModelData(model: FundDistribution, c_model: FinancialModel__fundDistributionsResult): void {
    model.planterFund = BigInt.fromI32(c_model.value0);
    model.referralFund = BigInt.fromI32(c_model.value1);
    model.treeResearch = BigInt.fromI32(c_model.value2);
    model.localDevelop = BigInt.fromI32(c_model.value3);
    model.rescueFund = BigInt.fromI32(c_model.value4);
    model.treejerDevelop = BigInt.fromI32(c_model.value5);
    model.reserveFund1 = BigInt.fromI32(c_model.value6);
    model.reserveFund2 = BigInt.fromI32(c_model.value7);
    model.exists = BigInt.fromI32(c_model.value8);
}
export function handleDistributionModelAdded(event: DistributionModelAdded): void {
    let financialModelContract = FinancialModel.bind(event.address);
    let c_model = financialModelContract.fundDistributions(event.params.modelId);
    let model = new FundDistribution(event.params.modelId.toHexString());
    setModelData(model, c_model);
    model.save();
}

export function handleFundDistributionModelAssigned(event: FundDistributionModelAssigned): void {
    let counter = Counter.load(COUNTER_ID);
    let _lim = Number.parseInt(counter.assignedFunds.toString());
    // for (let i = 0; i < _lim; i++) {
    //     store.remove("AssignedFundDistribution", BigInt.fromString(i.toString()).toHexString());
    // }
    let financialModelContract = FinancialModel.bind(event.address);
    // let _count = Number.parseInt(event.params.endingTreeId.toString()) - Number.parseInt(event.params.startingTreeId.toString());

    let _count = Number.parseInt(event.params.assignModelsLength.toString().split(".")[0]);

    // // log.warning("_count IS {}", [_count.toString()]);
    // // if (_count > 0) {
    // //     let assignModels = treasuryContract.assignModels(BigInt.fromI32(0));
    // // }
    log.warning("_count = {}", [_count.toString()]);
    for (let i = 0; i < _count; i++) {
        //     log.warning("i = {}", [i.toString()]);
        let assignModels = financialModelContract.assignModels(BigInt.fromString(i.toString().split(".")[0]));
        //     // let assignModels = treasuryContract.assignModels(BigInt.fromI32(i));
        // let assignedFund = new AssignedFundDistribution(BigInt.fromString(i.toString().split(".")[0]).toHexString());
        let assignedFund = new AssignedFundDistribution(BigInt.fromI32(i).toHexString());
        //     // let fund = new FundDistribution(i.toString());
        //     // log.warning("distmodel = {} , value0 = {}", [assignModels.value1.toString(), assignModels.value0.toHexString()]);
        assignedFund.distributionModel = assignModels.value1.toHexString();
        assignedFund.save();
    }
    // counter.assignedFunds = BigInt.fromString(_count.toString().split(".")[0]);
    // log.warning("counter.assignedFunds = {}", [counter.assignedFunds.toString()]);
    // counter.save();
}