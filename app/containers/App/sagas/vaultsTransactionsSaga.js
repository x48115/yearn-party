import Web3 from 'web3';
import tokens from 'tokens';
import { request, gql } from 'graphql-request';
import BigNumber from 'big-number';

import * as r from 'redux-saga/effects';
import * as s from 'containers/App/selectors';
import * as a from 'containers/App/actions';
import * as c from 'containers/App/constants';

const pollPeriod = 45000;

export function* poll() {
  const url = 'https://api.thegraph.com/subgraphs/name/x48-crypto/yearn';
  const vaults = yield r.select(s.selectVaults());
  const account = yield r.select(s.selectAccount());

  const query = gql`
    {
      vaults {
        id
        getPricePerFullShare
      }
      deposits(
        where: { account: "${account}" }
      ) {
        id
        vaultAddress
        amount
        shares
        getPricePerFullShare
        timestamp
        blockNumber
      }
      withdraws(
        where: { account: "${account}" }
      ) {
        id
        vaultAddress
        amount
        shares
        timestamp
        blockNumber
      }
    }
  `;

  const addTransactionType = (transaction, transactionType) => {
    transaction.type = transactionType;
    transaction.address = transaction.vaultAddress;
    delete transaction['vault'];
    return transaction;
  };

  const aggregatePosition = position => {
    const { deposits, withdrawal } = position;
    const earliestDeposit = _.last(deposits);
    const hasWithdraw = _.size(withdrawal) > 0;
    const withdrawalAmount = withdrawal.amount;
    const withdrawalTime = withdrawal.timestamp;

    // Edge case where we have a withdraw with no deposit.. not valid
    if (!earliestDeposit) {
      const withdrawPosition = {
        exit: withdrawalTime,
        withdraw: withdrawalAmount,
        earned: '0',
        depositPricePerFullShare: 0,
      };
      return withdrawPosition;
    }

    const depositTime = earliestDeposit && earliestDeposit.timestamp;
    const depositPricePerFullShare = earliestDeposit.getPricePerFullShare;
    const aggregateDeposit = new BigNumber(0);

    const aggregateDeposits = (acc, deposit) => {
      acc.add(deposit.amount);
      return acc;
    };

    const depositAmount = _.reduce(
      deposits,
      aggregateDeposits,
      aggregateDeposit,
    );

    let earnings;
    if (withdrawal.amount) {
      earnings = withdrawal.amount - depositAmount.val();
    }

    const earned = earnings;

    const newPosition = {
      enter: depositTime,
      exit: withdrawalTime,
      depositPricePerFullShare,
      deposit: depositAmount.toString(),
      withdraw: withdrawalAmount,
      earned,
    };
    return newPosition;
  };

  while (true) {
    console.log('Fetch transactions');

    try {
      const resp = yield request(url, query);
      console.log('Graph response', resp);
      const deposits = resp.deposits;
      const withdrawals = resp.withdraws;
      const vaults = resp.vaults;

      const depositsWithType = _.map(deposits, transaction =>
        addTransactionType(transaction, 'deposit'),
      );
      const withdrawalsWithType = _.map(withdrawals, transaction =>
        addTransactionType(transaction, 'withdraw'),
      );
      const transactionsWithType = [
        ...depositsWithType,
        ...withdrawalsWithType,
      ];

      const orderedTransactions = _.orderBy(
        transactionsWithType,
        ['timestamp'],
        ['desc'],
      );

      const orderedTransactionAsc = _.orderBy(
        transactionsWithType,
        ['timestamp'],
        ['asc'],
      );

      const transactionsByAddress = _.groupBy(orderedTransactionAsc, 'address');

      const getPositionsForAddress = (transactions, address) => {
        const emptyPosition = {
          deposits: [],
          withdrawal: {},
        };

        const positions = [];
        let currentPosition = _.clone(emptyPosition);

        const addPosition = transaction => {
          const { deposits } = currentPosition;
          let exitPosition = false;
          const {
            type,
            amount,
            timestamp,
            getPricePerFullShare: currentTransactionPricePerFullShare,
          } = transaction;
          const currentPositionHasDeposits = _.size(deposits) > 0;
          const previousDeposit = _.last(deposits);
          if (type === 'deposit') {
            deposits.unshift(transaction);
          } else if (type === 'withdraw') {
            currentPosition.withdrawal = transaction;
            exitPosition = true;
          }
          if (!currentPositionHasDeposits) {
            positions.push(currentPosition);
          }
          if (exitPosition) {
            currentPosition = {
              deposits: [],
              withdrawal: {},
            };
          }
        };
        _.each(transactions, addPosition);
        const positionsDesc = _.reverse(positions);

        const aggregatedPositions = _.map(positionsDesc, aggregatePosition);
        const aggregatedPositionsForVault = {
          address,
          positions: aggregatedPositions,
        };
        return aggregatedPositionsForVault;
      };

      const aggregatedPositionsByVault = _.map(
        transactionsByAddress,
        getPositionsForAddress,
      );

      const injectAddress = vault => {
        const newVault = vault;
        vault.address = vault.id;
        delete vault.id;
        return newVault;
      };
      const vaultsWithAddress = _.map(vaults, injectAddress);

      const openPositions = [];

      const injectOpenPositionEarnings = vaultPosition => {
        const { positions, address: vaultAddress } = vaultPosition;

        const mostRecentPosition = _.first(positions);
        const mostRecentPositionOpen = !mostRecentPosition.exit;
        if (mostRecentPositionOpen) {
          mostRecentPosition.open = true;
          const vault = _.find(vaults, { address: vaultAddress });
          const currentPricePerFullShare = vault.getPricePerFullShare;
          const { depositPricePerFullShare, deposit } = mostRecentPosition;
          const earnRatio = currentPricePerFullShare / depositPricePerFullShare;
          const earnings = deposit * earnRatio - deposit;
          mostRecentPosition.open = true;
          mostRecentPosition.earned = earnings;
          const openPosition = {
            address: vaultAddress,
            openDeposits: deposit,
          };
          vaultPosition.openDeposits = deposit;
          openPositions.push(openPosition);
        }
        return vaultPosition;
      };

      const aggregatedPositionsByVaultAllEarnings = _.map(
        aggregatedPositionsByVault,
        injectOpenPositionEarnings,
      );

      const hasOpenPositions = _.size(openPositions) > 0;
      if (hasOpenPositions) {
        yield r.put(a.vaultsUpdated(openPositions));
      }
      console.log(
        'Aggregated positions by vault address',
        aggregatedPositionsByVault,
      );
      console.log('Transactions by vault address', transactionsByAddress);

      yield r.put(
        a.vaultPositionsLoaded(aggregatedPositionsByVaultAllEarnings),
      );
      yield r.put(a.vaultsUpdated(vaultsWithAddress));
    } catch (err) {
      console.log('Error reading transactions', err);
    }
    yield r.delay(pollPeriod);
  }
}

export function* startPolling() {
  yield r.put(a.startLoadingVaultPositions());
}

export default function* initialize() {
  yield r.takeLatest(c.VAULTS_APY_LOADED, startPolling);
  while (true) {
    yield r.take(c.START_LOADING_VAULT_TRANSACTIONS);
    yield r.race([r.call(poll), r.take(c.VAULTS_APY_LOADED)]);
  }
}
