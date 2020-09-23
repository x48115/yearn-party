import React from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import Vault from 'components/Vault';
import CountUp from 'react-countup';
import BigNumber from 'bignumber.js';
import { currencyTransform } from 'utils/string';

import * as s from 'containers/App/selectors';

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
`;

const Totals = styled.div`
  margin-top: 50px;
`;

const EarningsLabel = styled.div`
  color: 0;
  font-size: 30px;
  font-weight: bold;
`;

const EarningsText = styled.div`
  font-weight: bold;
  font-size: 73px;
`;

const Earnings = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Vaults = styled.table`
  margin-top: 50px;
`;

const Disclaimer = styled.div`
  text-align: center;
`;

export default function Component() {
  const vaults = useSelector(s.selectVaults());
  const totals = useSelector(s.selectTotals());
  let totalCounter;

  const getFutureEarningsPerHour = (currentAmount, apy) => {
    const apyRatePerHour = apy / 100 / 365 / 24;
    const futureEarningsPerHour = currentAmount * apyRatePerHour;
    return futureEarningsPerHour;
  };

  if (totals) {
    const {
      totalVaultEarningsUsd,
      totalDepositedAmountUsd,
      aggregateApy,
    } = totals;
    const futureEarningsPerHour = getFutureEarningsPerHour(
      totalDepositedAmountUsd,
      aggregateApy,
    );
    const nbrSecondsInHour = 3600;
    const futureAmount = futureEarningsPerHour + totalVaultEarningsUsd;
    totalCounter = (
      <Earnings>
        <EarningsLabel>YOU YEARNED</EarningsLabel>
        <EarningsText>
          <span role="img" aria-label="party">
            🥳
          </span>
          {'  '}$
          <CountUp
            start={totalVaultEarningsUsd}
            end={futureAmount}
            duration={nbrSecondsInHour}
            separator=","
            useEasing={false}
            decimals={8}
          />{' '}
          <span role="img" aria-label="party">
            🥳
          </span>
        </EarningsText>
        <Disclaimer>
          Price estimate based on aggregate APY of{' '}
          <b>{aggregateApy.toFixed(4)}%</b> on{' '}
          <b>{currencyTransform(parseFloat(totalDepositedAmountUsd))}</b> -{' '}
          {currencyTransform(parseFloat(futureEarningsPerHour * 24))}
          /day
          <br />
          If you refresh the page too quickly your earnings will reset.
        </Disclaimer>
      </Earnings>
    );
  }

  const sortedVaults = _.orderBy(
    vaults,
    [
      vault => new BigNumber(vault.depositedAmount).toNumber(),
      vault => new BigNumber(vault.earnings).toNumber(),
    ],
    ['desc', 'desc'],
  );

  const renderVault = (vault, idx) => <Vault key={idx} vault={vault} />;
  const vaultsEl = _.map(sortedVaults, renderVault);

  return (
    <Wrapper>
      <Totals>{totalCounter}</Totals>
      <Vaults>
        <tbody>{vaultsEl}</tbody>
      </Vaults>
    </Wrapper>
  );
}
