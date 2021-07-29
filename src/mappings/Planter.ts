import {Planter} from "../../generated/schema"
import {PlanterJoin, Planter as PlanterContract} from "../../generated/Planter/Planter"
import { BigInt, log } from "@graphprotocol/graph-ts";

/**
 * 
 struct PlanterData {
        uint8 planterType;
        uint8 status;
        uint16 countryCode;
        uint32 score;
        uint32 capacity;
        uint32 plantedCount;
        uint64 longitude;
        uint64 latitude;
    }
    Planter is 1 1 12 0 100 0 30 50 , data_source: Planter, block_hash: 0x573877e2fb2a214e136d4268217035b7e5dc83f4af432292f2c01fca26810b31, block_number: 9016695
 */
export function handlePlanterJoin(event:PlanterJoin): void{
    let planter = new Planter(event.params.planterId.toHex());
    let planterContract = PlanterContract.bind(event.address);
    let pl = planterContract.planters(event.params.planterId);
    // pl.toMap()<>;
    planter.planterType = pl.value0;
    planter.status = pl.value1;
    planter.countryCode  = pl.value2;
    planter.score = pl.value3;
    planter.capacity = pl.value4;
    planter.plantedCount = pl.value5;
    planter.longitude  = pl.value6;
    planter.latitude = pl.value7;
    // log.info("Planter is {} {} {} {} {} {} {} {} ", [pl.value0.toString(), pl.value1.toString(), pl.value2.toString(), pl.value3.toString(), pl.value4.toString(), pl.value5.toString(), pl.value6.toString(), pl.value7.toString() ]);
    planter.save();
    
}
