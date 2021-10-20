import { AssignedAllocation, Counter, Allocation } from "../../generated/schema";
import { AllocationDataAdded,
Allocation as AllocationContract,
Allocation__allocationsResult, AllocationToTreeAssigned } from "../../generated/Allocation/Allocation";
import { BigInt, log, store } from "@graphprotocol/graph-ts";
import { COUNTER_ID } from "../helpers";


/*
struct Allocation {
        uint16 planterFund;
        uint16 ambassadorShare;
        uint16 researchShare;
        uint16 localDevelopmentShare;
        uint16 insuranceShare;
        uint16 treasuryShare;
        uint16 reserve1Share;
        uint16 reserve2Share;
        uint16 exists;
    }
*/
function setModelData(model: Allocation, c_model: Allocation__allocationsResult): void {
    model.planterShare = BigInt.fromI32(c_model.value0);
    model.ambassadorShare = BigInt.fromI32(c_model.value1);
    model.researchShare = BigInt.fromI32(c_model.value2);
    model.localDevelopmentShare = BigInt.fromI32(c_model.value3);
    model.insuranceShare = BigInt.fromI32(c_model.value4);
    model.treasuryShare = BigInt.fromI32(c_model.value5);
    model.reserve1Share = BigInt.fromI32(c_model.value6);
    model.reserve2Share = BigInt.fromI32(c_model.value7);
    model.exists = BigInt.fromI32(c_model.value8);
}
export function handleAllocationDataAdded(event: AllocationDataAdded): void {
    let financialModelContract = AllocationContract.bind(event.address);
    let c_model = financialModelContract.allocations(event.params.allocationDataId);
    let model = new Allocation(event.params.allocationDataId.toHexString());
    setModelData(model, c_model);
    model.createdAt = event.block.timestamp as BigInt;
    model.save();
}

export function handleAllocationToTreeAssigned(event: AllocationToTreeAssigned): void {
    let counter = Counter.load(COUNTER_ID);
    if(!counter || counter == null) {
        return;
    }
    // let _lim = Number.parseInt(counter.assignedFunds.toString());
    // for (let i = 0; i < _lim; i++) {
    //     store.remove("AssignedAllocation", BigInt.fromString(i.toString()).toHexString());
    // }
    let financialModelContract = AllocationContract.bind(event.address);
    // let _count = Number.parseInt(event.params.endingTreeId.toString()) - Number.parseInt(event.params.startingTreeId.toString());

    let _count = Number.parseInt(event.params.allocationToTreesLength.toString().split(".")[0]);

    // // log.warning("_count IS {}", [_count.toString()]);
    // // if (_count > 0) {
    // //     let allocationToTrees = treasuryContract.allocationToTrees(BigInt.fromI32(0));
    // // }
    log.warning("_count = {}", [_count.toString()]);
    for (let i = 0; i < _count; i++) {
        //     log.warning("i = {}", [i.toString()]);
        let allocationToTrees = financialModelContract.allocationToTrees(BigInt.fromString(i.toString().split(".")[0]));
        //     // let allocationToTrees = treasuryContract.allocationToTrees(BigInt.fromI32(i));
        // let assignedFund = new AssignedAllocation(BigInt.fromString(i.toString().split(".")[0]).toHexString());
        let assignedFund = new AssignedAllocation(BigInt.fromI32(i).toHexString());
        //     // let fund = new Allocation(i.toString());
        //     // log.warning("distmodel = {} , value0 = {}", [allocationToTrees.value1.toString(), allocationToTrees.value0.toHexString()]);
        assignedFund.allocation = allocationToTrees.value1.toHexString();
        assignedFund.save();
    }
    // counter.assignedFunds = BigInt.fromString(_count.toString().split(".")[0]);
    // log.warning("counter.assignedFunds = {}", [counter.assignedFunds.toString()]);
    // counter.save();
}