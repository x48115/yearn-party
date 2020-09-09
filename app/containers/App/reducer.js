import produce from 'immer';
import tokens from 'tokens';
import { balanceTransform } from 'utils/string';
import * as c from './constants';

// The initial state of the App
export const initialState = {
  vaults: [],
  tokens,
  walletBalance: '0.00',
  vaultBalance: '0.00',
  connected: false,
  ready: false,
  loading: {
    vaultApy: true,
    vaultPrices: true,
    vaultPositions: true,
  },
};

const mergeByAddress = (oldData, newData) => {
  const unwrappedOldData = _.map(oldData, (val, key) => val);
  const mergedData = _.merge(
    _.keyBy(unwrappedOldData, 'address'),
    _.keyBy(newData, 'address'),
  );
  return mergedData;
};

/* eslint-disable default-case, no-param-reassign */
const appReducer = (state = initialState, action) =>
  produce(state, draft => {
    const setReadyState = () => {
      const { loading } = draft;
      const ready = !loading.vaults;
      draft.ready = ready;
    };

    const addOpenPosition = (acc, vault) => {
      const { priceUsd, openDeposits } = vault;
      if (priceUsd && openDeposits) {
        const openDepositsUsd = balanceTransform(openDeposits) * priceUsd;
        vault.openDepositsUsd = openDepositsUsd;
        acc.push(vault);
      }
      return acc;
    };

    const addEarningsUsd = (acc, vault) => {
      const { priceUsd, earnings } = vault;
      if (priceUsd && earnings) {
        const earningsUsd = balanceTransform(earnings) * priceUsd;
        vault.earningsUsd = earningsUsd;
        acc.push(vault);
      }
      return acc;
    };

    const getTotalOpenBalanceUsd = (acc, vault) => {
      const { openDepositsUsd } = vault;
      if (openDepositsUsd) {
        acc += openDepositsUsd;
      }
      return acc;
    };

    const getAggregateApy = (acc, vault, totalOpenBalanceUsd) => {
      const { openDepositsUsd, apyOneDaySample } = vault;
      const ratio = openDepositsUsd / totalOpenBalanceUsd;
      const weightedApy = ratio * parseFloat(apyOneDaySample);
      acc += weightedApy;
      return acc;
    };

    const addOpenPositions = vaults => {
      const vaultsWithOpenPositions = _.reduce(vaults, addOpenPosition, []);
      const vaultsWithEarningsUsd = _.reduce(vaults, addEarningsUsd, []);

      const totalOpenBalanceUsd = _.reduce(
        vaultsWithOpenPositions,
        getTotalOpenBalanceUsd,
        0,
      );
      const aggregateApy = _.reduce(
        vaultsWithOpenPositions,
        (acc, vault) => getAggregateApy(acc, vault, totalOpenBalanceUsd),
        0,
      );

      const getTotalVaultEarningsUsd = (acc, vault) => {
        const { earningsUsd } = vault;
        if (!earningsUsd) {
          return acc;
        }
        acc += earningsUsd;
        return acc;
      };

      const totalVaultEarningsUsd = _.reduce(
        vaults,
        getTotalVaultEarningsUsd,
        0,
      );

      draft.totals = {
        totalVaultEarningsUsd,
        totalOpenBalanceUsd,
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
      case c.VAULTS_APY_LOADED: {
        const oldVaults = state.vaults;
        const updatedVaults = action.vaults;
        const mergedVaults = mergeByAddress(oldVaults, updatedVaults);
        draft.vaults = mergedVaults;
        draft.loading.vaultApy = false;
        break;
      }
      case c.VAULTS_UPDATED: {
        const oldVaults = state.vaults;
        const updatedVaults = action.vaults;
        const mergedVaults = mergeByAddress(oldVaults, updatedVaults);
        addOpenPositions(mergedVaults);
        draft.vaults = mergedVaults;
        break;
      }
      case c.PRICES_LOADED: {
        const oldVaults = state.vaults;
        const updatedVaults = action.vaults;
        const mergedVaults = mergeByAddress(oldVaults, updatedVaults);
        draft.vaults = mergedVaults;
        addOpenPositions(mergedVaults);
        draft.loading.vaultPrices = false;
        break;
      }
      case c.VAULT_POSITIONS_LOADED: {
        const positionsByVault = action.vaults;
        const vaults = _.clone(state.vaults);
        draft.vaultPositions = positionsByVault;

        const aggregateEarnings = (acc, position) => {
          const earned = position.earned ? parseInt(position.earned, 10) : 0;
          acc = acc + earned;
          return acc;
        };

        const aggregateDeposits = (acc, position) => {
          const deposit = parseInt(position.deposit, 10);
          acc = acc + deposit;
          return acc;
        };

        const injectEarningsAndDepositsIntoVaults = vaultPosition => {
          const { address, positions } = vaultPosition;
          const earnings = _.reduce(positions, aggregateEarnings, 0);
          const deposits = _.reduce(positions, aggregateDeposits, 0);
          const vault = _.find(vaults, { address });
          vault.earnings = earnings;
          vault.deposits = deposits;
        };
        _.each(positionsByVault, injectEarningsAndDepositsIntoVaults);
        draft.vaults = vaults;
        draft.loading.vaultPositions = false;
        break;
      }
      case c.WEB3_WAITING: {
        const { waiting } = action;
        draft.web3Waiting = waiting;
        if (waiting) {
          draft.showConfirmationModal = true;
        } else {
          draft.showConfirmationModal = false;
        }
        break;
      }
      case c.SHOW_CONNECTOR_MODAL:
        draft.showConnectorModal = action.showModal;
        break;
      case c.SHOW_CONFIRMATION_MODAL:
        draft.showConfirmationModal = action.showModal;
        break;
      case c.UPDATE_APPROVED_TOKENS:
        draft.confirmationModalTokens = _.clone(action.tokens);
        break;
      case c.PRICES_LOADED: {
        const oldVaults = state.vaults;
        const updatedVaults = action.vaults;
        const oldVaultsMapped = _.map(oldVaults, vault => vault);
        const mergedVaults = mergeByAddress(oldVaults, updatedVaults);
        draft.vaults = mergedVaults;
        draft.loading.prices = false;
        break;
      }
      case c.UPDATE_MODAL_STATE:
        draft.modalState = action.newState;
        draft.modalMetadata = action.metadata;
        break;
      case c.WALLET_LOADED: {
        const walletTokens = action.payload;
        const getBalance = (acc, token) => {
          const { balance, decimals, vault } = token;
          const balanceFloat = balance / 10 ** decimals;
          if (vault) {
            acc.vaultBalance += balanceFloat;
          } else {
            acc.walletBalance += balanceFloat;
          }
          return acc;
        };
        const { vaultBalance, walletBalance } = _.reduce(
          walletTokens,
          getBalance,
          { vaultBalance: 0, walletBalance: 0 },
        );
        _.reduce();
        draft.tokens = walletTokens;
        draft.walletBalance = walletBalance;
        draft.vaultBalance = vaultBalance;
        draft.loading.wallet = false;
        break;
      }
      case c.START_LOADING_WALLET:
        draft.loading.wallet = true;
        break;
    }

    // Set ready state
    setReadyState();
  });

export default appReducer;
