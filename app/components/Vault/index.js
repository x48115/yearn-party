import React from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import VaultIconAndName from 'components/VaultIconAndName';
import Table from 'components/Table';
import BigNumber from 'big-number';
import CountUp from 'react-countup';
import ValueWithLabel from 'components/ValueWithLabel';
import * as s from 'containers/App/selectors';

import {
	balanceTransform,
	roundFloat,
	getFormattedDateTime,
	relativeDateTransform,
} from 'utils/string';

const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-top: 70px;
`;

const VaultNameWrapper = styled.div`
	width: 220px;
`;

const Apy = styled.div`
	width: 100px;
`;

const Position = styled.div`
	margin: 15px;
	border: 1px solid #ccc;
`;

const VaultSummary = styled.div`
	display: flex;
	grid-gap: 50px;
`;

const Earnings = styled.div`
	width: 300px;
`;

const Deposits = styled.div`
	width: 200px;
`;

const Action = styled.td`
	padding: 8px;
	width: 130px;
	padding-left: 15px;
`;

const Amount = styled.td`
	padding: 8px;
	width: 180px;
`;

const RelativeDate = styled.td`
	padding: 8px;
	width: 150px;
`;

const AmountCounter = styled.div``;

export default function Component(props) {
	const { address, positions } = props;
	const vaults = useSelector(s.selectVaults());
	const vault = _.find(
		vaults,
		vault => vault.address.toLowerCase() === address.toLowerCase(),
	);
	const { symbol, earnings, apyOneDaySample, openDeposits } = vault;
	const apyRatePerHour = apyOneDaySample / 365 / 24;
	const nbrSecondsInHour = 3600;
	const vaultTransform = address => {
		return <VaultIconAndName address={address} />;
	};

	const addSymbol = amount => {
		return `${amount} ${symbol}`;
	};

	const amountTransform = (amount, decimals) => {
		const nbrDecimals = decimals || 10;
		let newAmount = amount;
		newAmount = balanceTransform(newAmount);
		newAmount = roundFloat(newAmount, nbrDecimals);
		newAmount = addSymbol(newAmount);
		return newAmount;
	};

	const exitTransform = time =>
		time ? getFormattedDateTime(time) : 'Still deposited';

	const enterTransform = time => (time ? getFormattedDateTime(time) : 'N/A');

	const withdrawTransform = amount =>
		amount ? amountTransform(amount) : 'Still earning';

	const getFutureEarningsPerHour = () => {
		const mostRecentPosition = _.first(positions);
		const positionOpen = mostRecentPosition.open;
		if (positionOpen) {
			const currentAmount = balanceTransform(mostRecentPosition.deposit);
			const futureEarningsPerHour = currentAmount * apyRatePerHour;
			return futureEarningsPerHour;
		}
		return 0;
	};
	const futureEarningsPerHour = getFutureEarningsPerHour();

	const earningsTransform = (amount, position) => {
		if (!amount) {
			return '...';
		}
		const positionClosed = !position.open;
		if (positionClosed) {
			return amountTransform(amount);
		}
		const currentAmount = balanceTransform(amount);
		const futureAmount = futureEarningsPerHour + currentAmount;
		return (
			<React.Fragment>
				<CountUp
					start={currentAmount}
					end={futureAmount}
					duration={nbrSecondsInHour}
					separator=" "
					decimals={6}
				/>{' '}
				{symbol}
			</React.Fragment>
		);
		return currentAmount;
	};

	const depositTransform = amount => (amount ? amountTransform(amount) : 'N/A');

	const headers = [
		{
			key: 'enter',
			transform: enterTransform,
		},
		{
			key: 'exit',
			transform: exitTransform,
		},
		{
			key: 'deposit',
			label: 'Deposit(s)',
			transform: depositTransform,
		},
		{
			key: 'withdraw',
			transform: withdrawTransform,
		},
		{
			key: 'earned',
			transform: earningsTransform,
		},
	];

	const withdrawalTransform = val =>
		val ? amountTransform(val) : 'Still earning';

	const tableData = positions;

	const currentEarnings = balanceTransform(earnings);
	const futureEarnings = futureEarningsPerHour + currentEarnings;

	const vaultEarnings = (
		<AmountCounter>
			<CountUp
				start={currentEarnings}
				end={futureEarnings}
				duration={nbrSecondsInHour}
				separator=" "
				decimals={6}
			/>{' '}
			{symbol}
		</AmountCounter>
	);

	const deposited = amountTransform(openDeposits, 4);

	return (
		<Wrapper>
			<VaultSummary>
				<VaultNameWrapper>
					<VaultIconAndName address={address} />
				</VaultNameWrapper>
				<Apy>
					<ValueWithLabel
						label="ROI:"
						value={`${roundFloat(apyOneDaySample, 2)}%`}
					/>
				</Apy>
				<Deposits>
					<ValueWithLabel label="Deposited:" value={deposited} />
				</Deposits>
				<Earnings>
					<ValueWithLabel label="Earnings:" value={vaultEarnings} />
				</Earnings>
			</VaultSummary>
			<Table headers={headers} data={tableData} />
		</Wrapper>
	);
}
