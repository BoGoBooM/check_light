import React from 'react';
import ReactDOM from 'react-dom/client'; // змінено імпорт
import './index.css';
import App from './App';
import { store } from './app/store';
import { Provider } from 'react-redux';

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container!); // створення кореня

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
