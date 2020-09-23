import produce from 'immer';
import BigNumber from 'bignumber.js';
import * as c from './constants';

// The initial state of the App
export const initialState = {
  vaults: [],
  connected: false,
  ready: false,
  loading: {
    vaultPrices: true,
    vaults: true,
  },
  totals: {
    totalVaultEarningsUsd: 0,
    totalDepositedAmountUsd: 0,
    aggregateApy: 0,
  },
};

const mergeByAddress = (oldData, newData) => {
  const mergedData = _.merge(
    _.keyBy(oldData, 'address'),
    _.keyBy(newData, 'address'),
  );
  return mergedData;
};

/* eslint-disable default-case, no-param-reassign */
const appReducer = (state = initialState, action) =>
  produce(state, draft => {
    const getTotalDepositedUsd = (acc, vault) => {
      const { depositedAmountUsd } = vault;
      if (depositedAmountUsd) {
        acc = acc.plus(depositedAmountUsd);
      }
      return acc;
    };

    const addEarningsAndDepositsUsd = vault => {
      const { priceUsd, earnings, depositedAmount } = vault;
      if (priceUsd && earnings) {
        vault.earningsUsd = new BigNumber(earnings).times(priceUsd).toFixed();
      }
      if (priceUsd && depositedAmount) {
        vault.depositedAmountUsd = new BigNumber(depositedAmount)
          .dividedBy(10 ** 18)
          .times(priceUsd)
          .toFixed();
      }
      return vault;
    };

    const getAggregateApy = (acc, vault, totalDepositedAmountUsd) => {
      const { depositedAmountUsd, apyOneWeekSample } = vault;
      let ratio;
      if (totalDepositedAmountUsd !== '0') {
        ratio = depositedAmountUsd / totalDepositedAmountUsd;
      } else {
        // divide by zero
        ratio = 1;
      }
      const weightedApy = ratio * parseFloat(apyOneWeekSample);
      acc += weightedApy;
      return acc;
    };

    const addEarnings = vaults => {
      const newVaults = _.map(vaults, addEarningsAndDepositsUsd);

      const totalDepositedAmountUsd = _.reduce(
        newVaults,
        getTotalDepositedUsd,
        new BigNumber(0),
      ).toFixed();

      const aggregateApy = _.reduce(
        newVaults,
        (acc, vault) => getAggregateApy(acc, vault, totalDepositedAmountUsd),
        0,
      );

      const getTotalVaultEarningsUsd = (acc, vault) => {
        const { earningsUsd } = vault;
        if (!earningsUsd) {
          return acc;
        }
        acc = acc.plus(earningsUsd);
        return acc;
      };

      const totalVaultEarningsUsd = _.reduce(
        vaults,
        getTotalVaultEarningsUsd,
        new BigNumber(0),
      ).toNumber();

      draft.totals = {
        totalVaultEarningsUsd,
        totalDepositedAmountUsd,
        aggregateApy,
      };
    };

    switch (action.type) {
      case c.CONNECTION_CONNECTED:
        draft.account = action.account;
        draft.connector = action.connector;
        draft.library = action.library;
        draft.chainId = action.chainId;
        draft.connected = true;
        draft.ready = false;
        break;
      case c.CONNECTION_UPDATED:
        draft.library = action.library;
        draft.chainId = action.chainId;
        draft.connected = action.active;
        break;
      case c.PRICES_LOADED: {
        const oldVaults = state.vaults;
        const updatedVaults = action.vaults;
        const mergedVaults = mergeByAddress(oldVaults, updatedVaults);
        draft.vaults = mergedVaults;
        addEarnings(mergedVaults);
        draft.loading.vaultPrices = false;
        break;
      }
      case c.VAULTS_LOADED: {
        const oldVaults = _.clone(state.vaults);
        const updatedVaults = action.vaults;
        const mergedVaults = mergeByAddress(oldVaults, updatedVaults);
        addEarnings(mergedVaults);
        draft.vaults = mergedVaults;
        draft.loading.vaults = false;
        break;
      }
      case c.SHOW_CONNECTOR_MODAL:
        draft.showConnectorModal = action.showModal;
        break;
    }
  });

export default appReducer;
