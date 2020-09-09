import React from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import Vault from 'components/Vault';
import CountUp from 'react-countup';

import {
	balanceTransform,
	roundFloat,
	relativeDateTransform,
} from 'utils/string';
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
	font-size: 90px;
`;

const Earnings = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
`;

const Vaults = styled.div`
	margin-top: 50px;
`;

export default function Component(props) {
	const vaultPositions = useSelector(s.selectVaultPositions());
	const vaults = useSelector(s.selectVaults());
	const totals = useSelector(s.selectTotals());
	let totalCounter;

	const getFutureEarningsPerHour = (currentAmount, apy) => {
		const apyRatePerHour = apy / 365 / 24;
		const futureEarningsPerHour = currentAmount * apyRatePerHour;
		return futureEarningsPerHour;
	};

	if (totals) {
		const { totalVaultEarningsUsd, totalOpenBalanceUsd, aggregateApy } = totals;
		const futureEarningsPerHour = getFutureEarningsPerHour(
			totalOpenBalanceUsd,
			aggregateApy,
		);
		const nbrSecondsInHour = 3600;
		const futureAmount = futureEarningsPerHour + totalVaultEarningsUsd;
		totalCounter = (
			<Earnings>
				<EarningsLabel>YOU YEARNED</EarningsLabel>
				<EarningsText>
					🥳{'  '}
					<CountUp
						start={totalVaultEarningsUsd}
						end={futureAmount}
						duration={nbrSecondsInHour}
						separator=","
						decimals={5}
					/>
					$ 🥳
				</EarningsText>
			</Earnings>
		);
	}

	const vaultTransform = address => {
		return <VaultIconAndName address={address} />;
	};

	const addSymbol = (amount, row) => {
		return `${amount} ${symbol}`;
	};

	const renderVault = (vault, idx) => (
		<Vault address={vault.address} key={idx} positions={vault.positions} />
	);
	const sortedVaultPositions = _.orderBy(vaultPositions, position => {
		return parseInt(position.openDeposits, 10);
	});

	const vaultPositionsByVault = _.map(sortedVaultPositions, renderVault);

	return (
		<Wrapper>
			<Totals>{totalCounter}</Totals>
			<Vaults>{vaultPositionsByVault}</Vaults>
		</Wrapper>
	);
}
