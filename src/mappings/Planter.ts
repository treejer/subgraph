import {Planter} from "../../generated/schema"
import {PlanterJoin, Planter as PlanterContract} from "../../generated/Planter/Planter"
import { BigInt, log } from "@graphprotocol/graph-ts";
export function handlePlanterJoin(event:PlanterJoin): void{
    let planter = new Planter(event.params.planterId.toHex());
    planter.countryCode = "sdf";
    planter.status = new BigInt(1);
    planter.planterType = new BigInt(1);
    let planterContract = PlanterContract.bind(event.address);
    let pl = planterContract.planters(event.params.planterId);
    log.info("Planter is {} {} {} {} {} {} {} {} ", [pl.value0.toString(), pl.value1.toString(), pl.value2.toString(), pl.value3.toString(), pl.value4.toString(), pl.value5.toString(), pl.value6.toString(), pl.value7.toString() ]);
    planter.save();
    
}
