import React from 'react';
import { Route, BrowserRouter } from 'react-router-dom';

import Home from './pages/Home';
import Point from './pages/register/Point';

const Routes = () => {
  return (
      <BrowserRouter>
        <Route exact component={Home} path="/" />
        <Route exact component={Point} path="/cadastro/ponto-de-coleta" />
      </BrowserRouter>
  );
}

export default Routes;
