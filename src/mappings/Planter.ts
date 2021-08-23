import { Planter } from '../../generated/schema';
import { PlanterJoin, Planter as PlanterContract, OrganizationJoin, PlanterUpdated, Planter__plantersResult, AcceptedByOrganization, RejectedByOrganization, PortionUpdated } from '../../generated/Planter/Planter';
import { Address, BigInt } from '@graphprotocol/graph-ts';
import { ZERO_ADDRESS } from '../helpers';
export * from "./TreeFactory";
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

function setPlanterFields(planter: Planter | null, net_planter: Planter__plantersResult): void {
    if (planter === null) return;
    planter.planterType = BigInt.fromString(net_planter.value0.toString());
    planter.status = BigInt.fromString(net_planter.value1.toString());
    planter.countryCode = net_planter.value2.toString();
    planter.score = net_planter.value3 as BigInt;
    planter.capacity = net_planter.value4 as BigInt;
    planter.plantedCount = net_planter.value5 as BigInt;
    planter.longitude = net_planter.value6 as BigInt;
    planter.latitude = net_planter.value7 as BigInt;
}

export function handlePlanterJoin(event: PlanterJoin): void {
    let planter = new Planter(event.params.planterId.toHex());
    let planterContract = PlanterContract.bind(event.address);
    let pl = planterContract.planters(event.params.planterId);
    // pl.toMap()<>;
    setPlanterFields(planter, pl);
    planter.referrerCount = new BigInt(0);
    planter.balance = new BigInt(0);
    planter.memberCount = new BigInt(0);
    planter.verifiedPlantedCount = new BigInt(0);
    planter.plantedCount = new BigInt(0);
    planter.refferedBy = planterContract.refferedBy(event.params.planterId).toHexString();
    planter.memberOf = planterContract.memberOf(event.params.planterId).toHexString();
    // log.info("Planter is {} {} {} {} {} {} {} {} ", [pl.value0.toString(), pl.value1.toString(), pl.value2.toString(), pl.value3.toString(), pl.value4.toString(), pl.value5.toString(), pl.value6.toString(), pl.value7.toString() ]);
    planter.save();
}
export function handleOrganizationJoin(event: OrganizationJoin): void {
    let planter = new Planter(event.params.organizationId.toHex());
    let planterContract = PlanterContract.bind(event.address);
    let pl = planterContract.planters(event.params.organizationId);
    setPlanterFields(planter, pl);
    planter.referrerCount = new BigInt(0);
    planter.balance = new BigInt(0);
    planter.memberCount = new BigInt(0);
    planter.verifiedPlantedCount = new BigInt(0);
    planter.plantedCount = new BigInt(0);
    planter.refferedBy = planterContract.refferedBy(event.params.organizationId).toHexString();
    planter.memberOf = planterContract.memberOf(event.params.organizationId).toHexString();
    planter.save();
}

export function handlePlanterUpdated(event: PlanterUpdated): void {
    let planter = Planter.load(event.params.planterId.toHex());
    let planterContract = PlanterContract.bind(event.address);
    let pl = planterContract.planters(event.params.planterId);
    setPlanterFields(planter, pl);
    planter.save();
}

export function handleAcceptedByOrganization(event: AcceptedByOrganization): void {
    let planter = Planter.load(event.params.planterId.toHex());
    let planterContract = PlanterContract.bind(event.address);
    let mof: Address = planterContract.memberOf(event.params.planterId);
    planter.memberOf = mof.toHexString();
    let pl = planterContract.planters(event.params.planterId);
    setPlanterFields(planter, pl);
    planter.save();
}

export function handleRejectedByOrganization(event: RejectedByOrganization): void {
    let planter = Planter.load(event.params.planterId.toHex());
    let planterContract = PlanterContract.bind(event.address);
    planter.memberOf = ZERO_ADDRESS;
    let pl = planterContract.planters(event.params.planterId);
    setPlanterFields(planter, pl);
    planter.save();
}

export function handlePortionUpdated(event: PortionUpdated): void {
    let planter = Planter.load(event.params.planterId.toHex());
    let planterContract = PlanterContract.bind(event.address);
    planter.organizationRule = planterContract.organizationRules(Address.fromString(planter.memberOf), Address.fromString(planter.id)) as BigInt;
    let pl = planterContract.planters(event.params.planterId);
    setPlanterFields(planter, pl);
    planter.save();
}