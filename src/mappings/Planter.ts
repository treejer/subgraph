import { Planter } from '../../generated/schema';
import {
    PlanterJoined,
    IPlanter as PlanterContract,
    IPlanter__plantersResult,
    OrganizationJoined,
    PlanterUpdated,
    AcceptedByOrganization,
    RejectedByOrganization,
    OrganizationMemberShareUpdated
} from '../../generated/Planter/IPlanter';
import { Address, BigInt, log } from '@graphprotocol/graph-ts';
import { addAddressHistory, getGlobalData, ZERO_ADDRESS } from '../helpers';


function setPlanterFields(planter: Planter | null, net_planter: IPlanter__plantersResult): void {
    if (planter === null) return;
    planter.planterType = BigInt.fromString(net_planter.value0.toString());
    planter.status = BigInt.fromString(net_planter.value1.toString());
    planter.countryCode = net_planter.value2.toString();
    planter.score = net_planter.value3 as BigInt;
    planter.supplyCap = net_planter.value4 as BigInt;
    planter.plantedCount = net_planter.value5 as BigInt;
    planter.longitude = net_planter.value6 as BigInt;
    planter.latitude = net_planter.value7 as BigInt;
}

function handleInviteBy(invitedBy: string): void {
    if (invitedBy == ZERO_ADDRESS) {
        return;
    }

    let inviter = Planter.load(invitedBy);
    if (!inviter || inviter == null) {
        log.warning('Undefined invited Planter {}', [invitedBy]);
        return;
    }

    inviter.invitedCount = inviter.invitedCount.plus(BigInt.fromI32(1));
    inviter.save();
}

export function handlePlanterJoined(event: PlanterJoined): void {
    let planter = new Planter(event.params.planter.toHex());
    let planterContract = PlanterContract.bind(event.address);

    let pl = planterContract.planters(event.params.planter);

    setPlanterFields(planter, pl);
    let invitedBy = planterContract.invitedBy(event.params.planter).toHexString();
    planter.invitedBy = invitedBy;
    planter.memberOf = planterContract.memberOf(event.params.planter).toHexString();
    planter.createdAt = event.block.timestamp as BigInt;
    planter.updatedAt = event.block.timestamp as BigInt;

    planter.organizationShare = BigInt.fromI32(0);
    planter.memberCount = BigInt.fromI32(0);
    planter.invitedCount = BigInt.fromI32(0);
    planter.balance = BigInt.fromI32(0);


    planter.verifiedPlantedCount = BigInt.fromI32(0);
    planter.totalOrganizationPlantedCount = BigInt.fromI32(0);
    planter.totalOrganizationVerifiedPlantedCount = BigInt.fromI32(0);
    planter.regularPlantedCount = BigInt.fromI32(0);
    planter.regularVerifiedPlantedCount = BigInt.fromI32(0);
    planter.organizationRegularPlantedCount = BigInt.fromI32(0);
    planter.organizationRegularVerifiedPlantedCount = BigInt.fromI32(0);

    planter.save();

    handleInviteBy(invitedBy);

    //if admin add planter to organization automaticlly status is 1 and we can update memberCount for org
    if (planter.status === BigInt.fromString("1") && (planter.memberOf != null || planter.memberOf != ZERO_ADDRESS)) {
        let organization = Planter.load(planter.memberOf as string);
        if (organization == null) {
            log.warning('Undefined organization in handlePlanterJoined {}', [planter.memberOf as string]);
        } else {
            organization.memberCount = organization.memberCount.plus(BigInt.fromI32(1));
            organization.updatedAt = event.block.timestamp as BigInt;
            organization.save();
        }

    }

    let gb = getGlobalData();
    gb.planterCount = gb.planterCount.plus(BigInt.fromI32(1));
    if (planter.planterType == BigInt.fromString("1")) {
        gb.independentPlanterCount = gb.independentPlanterCount.plus(BigInt.fromI32(1));
    }
    gb.save();

    addAddressHistory(planter.id,
        'PlanterJoined',
        'planter',
        planter.id,
        event.transaction.from.toHexString(),
        event.transaction.hash.toHexString(),
        event.block.number as BigInt,
        event.block.timestamp as BigInt, BigInt.fromI32(0), BigInt.fromI32(0));
}
export function handleOrganizationJoined(event: OrganizationJoined): void {
    let planter = new Planter(event.params.organization.toHex());
    let planterContract = PlanterContract.bind(event.address);
    let pl = planterContract.planters(event.params.organization);
    setPlanterFields(planter, pl);

    let invitedBy = planterContract.invitedBy(event.params.organization).toHexString();
    planter.invitedBy = invitedBy;
    planter.memberOf = planterContract.memberOf(event.params.organization).toHexString();
    planter.createdAt = event.block.timestamp as BigInt;
    planter.updatedAt = event.block.timestamp as BigInt;

    planter.organizationShare = BigInt.fromI32(0);
    planter.memberCount = BigInt.fromI32(0);
    planter.invitedCount = BigInt.fromI32(0);
    planter.balance = BigInt.fromI32(0);


    planter.verifiedPlantedCount = BigInt.fromI32(0);
    planter.totalOrganizationPlantedCount = BigInt.fromI32(0);
    planter.totalOrganizationVerifiedPlantedCount = BigInt.fromI32(0);
    planter.regularPlantedCount = BigInt.fromI32(0);
    planter.regularVerifiedPlantedCount = BigInt.fromI32(0);
    planter.organizationRegularPlantedCount = BigInt.fromI32(0);
    planter.organizationRegularVerifiedPlantedCount = BigInt.fromI32(0);


    planter.save();
    handleInviteBy(invitedBy);

    let gb = getGlobalData();
    gb.organizationCount = gb.organizationCount.plus(BigInt.fromI32(1));
    gb.save();


    addAddressHistory(planter.id,
        'OrganizationJoined',
        'planter',
        planter.id,
        event.transaction.from.toHexString(),
        event.transaction.hash.toHexString(),
        event.block.number as BigInt,
        event.block.timestamp as BigInt, BigInt.fromI32(0), BigInt.fromI32(0));

}

