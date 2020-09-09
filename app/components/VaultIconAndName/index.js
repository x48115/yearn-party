import React from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import * as s from 'containers/App/selectors';
import ReactImageFallback from 'react-image-fallback';
import VaultIcon from 'components/VaultIcon';
import ValueWithLabel from 'components/ValueWithLabel';

const Wrapper = styled.div`
  display: flex;
`;
const Name = styled.div`
  margin-left: 15px;
`;

export default function VaultIconAndName(props) {
  const { address } = props;
  const vaults = useSelector(s.selectVaults());
  const vault = _.find(
    vaults,
    vault => vault.address.toLowerCase() === address.toLowerCase(),
  );
  const { name, symbol } = vault;
  return (
    <Wrapper>
      <VaultIcon symbol={symbol} />
      <Name>
        <ValueWithLabel label="Vault:" value={name} />
      </Name>
    </Wrapper>
  );
}
