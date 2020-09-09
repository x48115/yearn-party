import React, { useEffect } from 'react';
import ConnectionProvider from 'containers/ConnectionProvider';
import Dashboard from 'components/Dashboard';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useInjectReducer } from 'utils/injectReducer';
import { useInjectSaga } from 'utils/injectSaga';
import { useDispatch, useSelector } from 'react-redux';
import vaultsApySaga from 'containers/App/sagas/vaultsApySaga';
import pricesSaga from 'containers/App/sagas/pricesSaga';
import vaultsTransactionsSaga from 'containers/App/sagas/vaultsTransactionsSaga';
import reducer from 'containers/App/reducer';
import * as s from 'containers/App/selectors';
import * as a from 'containers/App/actions';

import GlobalStyle from '../../global-styles';

import styled from 'styled-components';
const DemoWrap = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default function App() {
  useInjectReducer({ key: 'app', reducer });
  useInjectSaga({ key: 'vaultsApySaga', saga: vaultsApySaga });
  useInjectSaga({ key: 'pricesSaga', saga: pricesSaga });
  useInjectSaga({
    key: 'vaultsTransactionsSaga',
    saga: vaultsTransactionsSaga,
  });

  const dispatch = useDispatch();
  const init = () => {
    // dispatch(a.startLoadingVaults());
  };
  useEffect(init, []);

  let content;
  const hidden = !localStorage.getItem('alpha');
  if (hidden) {
    content = <DemoWrap>plz enter password.. 🙃</DemoWrap>;
  } else {
    content = <Dashboard />;
  }

  return (
    <React.Fragment>
      <GlobalStyle />
      <ConnectionProvider>{content}</ConnectionProvider>
    </React.Fragment>
  );
}
