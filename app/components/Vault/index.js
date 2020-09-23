import React from 'react';
import styled from 'styled-components';
import VaultIconAndName from 'components/VaultIconAndName';
import CountUp from 'react-countup';
import ValueWithLabel from 'components/ValueWithLabel';
import { balanceTransform, roundFloat } from 'utils/string';

const Td = styled.td`
  padding: 20px 20px;
`;

const Wrapper = styled.tr``;

const AmountCounter = styled.div``;

export default function Component(props) {
  const { vault } = props;
  const {
    tokenSymbolAlias,
    earnings,
    apyOneWeekSample,
    depositedAmount,
  } = vault;

  const apyRatePerHour = apyOneWeekSample / 100 / 365 / 24;
  const nbrSecondsInHour = 3600;

  const addSymbol = amount => `${amount} ${tokenSymbolAlias}`;

  const amountTransform = (amount, decimals) => {
    const nbrDecimals = decimals || 10;
    let newAmount = amount;
    newAmount = balanceTransform(newAmount);
    newAmount = roundFloat(newAmount, nbrDecimals);
    newAmount = addSymbol(newAmount);
    return newAmount;
  };

  const getFutureEarningsPerHour = () => {
    const currentAmount = balanceTransform(depositedAmount);

    const futureEarningsPerHour = currentAmount * apyRatePerHour;
    return futureEarningsPerHour;
  };
  const futureEarningsPerHour = getFutureEarningsPerHour();

  const deposited = amountTransform(depositedAmount, 4);

  const currentEarnings = earnings * 1;
  const futureEarnings = futureEarningsPerHour + currentEarnings;
  const vaultEarnings = (
    <AmountCounter>
      <CountUp
        start={currentEarnings}
        end={futureEarnings}
        duration={nbrSecondsInHour}
        separator=","
        useEasing={false}
        decimals={10}
      />{' '}
      {tokenSymbolAlias}
    </AmountCounter>
  );

  return (
    <Wrapper>
      <Td>
        <VaultIconAndName vault={vault} />
      </Td>
      <Td>
        <ValueWithLabel
          label="ROI:"
          value={`${roundFloat(apyOneWeekSample, 2)}%`}
        />
      </Td>
      <Td>
        <ValueWithLabel label="Deposited:" value={deposited} />
      </Td>
      <Td>
        <ValueWithLabel label="Earnings:" value={vaultEarnings} />
      </Td>
    </Wrapper>
  );
}
