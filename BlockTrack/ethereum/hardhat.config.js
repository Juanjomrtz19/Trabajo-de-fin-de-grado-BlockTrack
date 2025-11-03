// hardhat.config.js (ESM)
export default {
  solidity: '0.8.20',
  networks: {
    hardhat: {
      type: 'edr-simulated',
      chainType: 'l1',
      accounts: { count: 20 },
    },
  },
};