export function handlePlanterUpdated(event: PlanterUpdated): void {
    let planter = Planter.load(event.params.planter.toHex());
    let planterContract = PlanterContract.bind(event.address);
    let pl = planterContract.planters(event.params.planter);
    if (planter === null) {
        log.warning('Undefined planter in handlePlanterUpdated {}', [event.params.planter.toHex()]);
        return;
    }

    if (planter.planterType != BigInt.fromString(pl.value0.toString())) {
        let gb = getGlobalData();
        if (BigInt.fromString(pl.value0.toString()) == BigInt.fromString("1")) {
            gb.independentPlanterCount = gb.independentPlanterCount.plus(BigInt.fromI32(1));
        } else {
            gb.independentPlanterCount = gb.independentPlanterCount.minus(BigInt.fromI32(1));
        }
        gb.save();
    }

    //decrease organization count when planter change organizaion
    let organization = Planter.load(planter.memberOf as string);
    if (planter.memberOf != ZERO_ADDRESS && organization != null) {
        organization.updatedAt = event.block.timestamp as BigInt;
        organization.memberCount = organization.memberCount.plus(BigInt.fromI32(1));

        organization.totalOrganizationPlantedCount = organization.totalOrganizationPlantedCount.minus(planter.plantedCount as BigInt);
        organization.totalOrganizationVerifiedPlantedCount = organization.totalOrganizationVerifiedPlantedCount.minus(planter.verifiedPlantedCount as BigInt);
        organization.organizationRegularPlantedCount = organization.organizationRegularPlantedCount.minus(planter.regularPlantedCount as BigInt);
        organization.organizationRegularVerifiedPlantedCount = organization.organizationRegularVerifiedPlantedCount.minus(planter.regularVerifiedPlantedCount as BigInt);

        organization.save();
    }

    planter.memberOf = planterContract.memberOf(event.params.planter).toHexString();
    setPlanterFields(planter, pl);
    planter.updatedAt = event.block.timestamp as BigInt;

    planter.save();


    addAddressHistory(planter.id,
        'PlanterUpdated',
        'planter',
        planter.id,
        event.transaction.from.toHexString(),
        event.transaction.hash.toHexString(),
        event.block.number as BigInt,
        event.block.timestamp as BigInt, BigInt.fromI32(0), BigInt.fromI32(0));
}

