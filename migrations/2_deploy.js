const AltBn128 = artifacts.require("AltBn128");
const LSAG = artifacts.require("LSAG");
const Hurricash = artifacts.require("Hurricash");

module.exports = async (deployer) => {
  await deployer.deploy(AltBn128);
  await deployer.link(AltBn128, LSAG);
  await deployer.deploy(LSAG);
  await deployer.link(LSAG, Hurricash);
  await deployer.link(AltBn128, Hurricash);
  await deployer.deploy(Hurricash);
};
