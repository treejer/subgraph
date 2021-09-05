import { Planter } from '../../generated/schema';
import { PlanterJoin, Planter as PlanterContract, OrganizationJoin, PlanterUpdated, Planter__plantersResult, AcceptedByOrganization, RejectedByOrganization, PortionUpdated } from '../../generated/Planter/Planter';
import { Address, BigInt } from '@graphprotocol/graph-ts';
import { getGlobalData, ZERO_ADDRESS } from '../helpers';
import { PlanterFund } from "../../generated/Planter/PlanterFund";
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
    // let pf =
    // pl.toMap()<>;
    setPlanterFields(planter, pl);
    planter.referrerCount = new BigInt(0);
    planter.balance = new BigInt(0);
    planter.memberCount = new BigInt(0);
    planter.verifiedPlantedCount = new BigInt(0);
    planter.plantedCount = new BigInt(0);
    planter.totalOrganizationPlantedCount = new BigInt(0);
    planter.totalOrganizationVerifiedPlantedCount = new BigInt(0);
    planter.regularPlantedCount = new BigInt(0);
    planter.regularVerifiedPlantedCount = new BigInt(0);
    planter.organizationRegularPlantedCount = new BigInt(0);
    planter.organizationRegularVerifiedPlantedCount = new BigInt(0);
    planter.organizationRule = new BigInt(0);
    planter.refferedBy = planterContract.refferedBy(event.params.planterId).toHexString();
    planter.memberOf = planterContract.memberOf(event.params.planterId).toHexString();
    let plc = PlanterFund.bind(Address.fromString("0xc2EFF2acc032974566583ac7e680545b0f3007fB"));
    planter.balance = plc.balances(event.params.planterId) as BigInt;
    // log.info("Planter is {} {} {} {} {} {} {} {} ", [pl.value0.toString(), pl.value1.toString(), pl.value2.toString(), pl.value3.toString(), pl.value4.toString(), pl.value5.toString(), pl.value6.toString(), pl.value7.toString() ]);
    planter.save();
    if (planter.refferedBy != ZERO_ADDRESS) {
        let ref = Planter.load(planter.refferedBy);
        ref.referrerCount = ref.referrerCount.plus(BigInt.fromI32(1));
        ref.save();
    }
    let gb = getGlobalData();
    gb.planterCount = gb.planterCount.plus(BigInt.fromI32(1));
    gb.independentPlanterCount = gb.independentPlanterCount.plus(BigInt.fromI32(1));
    gb.save();
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
    planter.totalOrganizationPlantedCount = new BigInt(0);
    planter.totalOrganizationVerifiedPlantedCount = new BigInt(0);
    planter.regularPlantedCount = new BigInt(0);
    planter.regularVerifiedPlantedCount = new BigInt(0);
    planter.organizationRegularPlantedCount = new BigInt(0);
    planter.organizationRegularVerifiedPlantedCount = new BigInt(0);
    planter.organizationRule = new BigInt(0);
    planter.refferedBy = planterContract.refferedBy(event.params.organizationId).toHexString();
    planter.memberOf = planterContract.memberOf(event.params.organizationId).toHexString();
    let plc = PlanterFund.bind(Address.fromString("0xc2EFF2acc032974566583ac7e680545b0f3007fB"));
    planter.balance = plc.balances(event.params.organizationId) as BigInt;
    planter.save();
    if (planter.refferedBy != ZERO_ADDRESS) {
        let ref = Planter.load(planter.refferedBy);
        ref.referrerCount = ref.referrerCount.plus(BigInt.fromI32(1));
        ref.save();
    }
    let gb = getGlobalData();
    gb.organizationCount = gb.organizationCount.plus(BigInt.fromI32(1));
    gb.save();

}

export function handlePlanterUpdated(event: PlanterUpdated): void {
    let planter = Planter.load(event.params.planterId.toHex());
    let planterContract = PlanterContract.bind(event.address);
    let pl = planterContract.planters(event.params.planterId);
    setPlanterFields(planter, pl);
    planter.pendingMemberOf = planterContract.memberOf(event.params.planterId).toHexString();
    planter.save();
}

