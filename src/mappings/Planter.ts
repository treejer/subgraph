import {Planter} from "../../generated/schema"
import {PlanterJoin} from "../../generated/Planter/Planter"
import { log } from "@graphprotocol/graph-ts";
export function handlePlanterJoin(event:PlanterJoin): void{
    let planter = new Planter(event.params.planterId.toHex());
    planter.countryCode = "sdf";
    let planterContract = Planter.bind(event.address);
    let pl = planterContract.planters(event.params.planterId);
    
    // let pl = Planter.load(event.params.planterId.toHex());
    log.debug("Planter latitude is {}", [pl.latitude.toString()]);
    planter.save();
}

/**
 *   
  let contractTreeFactory = TreeFactory.bind(event.address)  
  theTree.planterRemainingBalance = contractTreeFactory.treeToPlanterRemainingBalance(event.params.treeId)
  theTree.ambassadorRemainingBalance = contractTreeFactory.treeToAmbassadorRemainingBalance(event.params.treeId)
  
 */