import {
  assert,
  describe,
  logStore,
  newMockEvent,
  createMockedFunction
} from "matchstick-as/assembly/index";
import { AssignedTreeVerifiedWithSign  } from "../generated/TreeFactory/ITreeFactory";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { handleAssignedTreeVerifiedOffchain } from "../src/mappings/TreeFactory";
import { Planter, Tree } from "../generated/schema";
import { log } from "matchstick-as";

export function createNewAssignedTreeVerifiedWithSignEvent(
  tokenId: BigInt
): AssignedTreeVerifiedWithSign {
  let newAssignedTreeVerifiedWithSignEvent = changetype<AssignedTreeVerifiedWithSign>(newMockEvent());

  newAssignedTreeVerifiedWithSignEvent.parameters = new Array();

  let tokenIdParam = new ethereum.EventParam(
    "tokenId",
    ethereum.Value.fromUnsignedBigInt(tokenId)
  );

  newAssignedTreeVerifiedWithSignEvent.parameters.push(tokenIdParam);

  return newAssignedTreeVerifiedWithSignEvent;
}

describe("Test tree event", () => {

  
  let planter = new Planter(Address.fromString("0x680da7f9a4A3C1Ba9437FFEb90813855F686280C").toString())

  planter.planterType = BigInt.fromString("1");
  planter.status = BigInt.fromString("1");
  planter.countryCode = "asdsa";
  planter.score = BigInt.fromI32(0);
  planter.supplyCap = BigInt.fromI32(0);
  planter.plantedCount = BigInt.fromI32(0);
  planter.longitude = BigInt.fromI32(0);
  planter.latitude = BigInt.fromI32(0);

  planter.invitedBy = null;
  planter.memberOf = null;
  planter.createdAt = BigInt.fromString("1687451231124");
  planter.updatedAt = BigInt.fromString("1687451231124");

  planter.organizationShare = BigInt.fromI32(0);
  planter.memberCount = BigInt.fromI32(0);
  planter.invitedCount = BigInt.fromI32(0);
  planter.balance = BigInt.fromI32(0);
  planter.balanceProjected = BigInt.fromI32(0);


  planter.verifiedPlantedCount = BigInt.fromI32(0);
  planter.totalOrganizationPlantedCount = BigInt.fromI32(0);
  planter.totalOrganizationVerifiedPlantedCount = BigInt.fromI32(0);
  planter.regularPlantedCount = BigInt.fromI32(0);
  planter.regularVerifiedPlantedCount = BigInt.fromI32(0);
  planter.organizationRegularPlantedCount = BigInt.fromI32(0);
  planter.organizationRegularVerifiedPlantedCount = BigInt.fromI32(0);

  planter.nonce = BigInt.fromI32(0);

  planter.planterType == BigInt.fromString("1")


  planter.save();


  
  let tree = new Tree("0xa");

  tree.planter = "0x680da7f9a4A3C1Ba9437FFEb90813855F686280C"
  tree.createdAt = BigInt.fromString("1687451231124");

  tree.species = new BigInt(0);
  tree.saleType = BigInt.fromI32(0);
  tree.countryCode = '';
  tree.soldType = new BigInt(0);
  tree.requestId = "";
  tree.treeStatus = BigInt.fromI32(0);
  tree.plantDate = BigInt.fromI32(0);
  tree.birthDate = BigInt.fromI32(0);
  tree.treeSpecs = '';
  tree.updatedAt = BigInt.fromString("1687451231124");

  tree.save()




  let newTreeTransferEvent = createNewAssignedTreeVerifiedWithSignEvent(
    BigInt.fromString("10")
  );

  newTreeTransferEvent.address = Address.fromString("0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7")


  createMockedFunction(Address.fromString("0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7"),"trees","trees(uint256):(address,uint256,uint32,uint32,uint64,uint64,uint64,string)").withArgs([ethereum.Value.fromUnsignedBigInt(BigInt.fromString("10"))]).returns([
    ethereum.Value.fromAddress(Address.fromString("0x680da7f9a4A3C1Ba9437FFEb90813855F686280C")),
    ethereum.Value.fromUnsignedBigInt(BigInt.fromString("1")),
    ethereum.Value.fromUnsignedBigInt(BigInt.fromString("23")),
    ethereum.Value.fromUnsignedBigInt(BigInt.fromString("4")),
    ethereum.Value.fromUnsignedBigInt(BigInt.fromString("5")),
    ethereum.Value.fromUnsignedBigInt(BigInt.fromString("6")),
    ethereum.Value.fromUnsignedBigInt(BigInt.fromString("7")),
    ethereum.Value.fromString("sdsds"),
  ])

  createMockedFunction(Address.fromString("0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7"),"plantersNonce","plantersNonce(address):(uint256)").withArgs([ethereum.Value.fromAddress(Address.fromString("0x680da7f9a4A3C1Ba9437FFEb90813855F686280C")),
]).returns([
    ethereum.Value.fromUnsignedBigInt(BigInt.fromString("20"))
  ])


  handleAssignedTreeVerifiedOffchain(newTreeTransferEvent);

  // logStore();

 
  // assert.fieldEquals(
  //   "Transfer",
  //   "10",
  //   "owner",
  //   "0xe8b6699d2b6b83ba305e4a1e78be499ee3119576"
  // );

  // let entity = Transfer.load("10");

  // if (entity != null) {
  //   log.info(entity.id.toString(), []);
  // }
});
