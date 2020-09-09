import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
	padding: 30px 60px;
	display: table;
	margin: 0px auto;
	justify-content: center;
	max-width: 80%;
	display: ${props => (props.hidden ? 'none' : 'inherit')};
`;

const StyledTable = styled.table`
	border-collapse: separate;
	border-spacing: 0 1em;
	min-width: 730px;
`;

const Th = styled.th`
	color: #002237;
	font-size: 16px;
	text-align: left;
	padding: 0px 12px;
	&:first-of-type {
		padding-left: 0px;
	}
	&:last-of-type {
		padding-right: 0px;
	}
`;

const Td = styled.td`
	width: ${({ width }) => (width ? `${width}px` : 'inherit')};
	padding: 12px 12px;
	max-width: ${({ maxWidth }) => (maxWidth ? `${maxWidth}px` : '200px')};
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	&:first-of-type {
		padding-left: 0px;
	}
	&:last-of-type {
		padding-right: 0px;
	}
`;

const Tr = styled.tr`
	min-width: 150px;
`;

const Thead = styled.thead`
	> tr {
		padding: 16px 0;
	}
`;

export default function Table(props) {
	const { headers, data } = props;

	const renderHeaders = () => {
		const headerMap = _.map(headers, renderHeader);
		return <Tr>{headerMap}</Tr>;
	};

	const renderHeader = (header, idx) => {
		const { key, width, label } = header;
		const spacedKey = key.replace(/([A-Z])/g, ' $1');
		const spacedAndCapitalizedKey = _.upperFirst(spacedKey);
		const columnName = label === '' ? '' : label || spacedAndCapitalizedKey;
		const columnKey = `${columnName}${idx}`;
		return (
			<Th width={width} key={columnKey}>
				{columnName}
			</Th>
		);
	};

	const renderRows = () => _.map(data, renderRow);

	const renderRow = (row, idx) => {
		const columns = renderColumns(row);
		const key = idx;
		return <Tr key={key}>{columns}</Tr>;
	};

	const renderColumns = row => {
		const renderColumnWithRowData = _.bind(renderColumn, null, row);
		const columns = _.map(headers, renderColumnWithRowData);
		return columns;
	};

	const renderColumn = (row, column, idx) => {
		const columnKey = column.key;
		const rowValue = _.get(row, columnKey);
		const header = headers[idx];
		const { transform, hideTitle, titleTransform, width, maxWidth } = header;
		const transformArr = _.isArray(transform);
		const titleTransformArr = _.isArray(titleTransform);

		// Value
		let newRowValue = rowValue;
		if (transform && !transformArr) {
			newRowValue = transform(rowValue, row);
		} else if (transform) {
			_.each(transform, transformFunc => {
				newRowValue = transformFunc(newRowValue, row);
			});
		}

		// Title
		let title = rowValue;
		if (titleTransform && !titleTransformArr) {
			title = titleTransform(rowValue, row);
		} else if (titleTransform) {
			_.each(titleTransform, transformFunc => {
				title = transformFunc(title, row);
			});
		}

		if (hideTitle) {
			title = null;
		}
		return (
			<Td width={width} maxWidth={maxWidth} key={idx}>
				{newRowValue}
			</Td>
		);
	};

	const hidden = !localStorage.getItem('alpha');

	return (
		<Wrapper hidden={hidden}>
			<StyledTable>
				<Thead>{renderHeaders()}</Thead>
				<tbody>{renderRows()}</tbody>
			</StyledTable>
		</Wrapper>
	);
}