export function handleAcceptedByOrganization(event: AcceptedByOrganization): void {
    let planter = Planter.load(event.params.planter.toHex());
    let planterContract = PlanterContract.bind(event.address);

    if (planter == null) {
        log.warning('Undefined planter in handleAcceptedByOrganization {}', [event.params.planter.toHex()]);
        return;
    }

    let organization = Planter.load(planter.memberOf as string);
    if (organization == null) {
        log.warning('Undefined organization in handleAcceptedByOrganization {}', [planter.memberOf as string]);
        return;
    }
    organization.updatedAt = event.block.timestamp as BigInt;
    organization.memberCount = organization.memberCount.plus(BigInt.fromI32(1));
    organization.totalOrganizationPlantedCount = organization.totalOrganizationPlantedCount.plus(planter.plantedCount as BigInt);
    organization.totalOrganizationVerifiedPlantedCount = organization.totalOrganizationVerifiedPlantedCount.plus(planter.verifiedPlantedCount as BigInt);
    organization.organizationRegularPlantedCount = organization.organizationRegularPlantedCount.plus(planter.regularPlantedCount as BigInt);
    organization.organizationRegularVerifiedPlantedCount = organization.organizationRegularVerifiedPlantedCount.plus(planter.regularVerifiedPlantedCount as BigInt);
    organization.save();


    let pl = planterContract.planters(event.params.planter);
    setPlanterFields(planter, pl);
    planter.updatedAt = event.block.timestamp as BigInt;

    planter.save();

    addAddressHistory(planter.id,
        'AcceptedByOrganization',
        'planter',
        planter.id,
        event.transaction.from.toHexString(),
        event.transaction.hash.toHexString(),
        event.block.number as BigInt,
        event.block.timestamp as BigInt, BigInt.fromI32(0), BigInt.fromI32(0));
}

export function handleRejectedByOrganization(event: RejectedByOrganization): void {
    let planter = Planter.load(event.params.planter.toHex());
    let planterContract = PlanterContract.bind(event.address);
    if (planter == null) {
        log.warning('Undefined planter in handleRejectedByOrganization {}', [event.params.planter.toHex()]);
        return;
    }
    planter.memberOf = planterContract.memberOf(event.params.planter).toHexString();
    let pl = planterContract.planters(event.params.planter);
    setPlanterFields(planter, pl);
    planter.updatedAt = event.block.timestamp as BigInt;

    planter.save();

    let gb = getGlobalData();
    gb.independentPlanterCount = gb.independentPlanterCount.plus(BigInt.fromI32(1));
    gb.save();

    addAddressHistory(planter.id,
        'RejectedByOrganization',
        'planter',
        planter.id,
        event.transaction.from.toHexString(),
        event.transaction.hash.toHexString(),
        event.block.number as BigInt,
        event.block.timestamp as BigInt, BigInt.fromI32(0), BigInt.fromI32(0));
}

export function handleOrganizationMemberShareUpdated(event: OrganizationMemberShareUpdated): void {
    let planter = Planter.load(event.params.planter.toHex());
    if (planter == null) {
        log.warning('Undefined planter in handleOrganizationMemberShareUpdated {}', [event.params.planter.toHex()]);
        return;
    }
    let planterContract = PlanterContract.bind(event.address);
    planter.organizationShare = planterContract.organizationMemberShare(Address.fromString(planter.memberOf as string), Address.fromString(planter.id)) as BigInt;
    planter.updatedAt = event.block.timestamp as BigInt;
    planter.save();

    addAddressHistory(planter.id,
        'OrganizationMemberShareUpdated',
        'planter',
        planter.id,
        event.transaction.from.toHexString(),
        event.transaction.hash.toHexString(),
        event.block.number as BigInt,
        event.block.timestamp as BigInt, planter.organizationShare, BigInt.fromI32(0));
}