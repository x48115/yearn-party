import React from 'react';
import styled from 'styled-components';
import Web3 from 'web3';
import { useSelector } from 'react-redux';
import { selectTokens } from 'containers/App/selectors';
import ReactImageFallback from 'react-image-fallback';

const icons = require.context('images', true);

const imageStyles = `
  max-width: 40px;
  align-self: center;
  min-width: 40px;
  margin-top: 7px;
`;

export default function VaultIcon(props) {
  const { symbol, className } = props;
  const imageUrl = icons(`./${symbol}-logo.png`);
  return (
    <ReactImageFallback
      className={className}
      css={imageStyles}
      src={imageUrl}
      fallbackImage="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png"
    />
  );
}
