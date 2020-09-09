import * as c from './constants';

export function connectionConnected(account, connector, library, chainId) {
  return {
    type: c.CONNECTION_CONNECTED,
    account,
    connector,
    library,
    chainId,
  };
}

export function connectionUpdated(library, chainId, active) {
  return {
    type: c.CONNECTION_UPDATED,
    library,
    chainId,
    active,
  };
}

export function startLoadingWallet() {
  return {
    type: c.START_LOADING_WALLET,
  };
}

export function walletLoaded(payload) {
  return {
    type: c.WALLET_LOADED,
    payload,
  };
}

export function startLoadingVaults() {
  return {
    type: c.START_LOADING_VAULTS,
  };
}

export function vaultsApyLoaded(vaults) {
  return {
    type: c.VAULTS_APY_LOADED,
    vaults,
  };
}

export function vaultsUpdated(vaults) {
  return {
    type: c.VAULTS_UPDATED,
    vaults,
  };
}

export function startLoadingVaultPositions() {
  return {
    type: c.START_LOADING_VAULT_TRANSACTIONS,
  };
}

export function vaultPositionsLoaded(vaults) {
  return {
    type: c.VAULT_POSITIONS_LOADED,
    vaults,
  };
}

export function startLoadingPrices() {
  return {
    type: c.START_LOADING_PRICES,
  };
}

export function pricesLoaded(vaults) {
  return {
    type: c.PRICES_LOADED,
    vaults,
  };
}

export function showConnectorModal(showModal) {
  return {
    type: c.SHOW_CONNECTOR_MODAL,
    showModal,
  };
}

export function updateApprovedTokens(tokens) {
  return {
    type: c.UPDATE_APPROVED_TOKENS,
    tokens,
  };
}

export function updateModalState(newState, metadata) {
  return {
    type: c.UPDATE_MODAL_STATE,
    newState,
    metadata,
  };
}

export function web3Waiting(waiting) {
  return {
    type: c.WEB3_WAITING,
    waiting,
  };
}

export function fetchWallet() {
  return {
    type: c.FETCH_WALLET,
  };
}

export function showConfirmationModal(showModal) {
  return {
    type: c.SHOW_CONFIRMATION_MODAL,
    showModal,
  };
}
