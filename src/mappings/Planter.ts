import {Planter} from "../../generated/schema"
import {PlanterJoin} from "../../generated/Planter/Planter"
export function handlePlanterJoin(event:PlanterJoin){
    const planter = new Planter(event.params.planterId.toHex());
    planter.countryCode = "sdf";
    planter.save();
}