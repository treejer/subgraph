import { BigInt } from "@graphprotocol/graph-ts";
import { Counter, GlobalData, TreeHistory, AddressHistory } from "../generated/schema";
// import { Counter } from "../generated/schema";
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export const COUNTER_ID = "0001";
export const INCREMENTAL_SELL_ID = "0001";
export const CONTRACT_TREE_ADDRESS = "0xFB244f708E63AC1b9248A43157036a9A1E78300B";
export const CONTRACT_REGULAR_SELL_ADDRESS = "0xDF20e7f5b883C74152C0AE7e28eF13EFCF922441";


function newCounter(id: string): Counter {
    let counter = new Counter(id);
    let _zero = BigInt.fromI32(0);
    counter.treeUpdates = _zero;
    counter.bid = _zero;
    counter.RegularRequest = _zero;
    counter.treeFund = _zero;
    counter.dme = _zero;
    counter.withdraws = _zero;
    counter.planterPayments = _zero;
    counter.assignedFunds = _zero;
    counter.treeHistory = _zero;
    counter.addressHistory = _zero;

    counter.treeSpecs = _zero;
    counter.communityGift = _zero;
    return counter;
}

export function getCount_treeUpdates(id: string): BigInt {
    let counter = Counter.load(id);
    if (counter) {
        let cnt: BigInt = counter.treeUpdates as BigInt;
        counter.treeUpdates = cnt.plus(BigInt.fromI32(1));
        counter.save();
        return cnt;
    }
    counter = newCounter(id);
    counter.treeUpdates = BigInt.fromI32(1);
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

export function getCount_RegularRequest(id: string): BigInt {
    let counter = Counter.load(id);
    if (counter) {
        let cnt: BigInt = counter.RegularRequest as BigInt;
        counter.RegularRequest = cnt.plus(BigInt.fromI32(1));
        counter.save();
        return cnt;
    }
    counter = newCounter(id);
    counter.RegularRequest = BigInt.fromI32(1);
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

export function getCount_treeSpecs(id: string): BigInt {
    let counter = Counter.load(id);
    if (counter) {
        let cnt: BigInt = counter.treeSpecs as BigInt;
        counter.treeSpecs = cnt.plus(BigInt.fromI32(1));
        counter.save();
        return cnt;
    }
    counter = newCounter(id);
    counter.treeSpecs = BigInt.fromI32(1);
    counter.save();
    return BigInt.fromI32(0);
}

export function getCount_treeHistory(id: string): BigInt {
    let counter = Counter.load(id);
    if (counter) {
        let cnt: BigInt = counter.treeHistory as BigInt;
        counter.treeHistory = cnt.plus(BigInt.fromI32(1));
        counter.save();
        return cnt;
    }
    counter = newCounter(id);
    counter.treeHistory = BigInt.fromI32(1);
    counter.save();
    return BigInt.fromI32(0);
}

export function getCount_addressHistory(id: string): BigInt {
    let counter = Counter.load(id);
    if (counter) {
        let cnt: BigInt = counter.addressHistory as BigInt;
        counter.addressHistory = cnt.plus(BigInt.fromI32(1));
        counter.save();
        return cnt;
    }
    counter = newCounter(id);
    counter.addressHistory = BigInt.fromI32(1);
    counter.save();
    return BigInt.fromI32(0);
}

export function addTreeHistory(
    treeId: string,
    event: string,
    from: string,
    transactionHash: string,
    blockNumber: BigInt,
    createdAt: BigInt, value: BigInt): void {
    let treeHistory = new TreeHistory(getCount_treeHistory(COUNTER_ID).toHexString());

    treeHistory.tree = treeId;
    treeHistory.event = event;
    treeHistory.from = from;
    treeHistory.transactionHash = transactionHash;
    treeHistory.blockNumber = blockNumber;
    treeHistory.value = value;
    treeHistory.createdAt = createdAt;

    treeHistory.save();

}


export function addAddressHistory(
    address: string,
    event: string,
    type: string,
    typeId: string,
    from: string,
    transactionHash: string,
    blockNumber: BigInt,
    createdAt: BigInt, value: BigInt, count: BigInt): void {
    let addressHistory = new AddressHistory(getCount_addressHistory(COUNTER_ID).toHexString());

    addressHistory.address = address;
    addressHistory.event = event;
    addressHistory.type = type;
    addressHistory.typeId = typeId;
    addressHistory.from = from;
    addressHistory.transactionHash = transactionHash;
    addressHistory.blockNumber = blockNumber;
    addressHistory.value = value;
    addressHistory.count = count;
    addressHistory.createdAt = createdAt;

    addressHistory.save();

}


export function getGlobalData(): GlobalData {
    let gb = GlobalData.load('0');
    if (!gb) {
        gb = new GlobalData('0');
        gb.totalPlantedTrees = new BigInt(0);
        gb.totalVerifiedTrees = new BigInt(0);
        gb.totalUpdates = new BigInt(0);
        gb.totalVerifiedUpdates = new BigInt(0);
        gb.totalRegularTreesUnderReview = new BigInt(0);
        gb.totalRegularTreeSaleCount = new BigInt(0);
        gb.totalAuctionTreeSaleCount = new BigInt(0);
        gb.totalIncrementalSaleCount = new BigInt(0);
        gb.planterCount = new BigInt(0);
        gb.organizationCount = new BigInt(0);
        gb.independentPlanterCount = new BigInt(0);
        gb.funderCount = new BigInt(0);
        gb.ownedTreeCount = new BigInt(0);
        gb.totalRegularTreeSaleAmount = new BigInt(0);
        gb.totalAuctionTreeSaleAmount = new BigInt(0);
        gb.totalIncrementalSaleAmount = new BigInt(0);
        gb.totalClaimedGiftTrees = new BigInt(0);
        gb.regularTreePrice = new BigInt(0);
        gb.lastIncrementalSold = new BigInt(0);
        gb.prevIncrementalPrice = new BigInt(0);
        gb.nowIncrementalPrice = new BigInt(0);
        gb.nextIncremetalPrice = new BigInt(0);
        gb.communityGiftPlanterFund = new BigInt(0);
        gb.communityGiftReferralFund = new BigInt(0);
    }
    return gb;

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

// let _zero = "0".charCodeAt(0);
// let _a = "a".charCodeAt(0);

// function hval(s: string) {

//     if (s.charCodeAt(0) - _zero < 10) return s.charCodeAt(0) - _zero;
//     return s.charCodeAt(0) - _a + 10;

// }
// export function hexToDec(s: string): string {
//     // var i, j, digits = [0], carry;
//     let i: number;
//     let j: number;
//     let digits = [0];
//     let carry: number;
//     for (i = 0; i < s.length; i += 1) {
//         if (s.charCodeAt(i) - _zero < 10) carry = s.charCodeAt(i) - _zero;
//         else carry = s.charCodeAt(i) - _a + 10;
//         for (j = 0; j < digits.length; j += 1) {
//             digits[j] = digits[j] * 16 + carry;
//             carry = digits[j] / 10 | 0;
//             digits[j] %= 10;
//         }
//         while (carry > 0) {
//             digits.push(carry % 10);
//             carry = carry / 10 | 0;
//         }
//     }
//     return digits.reverse().join('');
// }
