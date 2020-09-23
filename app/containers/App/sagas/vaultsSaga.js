import request from 'utils/request';
import * as r from 'redux-saga/effects';
import * as s from '../selectors';
import * as a from '../actions';
import * as c from '../constants';

const pollPeriod = 60 * 1000 * 60; // Minutes

export function* poll() {
  const account = yield r.select(s.selectAccount());
  while (true) {
    try {
      const url = `https://dev-api.yearn.tools/user/${account}/vaults?apy=true&statistics=true`;
      const vaults = yield r.call(request, url);
      yield r.put(a.vaultsLoaded(vaults));
    } catch (err) {
      console.log('Error reading prices', err);
    }
    yield r.delay(pollPeriod);
  }
}

export function* startPolling() {
  yield r.put(a.startLoadingVaults());
}

export default function* initialize() {
  yield r.takeLatest(c.CONNECTION_UPDATED, startPolling);
  while (true) {
    yield r.take(c.START_LOADING_VAULTS);
    yield r.race([r.call(poll), r.take(c.CONNECTION_UPDATED)]);
  }
}
