import Web3 from 'web3';
import tokens from 'tokens';
import request from 'utils/request';
import * as r from 'redux-saga/effects';
import * as s from 'containers/App/selectors';
import * as a from 'containers/App/actions';
import * as c from 'containers/App/constants';

const pollPeriod = 5 * 60000;

export function* poll() {
  const url = 'https://api.vaults.finance/apy';
  while (true) {
    try {
      const vaults = yield r.call(request, url);
      const lowercaseAddress = vault => {
        const newVault = vault;
        newVault.address = vault.address.toLowerCase();
        return newVault;
      };
      const vaultsWithLowercaseAddress = _.map(vaults, lowercaseAddress);
      yield r.put(a.vaultsApyLoaded(vaultsWithLowercaseAddress));
    } catch (err) {
      console.log('Error reading transactions', err);
    }
    yield r.delay(pollPeriod);
  }
}

export default function* initialize() {
  yield r.takeLatest(c.CONNECTION_CONNECTED, poll);
}
