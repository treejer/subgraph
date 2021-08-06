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
