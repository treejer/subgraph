import {
  assert,
  describe,
  newMockEvent,
  createMockedFunction,
  mockIpfsFile,
  test,
  beforeAll,
  afterAll,
  afterEach,
  clearStore,
  beforeEach
} from "matchstick-as/assembly/index";
import { AssignedTreeVerifiedWithSign, TreeUpdatedVerifiedWithSign, TreeVerifiedWithSign  } from "../generated/TreeFactory/ITreeFactory";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { handleAssignedTreeVerifiedOffchain, handleTreeUpdatedVerifiedOffchain, handleTreeVerifiedOffchain } from "../src/mappings/TreeFactory";
import { Planter, Tree, TreeUpdate } from "../generated/schema";

function createNewAssignedTreeVerifiedWithSignEvent(
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

function createNewTreeVerifiedWithSignEvent(
  tokenId: BigInt,
  planter:Address,
  nonce:BigInt,
): TreeVerifiedWithSign {
  let newTreeVerifiedWithSignEvent = changetype<TreeVerifiedWithSign>(newMockEvent());

  newTreeVerifiedWithSignEvent.parameters = new Array();

  let tokenIdParam = new ethereum.EventParam(
    "tokenId",
    ethereum.Value.fromUnsignedBigInt(tokenId)
  );

  let planterParam = new ethereum.EventParam(
    "nonce",
    ethereum.Value.fromAddress(planter)
  );


  let nonceParam = new ethereum.EventParam(
    "nonce",
    ethereum.Value.fromUnsignedBigInt(nonce)
  );

  newTreeVerifiedWithSignEvent.parameters.push(tokenIdParam);
  newTreeVerifiedWithSignEvent.parameters.push(planterParam);
  newTreeVerifiedWithSignEvent.parameters.push(nonceParam);


  return newTreeVerifiedWithSignEvent;
}

function createNewTreeUpdatedVerifiedWithSignEvent(
  tokenId: BigInt
): TreeUpdatedVerifiedWithSign {
  let newTreeUpdatedVerifiedWithSignEvent = changetype<TreeUpdatedVerifiedWithSign>(newMockEvent());

  newTreeUpdatedVerifiedWithSignEvent.parameters = new Array();

  let tokenIdParam = new ethereum.EventParam(
    "tokenId",
    ethereum.Value.fromUnsignedBigInt(tokenId)
  );

  newTreeUpdatedVerifiedWithSignEvent.parameters.push(tokenIdParam);

  return newTreeUpdatedVerifiedWithSignEvent;
}


describe("test offchain planting", () => {

  beforeEach(() => {

    clearStore()


    let planter = new Planter("0x680da7f9a4a3c1ba9437ffeb90813855f686280c")


    planter.planterType = BigInt.fromString("1");
    planter.status = BigInt.fromString("1");
    planter.countryCode = "asdsa";
    planter.score = BigInt.fromI32(0);
    planter.supplyCap = BigInt.fromI32(1);
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
  
    planter.nonce = BigInt.fromI32(10);
  
    planter.planterType == BigInt.fromString("1")
  
  
    planter.save();
  
  
    

    
  })

  test("handleAssignedTreeVerifiedOffchain must be excuted correctly", () => {

    let tree = new Tree("0xa");
  
    tree.planter = "0x680da7f9a4a3c1ba9437ffeb90813855f686280c"
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
  
    newTreeTransferEvent.address = Address.fromString("0x89205a3a3b2a69de6dbf7f01ed13b2108b2c43e7")
  
    createMockedFunction(Address.fromString("0x89205a3a3b2a69de6dbf7f01ed13b2108b2c43e7"),"trees","trees(uint256):(address,uint256,uint32,uint32,uint64,uint64,uint64,string)").withArgs([ethereum.Value.fromUnsignedBigInt(BigInt.fromString("10"))]).returns([
      ethereum.Value.fromAddress(Address.fromString("0x680da7f9a4a3c1ba9437ffeb90813855f686280c")),
      ethereum.Value.fromUnsignedBigInt(BigInt.fromString("1")),
      ethereum.Value.fromUnsignedBigInt(BigInt.fromString("23")),
      ethereum.Value.fromUnsignedBigInt(BigInt.fromString("4")),
      ethereum.Value.fromUnsignedBigInt(BigInt.fromString("5")),
      ethereum.Value.fromUnsignedBigInt(BigInt.fromString("6")),
      ethereum.Value.fromUnsignedBigInt(BigInt.fromString("7")),
      ethereum.Value.fromString("ipfsMockFile"),
    ])
  
    createMockedFunction(Address.fromString("0x89205a3a3b2a69de6dbf7f01ed13b2108b2c43e7"),"plantersNonce","plantersNonce(address):(uint256)").withArgs([ethereum.Value.fromAddress(Address.fromString("0x680da7f9a4a3c1ba9437ffeb90813855f686280c")),
  ]).returns([
      ethereum.Value.fromUnsignedBigInt(BigInt.fromString("20"))
    ])
  
  
    mockIpfsFile("ipfsMockFile","./tests/file.txt")
  
  
    
    handleAssignedTreeVerifiedOffchain(newTreeTransferEvent);
  
  
    //-----------------------------------> check tree data
  
  
    assert.fieldEquals(
      "Tree",
      "0xa",
      "updatedAt",
      "1"
    );
  
    assert.fieldEquals(
      "Tree",
      "0xa",
      "createdAt",
      "1687451231124"
    );
  
    assert.fieldEquals(
      "Tree",
      "0xa",
      "planter",
      "0x680da7f9a4a3c1ba9437ffeb90813855f686280c"
    );
  
  
    assert.fieldEquals(
      "Tree",
      "0xa",
      "species",
      "1"
    );
  
    assert.fieldEquals(
      "Tree",
      "0xa",
      "countryCode",
      "23"
    );
  
  
    assert.fieldEquals(
      "Tree",
      "0xa",
      "saleType",
      "4"
    );
  
  
    assert.fieldEquals(
      "Tree",
      "0xa",
      "treeStatus",
      "5"
    );
  
    assert.fieldEquals(
      "Tree",
      "0xa",
      "plantDate",
      "6"
    );
  
    assert.fieldEquals(
      "Tree",
      "0xa",
      "birthDate",
      "7"
    );
  
    assert.fieldEquals(
      "Tree",
      "0xa",
      "treeSpecs",
      "ipfsMockFile"
    );
  
  
  
    //-----------------------------------> check treeUpdate data
  
    assert.fieldEquals(
      "TreeUpdate",
      "0x0",
      "createdAt",
      "1"
    );
  
    assert.fieldEquals(
      "TreeUpdate",
      "0x0", 
      "updatedAt",
      "1"
    );
  
    assert.fieldEquals(
      "TreeUpdate",
      "0x0",
      "tree",
      "0xa"
    );
  
    assert.fieldEquals(
      "TreeUpdate",
      "0x0",
      "updateStatus",
      "3"
    );
  
    assert.fieldEquals(
      "TreeUpdate",
      "0x0",
      "updateSpecs",
      "ipfsMockFile"
    );
  
    //-----------------------------------> check planter update
  
    assert.fieldEquals(
      "Planter",
      "0x680da7f9a4a3c1ba9437ffeb90813855f686280c",
      "updatedAt",
      "1"
    );
  
    assert.fieldEquals(
      "Planter",
      "0x680da7f9a4a3c1ba9437ffeb90813855f686280c",
      "createdAt",
      "1687451231124"
    );
  
  
    assert.fieldEquals(
      "Planter",
      "0x680da7f9a4a3c1ba9437ffeb90813855f686280c",
      "plantedCount",
      "1"
    );
  
    assert.fieldEquals(
      "Planter",
      "0x680da7f9a4a3c1ba9437ffeb90813855f686280c",
      "status",
      "2"
    );
  
    assert.fieldEquals(
      "Planter",
      "0x680da7f9a4a3c1ba9437ffeb90813855f686280c",
      "verifiedPlantedCount",
      "1"
    );
  
  
    assert.fieldEquals(
      "Planter",
      "0x680da7f9a4a3c1ba9437ffeb90813855f686280c",
      "status",
      "2"
    );
  
    assert.fieldEquals(
      "Planter",
      "0x680da7f9a4a3c1ba9437ffeb90813855f686280c",
      "nonce",
      "20"
    );

  })

  test("handleTreeVerifiedOffchain must be excuted correctly", () => {

    let newTreeVerifiedEvent = createNewTreeVerifiedWithSignEvent(
      BigInt.fromString("10"),
      Address.fromString("0x680da7f9a4a3c1ba9437ffeb90813855f686280c"),
      BigInt.fromString("20")
    );
  
    newTreeVerifiedEvent.address = Address.fromString("0x89205a3a3b2a69de6dbf7f01ed13b2108b2c43e7")
  
    createMockedFunction(Address.fromString("0x89205a3a3b2a69de6dbf7f01ed13b2108b2c43e7"),"trees","trees(uint256):(address,uint256,uint32,uint32,uint64,uint64,uint64,string)").withArgs([ethereum.Value.fromUnsignedBigInt(BigInt.fromString("10"))]).returns([
      ethereum.Value.fromAddress(Address.fromString("0x680da7f9a4a3c1ba9437ffeb90813855f686280c")),
      ethereum.Value.fromUnsignedBigInt(BigInt.fromString("1")),
      ethereum.Value.fromUnsignedBigInt(BigInt.fromString("23")),
      ethereum.Value.fromUnsignedBigInt(BigInt.fromString("4")),
      ethereum.Value.fromUnsignedBigInt(BigInt.fromString("5")),
      ethereum.Value.fromUnsignedBigInt(BigInt.fromString("6")),
      ethereum.Value.fromUnsignedBigInt(BigInt.fromString("7")),
      ethereum.Value.fromString("ipfsMockFile"),
    ])
  
    createMockedFunction(Address.fromString("0x89205a3a3b2a69de6dbf7f01ed13b2108b2c43e7"),"plantersNonce","plantersNonce(address):(uint256)").withArgs([ethereum.Value.fromAddress(Address.fromString("0x680da7f9a4a3c1ba9437ffeb90813855f686280c")),
  ]).returns([
      ethereum.Value.fromUnsignedBigInt(BigInt.fromString("20"))
    ])
  
  
    mockIpfsFile("ipfsMockFile","./tests/file.txt")
  
  
    
    handleTreeVerifiedOffchain(newTreeVerifiedEvent);
  
  
    //-----------------------------------> check tree data
  
  
    assert.fieldEquals(
      "Tree",
      "0xa",
      "updatedAt",
      "1"
    );
  
    assert.fieldEquals(
      "Tree",
      "0xa",
      "createdAt",
      "1"
    );
  
    assert.fieldEquals(
      "Tree",
      "0xa",
      "planter",
      "0x680da7f9a4a3c1ba9437ffeb90813855f686280c"
    );
  
  
    assert.fieldEquals(
      "Tree",
      "0xa",
      "species",
      "1"
    );
  
    assert.fieldEquals(
      "Tree",
      "0xa",
      "countryCode",
      "23"
    );
  
  
    assert.fieldEquals(
      "Tree",
      "0xa",
      "saleType",
      "4"
    );
  
  
    assert.fieldEquals(
      "Tree",
      "0xa",
      "treeStatus",
      "5"
    );
  
    assert.fieldEquals(
      "Tree",
      "0xa",
      "plantDate",
      "6"
    );
  
    assert.fieldEquals(
      "Tree",
      "0xa",
      "birthDate",
      "7"
    );
  
    assert.fieldEquals(
      "Tree",
      "0xa",
      "treeSpecs",
      "ipfsMockFile"
    );
  
  
  
    //-----------------------------------> check treeUpdate data
  
    assert.fieldEquals(
      "TreeUpdate",
      "0x0",
      "createdAt",
      "1"
    );
  
    assert.fieldEquals(
      "TreeUpdate",
      "0x0", 
      "updatedAt",
      "1"
    );
  
    assert.fieldEquals(
      "TreeUpdate",
      "0x0",
      "tree",
      "0xa"
    );
  
    assert.fieldEquals(
      "TreeUpdate",
      "0x0",
      "updateStatus",
      "3"
    );
  
    assert.fieldEquals(
      "TreeUpdate",
      "0x0",
      "updateSpecs",
      "ipfsMockFile"
    );
  
    //-----------------------------------> check planter update
  
    assert.fieldEquals(
      "Planter",
      "0x680da7f9a4a3c1ba9437ffeb90813855f686280c",
      "updatedAt",
      "1"
    );
  
    assert.fieldEquals(
      "Planter",
      "0x680da7f9a4a3c1ba9437ffeb90813855f686280c",
      "createdAt",
      "1687451231124"
    );
  
  
    assert.fieldEquals(
      "Planter",
      "0x680da7f9a4a3c1ba9437ffeb90813855f686280c",
      "plantedCount",
      "1"
    );
  
    assert.fieldEquals(
      "Planter",
      "0x680da7f9a4a3c1ba9437ffeb90813855f686280c",
      "status",
      "2"
    );
  
    assert.fieldEquals(
      "Planter",
      "0x680da7f9a4a3c1ba9437ffeb90813855f686280c",
      "verifiedPlantedCount",
      "1"
    );
  
  
    assert.fieldEquals(
      "Planter",
      "0x680da7f9a4a3c1ba9437ffeb90813855f686280c",
      "status",
      "2"
    );
  
    assert.fieldEquals(
      "Planter",
      "0x680da7f9a4a3c1ba9437ffeb90813855f686280c",
      "nonce",
      "20"
    );    
  })

  test("handleTreeUpdatedVerifiedOffchain must be excuted correctly", () => {


    let tree = new Tree("0xa");
  
    tree.planter = "0x680da7f9a4a3c1ba9437ffeb90813855f686280c"
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

    let newTreeUpdatedVerifiedEvent = createNewTreeUpdatedVerifiedWithSignEvent(
      BigInt.fromString("10")
    );
  
    newTreeUpdatedVerifiedEvent.address = Address.fromString("0x89205a3a3b2a69de6dbf7f01ed13b2108b2c43e7")
  
    createMockedFunction(Address.fromString("0x89205a3a3b2a69de6dbf7f01ed13b2108b2c43e7"),"trees","trees(uint256):(address,uint256,uint32,uint32,uint64,uint64,uint64,string)").withArgs([ethereum.Value.fromUnsignedBigInt(BigInt.fromString("10"))]).returns([
      ethereum.Value.fromAddress(Address.fromString("0x680da7f9a4a3c1ba9437ffeb90813855f686280c")),
      ethereum.Value.fromUnsignedBigInt(BigInt.fromString("1")),
      ethereum.Value.fromUnsignedBigInt(BigInt.fromString("23")),
      ethereum.Value.fromUnsignedBigInt(BigInt.fromString("4")),
      ethereum.Value.fromUnsignedBigInt(BigInt.fromString("5")),
      ethereum.Value.fromUnsignedBigInt(BigInt.fromString("6")),
      ethereum.Value.fromUnsignedBigInt(BigInt.fromString("7")),
      ethereum.Value.fromString("ipfsMockFile"),
    ])
  
    createMockedFunction(Address.fromString("0x89205a3a3b2a69de6dbf7f01ed13b2108b2c43e7"),"plantersNonce","plantersNonce(address):(uint256)").withArgs([ethereum.Value.fromAddress(Address.fromString("0x680da7f9a4a3c1ba9437ffeb90813855f686280c")),
  ]).returns([
      ethereum.Value.fromUnsignedBigInt(BigInt.fromString("20"))
    ])
  
  
    mockIpfsFile("ipfsMockFile","./tests/file.txt")
  
  
    
    handleTreeUpdatedVerifiedOffchain(newTreeUpdatedVerifiedEvent);
  
  
    //-----------------------------------> check tree data
  
  
    assert.fieldEquals(
      "Tree",
      "0xa",
      "updatedAt",
      "1"
    );
  
    assert.fieldEquals(
      "Tree",
      "0xa",
      "createdAt",
      "1687451231124"
    );
  
    assert.fieldEquals(
      "Tree",
      "0xa",
      "planter",
      "0x680da7f9a4a3c1ba9437ffeb90813855f686280c"
    );
  
  
    assert.fieldEquals(
      "Tree",
      "0xa",
      "species",
      "1"
    );
  
    assert.fieldEquals(
      "Tree",
      "0xa",
      "countryCode",
      "23"
    );
  
  
    assert.fieldEquals(
      "Tree",
      "0xa",
      "saleType",
      "4"
    );
  
  
    assert.fieldEquals(
      "Tree",
      "0xa",
      "treeStatus",
      "5"
    );
  
    assert.fieldEquals(
      "Tree",
      "0xa",
      "plantDate",
      "6"
    );
  
    assert.fieldEquals(
      "Tree",
      "0xa",
      "birthDate",
      "7"
    );
  
    assert.fieldEquals(
      "Tree",
      "0xa",
      "treeSpecs",
      "ipfsMockFile"
    );
  
  
  
    //-----------------------------------> check treeUpdate data
  
    assert.fieldEquals(
      "TreeUpdate",
      "0x0",
      "createdAt",
      "1"
    );
  
    assert.fieldEquals(
      "TreeUpdate",
      "0x0", 
      "updatedAt",
      "1"
    );
  
    assert.fieldEquals(
      "TreeUpdate",
      "0x0",
      "tree",
      "0xa"
    );
  
    assert.fieldEquals(
      "TreeUpdate",
      "0x0",
      "updateStatus",
      "3"
    );
  
    assert.fieldEquals(
      "TreeUpdate",
      "0x0",
      "updateSpecs",
      "ipfsMockFile"
    );
  
    //-----------------------------------> check planter update
  
    assert.fieldEquals(
      "Planter",
      "0x680da7f9a4a3c1ba9437ffeb90813855f686280c",
      "updatedAt",
      "1"
    );
  
    assert.fieldEquals(
      "Planter",
      "0x680da7f9a4a3c1ba9437ffeb90813855f686280c",
      "createdAt",
      "1687451231124"
    );
  
  
    assert.fieldEquals(
      "Planter",
      "0x680da7f9a4a3c1ba9437ffeb90813855f686280c",
      "plantedCount",
      "0"
    );
  
    assert.fieldEquals(
      "Planter",
      "0x680da7f9a4a3c1ba9437ffeb90813855f686280c",
      "status",
      "1"
    );
  
    assert.fieldEquals(
      "Planter",
      "0x680da7f9a4a3c1ba9437ffeb90813855f686280c",
      "verifiedPlantedCount",
      "0"
    );
  

    assert.fieldEquals(
      "Planter",
      "0x680da7f9a4a3c1ba9437ffeb90813855f686280c",
      "nonce",
      "20"
    );    
  })
});
