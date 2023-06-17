import {
  assert,
  describe,
  logStore,
  newMockEvent,
} from "matchstick-as/assembly/index";
import { AssignedTreeVerifiedWithSign  } from "../generated/TreeFactory/ITreeFactory";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { handleAssignedTreeVerifiedOffchain } from "../src/mappings/TreeFactory";
import { Tree } from "../generated/schema";
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

  let tree = new Tree("10");

  tree.planter = "0x680da7f9a4A3C1Ba9437FFEb90813855F686280C"
  
  tree.save()


  let newTreeTransferEvent = createNewAssignedTreeVerifiedWithSignEvent(
    BigInt.fromString("10")
  );

  // handleAssignedTreeVerifiedOffchain(newTreeTransferEvent);

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
