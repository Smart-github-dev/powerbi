import React from 'react';
import { render, screen } from '@testing-library/react';
import { App } from './App';
import { PublicClientApplication, Configuration } from "@azure/msal-browser";
import { msalConfig } from "./authConfig";

const msalInstance = new PublicClientApplication(msalConfig as Configuration);

test('renders learn react link', () => {
  render(<App instance={msalInstance} />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