export function handleAcceptedByOrganization(event: AcceptedByOrganization): void {
    let planter = Planter.load(event.params.planterId.toHex());
    let planterContract = PlanterContract.bind(event.address);
    let mof: Address = planterContract.memberOf(event.params.planterId);
    let gb = getGlobalData();

    if (planter.memberOf == ZERO_ADDRESS) {
        if (planter.pendingMemberOf != ZERO_ADDRESS) {
            planter.memberOf = planter.pendingMemberOf;
            planter.pendingMemberOf = ZERO_ADDRESS;
            gb.independentPlanterCount = gb.independentPlanterCount.minus(BigInt.fromI32(1));
            let parent = Planter.load(planter.memberOf);
            parent.memberCount = parent.memberCount.plus(BigInt.fromI32(1));
            parent.totalOrganizationPlantedCount = parent.totalOrganizationPlantedCount.plus(planter.plantedCount as BigInt);
            parent.totalOrganizationVerifiedPlantedCount = parent.totalOrganizationVerifiedPlantedCount.plus(planter.verifiedPlantedCount as BigInt);
            parent.organizationRegularPlantedCount = parent.organizationRegularPlantedCount.plus(planter.regularPlantedCount as BigInt);
            parent.organizationRegularVerifiedPlantedCount = parent.organizationRegularVerifiedPlantedCount.plus(planter.regularVerifiedPlantedCount as BigInt);
            parent.save();
        }
    }
    else {

        if (planter.pendingMemberOf != ZERO_ADDRESS) {
            let prevParent = Planter.load(planter.memberOf);
            let pendingParent = Planter.load(planter.pendingMemberOf);
            prevParent.memberCount = prevParent.memberCount.minus(BigInt.fromI32(1));
            prevParent.totalOrganizationPlantedCount = prevParent.totalOrganizationPlantedCount.minus(planter.plantedCount as BigInt);
            prevParent.totalOrganizationVerifiedPlantedCount = prevParent.totalOrganizationVerifiedPlantedCount.minus(planter.verifiedPlantedCount as BigInt);
            prevParent.organizationRegularPlantedCount = prevParent.organizationRegularPlantedCount.minus(planter.regularPlantedCount as BigInt);
            prevParent.organizationRegularVerifiedPlantedCount = prevParent.organizationRegularVerifiedPlantedCount.minus(planter.regularVerifiedPlantedCount as BigInt);
            prevParent.save();

            if (pendingParent != null && pendingParent.id != ZERO_ADDRESS) {
                pendingParent.memberCount = pendingParent.memberCount.plus(BigInt.fromI32(1));
                pendingParent.totalOrganizationPlantedCount = pendingParent.totalOrganizationPlantedCount.plus(planter.plantedCount as BigInt);
                pendingParent.totalOrganizationVerifiedPlantedCount = pendingParent.totalOrganizationVerifiedPlantedCount.plus(planter.verifiedPlantedCount as BigInt);
                pendingParent.organizationRegularPlantedCount = pendingParent.organizationRegularPlantedCount.plus(planter.regularPlantedCount as BigInt);
                pendingParent.organizationRegularVerifiedPlantedCount = pendingParent.organizationRegularVerifiedPlantedCount.plus(planter.regularVerifiedPlantedCount as BigInt);
                pendingParent.save();
            }

            // planter.memberOf = planter.pendingMemberOf;
            // planter.pendingMemberOf = ZERO_ADDRESS;

        }
        else {
            let prevParent = Planter.load(planter.memberOf);
            prevParent.memberCount = prevParent.memberCount.minus(BigInt.fromI32(1));
            prevParent.totalOrganizationPlantedCount = prevParent.totalOrganizationPlantedCount.minus(planter.plantedCount as BigInt);
            prevParent.totalOrganizationVerifiedPlantedCount = prevParent.totalOrganizationVerifiedPlantedCount.minus(planter.verifiedPlantedCount as BigInt);
            prevParent.organizationRegularPlantedCount = prevParent.organizationRegularPlantedCount.minus(planter.regularPlantedCount as BigInt);
            prevParent.organizationRegularVerifiedPlantedCount = prevParent.organizationRegularVerifiedPlantedCount.minus(planter.regularVerifiedPlantedCount as BigInt);
            prevParent.save();
            gb.independentPlanterCount = gb.independentPlanterCount.plus(BigInt.fromI32(1));
            planter.memberOf = planter.pendingMemberOf;
            planter.pendingMemberOf = ZERO_ADDRESS;
        }
    }
    gb.save();
    // planter.memberOf = mof.toHexString();
    let pl = planterContract.planters(event.params.planterId);
    setPlanterFields(planter, pl);
    planter.save();
}

export function handleRejectedByOrganization(event: RejectedByOrganization): void {
    let planter = Planter.load(event.params.planterId.toHex());
    let planterContract = PlanterContract.bind(event.address);
    // planter.memberOf = ZERO_ADDRESS;
    planter.memberOf = planterContract.memberOf(event.params.planterId).toHexString();
    planter.pendingMemberOf = ZERO_ADDRESS;
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