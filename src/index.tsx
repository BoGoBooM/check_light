import 'process';
import 'buffer';

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Імпорт CSS
import App from './App';
import { store } from './app/store';
import { Provider } from 'react-redux';

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container!);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
