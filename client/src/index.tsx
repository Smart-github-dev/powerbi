import React from "react";
import ReactDOM from "react-dom";
import { App } from "./App";
import { BrowserRouter } from "react-router-dom";
import { PublicClientApplication, Configuration } from "@azure/msal-browser";
import { msalConfig } from "./authConfig";
import { Provider } from 'react-redux';
import store from './store';
import "./styles/index.css";
import reportWebVitals from './reportWebVitals';

const msalInstance = new PublicClientApplication(msalConfig as Configuration);

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <App instance={msalInstance} />
    </BrowserRouter>
  </Provider>
  ,
  document.getElementById("root") as HTMLElement
);

reportWebVitals();

