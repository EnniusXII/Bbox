const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const GreenCardModule = buildModule("GreenCardModule", (m) => {
  const greenCard = m.contract("GreenCardHashes", []);

  return { contracts: { greenCard } };
});

module.exports = GreenCardModule;