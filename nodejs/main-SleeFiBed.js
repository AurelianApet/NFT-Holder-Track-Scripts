const Moralis = require("moralis").default;
const { EvmChain } = require("@moralisweb3/common-evm-utils");
const fs = require("fs");
var Web3 = require('web3')
var web3 = new Web3("https://avalanche-mainnet.infura.io/v3/c4830c4aa65e4eda8715f62b1cc6e211")
let abi = require("./abi.json").abi;

const runApp = async () => {
  await Moralis.start({
    apiKey: "S1K1TgaGCwJTEio3Z5kmNKY03M4S23LwJmhZJcYcRt01J9PHao6rtX9HSFg2Tu3n",
    // ...and any other configuration
  });

  const address = "0x305ECD06b01a703271d5145344c3e0bAd90c8871";

  const chain = EvmChain.AVALANCHE;

  let cursor = null;
  let ownerAddress = [];
  let owners = {};

  do {
    const responseJSON = await Moralis.EvmApi.nft.getNFTOwners({
      address,
      chain,
      limit: 100,
      cursor: cursor,
    });

    const response  = responseJSON.toJSON();
    console.log(
      `Got page ${response.page} of ${Math.ceil(
        response.total / response.page_size
      )}, ${response.total} total`
    );

    for (const owner of response.result) {
      owners[owner.owner_of] = {
        tokenId: owner.token_id
      };
    }
    cursor = response.cursor;
  } while (cursor != "" && cursor != null);

  console.log("total owners:", Object.keys(owners).length);

  var contract = new web3.eth.Contract(abi, address)

  const keys = Object.keys(owners);
  for (let index = 0; index < keys.length; index++) {
    const owaddress = keys[index];
    console.log("owaddress", owaddress)
    let nftbalance = await contract.methods.balanceOf(owaddress).call();
    console.log("NFT", nftbalance)
    owners[owaddress] = {
      amount: nftbalance
    }
  }
  fs.writeFileSync("./NFTHolderInfo.json", JSON.stringify(owners));
};

runApp();
