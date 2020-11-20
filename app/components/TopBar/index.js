import React from 'react';
import styled from 'styled-components';
import Account from 'components/Account';

const Wrapper = styled.div`
  text-align: center;
  position: relative;
  display: grid;
  width: 100%;
  height: 61px;
  grid-template-columns: 1fr 1fr 1fr;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid transparent;
`;

export default function TopBar() {
  return (
    <Wrapper>
      <div />
      <div />
      <Account />
    </Wrapper>
  );
}
