import { BigInt } from "@graphprotocol/graph-ts";
import { Counter } from "../generated/schema";
// import { Counter } from "../generated/schema";

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export const COUNTER_ID = "0001";
export const INCREMENTAL_SELL_ID = "0001";

// let COUNTER_FIELDS = {
//     UPDATE_SPECS: "updateSpec"
// };
// export function getCount(id: string, fieldName: string, inc: boolean): BigInt {
//     // let COUNTER_FIELDS = ["updateSpec"];
//     // // if (!Object.values(COUNTER_FIELDS).includes(fieldName)) return BigInt.fromI32(0);
//     // if (!COUNTER_FIELDS.includes(fieldName)) return BigInt.fromI32(0);

//     let counter = Counter.load(id);
//     if (counter) {
//         let cnt: BigInt = counter[fieldName] as BigInt;
//         if (inc) {
//             counter[fieldName] = cnt.plus(BigInt.fromI32(1));
//             counter.save();
//             return cnt;
//         }
//         return counter[fieldName] as BigInt;
//     }
//     counter = new Counter(id);
//     counter.updateSpec = BigInt.fromString(inc ? "1" : "0");
//     counter.save();
//     return BigInt.fromI32(0);
// }
function newCounter(id: string): Counter {
    let counter = new Counter(id);
    let _zero = BigInt.fromI32(0);
    counter.updateSpec = _zero;
    counter.bid = _zero;
    counter.batchRegularTreeRequest = _zero;
    counter.treeFund = _zero;
    counter.dme = _zero;
    counter.withdraws = _zero;
    counter.planterPayments = _zero;
    counter.assignedFunds = _zero;
    return counter;
}
export function getCount_updateSpec(id: string): BigInt {
    let counter = Counter.load(id);
    if (counter) {
        let cnt: BigInt = counter.updateSpec as BigInt;
        counter.updateSpec = cnt.plus(BigInt.fromI32(1));
        counter.save();
        return cnt;
    }
    counter = newCounter(id);
    counter.updateSpec = BigInt.fromI32(1);
    counter.save();
    return BigInt.fromI32(0);
}

export function getCount_bid(id: string): BigInt {
    let counter = Counter.load(id);
    if (counter) {
        let cnt: BigInt = counter.bid as BigInt;
        counter.bid = cnt.plus(BigInt.fromI32(1));
        counter.save();
        return cnt;
    }
    counter = newCounter(id);
    counter.bid = BigInt.fromI32(1);
    counter.save();
    return BigInt.fromI32(0);
}

export function getCount_batchRegularTreeRequest(id: string): BigInt {
    let counter = Counter.load(id);
    if (counter) {
        let cnt: BigInt = counter.batchRegularTreeRequest as BigInt;
        counter.batchRegularTreeRequest = cnt.plus(BigInt.fromI32(1));
        counter.save();
        return cnt;
    }
    counter = newCounter(id);
    counter.batchRegularTreeRequest = BigInt.fromI32(1);
    counter.save();
    return BigInt.fromI32(0);
}

export function getCount_dme(id: string): BigInt {
    let counter = Counter.load(id);
    if (counter) {
        let cnt: BigInt = counter.dme as BigInt;
        counter.dme = cnt.plus(BigInt.fromI32(1));
        counter.save();
        return cnt;
    }
    counter = newCounter(id);
    counter.dme = BigInt.fromI32(1);
    counter.save();
    return BigInt.fromI32(0);
}

export function getCount_planterPayment(id: string): BigInt {
    let counter = Counter.load(id);
    if (counter) {
        let cnt: BigInt = counter.planterPayments as BigInt;
        counter.planterPayments = cnt.plus(BigInt.fromI32(1));
        counter.save();
        return cnt;
    }
    counter = newCounter(id);
    counter.planterPayments = BigInt.fromI32(1);
    counter.save();
    return BigInt.fromI32(0);
}

export function getCount_withdraws(id: string): BigInt {
    let counter = Counter.load(id);
    if (counter) {
        let cnt: BigInt = counter.withdraws as BigInt;
        counter.withdraws = cnt.plus(BigInt.fromI32(1));
        counter.save();
        return cnt;
    }
    counter = newCounter(id);
    counter.withdraws = BigInt.fromI32(1);
    counter.save();
    return BigInt.fromI32(0);
}

export function getCount_treeFund(id: string): BigInt {
    let counter = Counter.load(id);
    if (counter) {
        let cnt: BigInt = counter.treeFund as BigInt;
        counter.treeFund = cnt.plus(BigInt.fromI32(1));
        counter.save();
        return cnt;
    }
    counter = newCounter(id);
    counter.treeFund = BigInt.fromI32(1);
    counter.save();
    return BigInt.fromI32(0);
}


// export enum withdrawTypes {
//     TREE_RESEARCH = "treeReseach",
//     LOCAL_DEVELOP = "localDevelop",
//     RESCUE = "rescue",
//     TREEJER_DEVELOP = "treejerDevelop",
//     OTHER_BALANCE1 = "otherBalance1",
//     OTHER_BALANCE2 = "otherBalance2",
//     PLANTER = "planter",
// }
