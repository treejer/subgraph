import {Planter} from "../../generated/schema"
import {PlanterJoin} from "../../generated/Planter/Planter"
import { log } from "@graphprotocol/graph-ts";
export function handlePlanterJoin(event:PlanterJoin): void{
    let planter = new Planter(event.params.planterId.toHex());
    planter.countryCode = "sdf";
    let pl = Planter.load(event.params.planterId.toHex());
    log.debug("Planter latitude is {}", [pl.latitude.toString()]);
    planter.save();
}