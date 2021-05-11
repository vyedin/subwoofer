import React from 'react';
import { Amplify } from "aws-amplify";
import { withAuthenticator } from "aws-amplify-react";
import config from './aws-exports';
import logo from './subwoofer_logo.svg';
import './App.css';
import {Chat} from './Chat';

Amplify.configure(config);

function App(this: any) {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Subwoofer Chat</p>
      </header>
      <div className="Chat">
        <Chat />
      </div>
    </div>
  );
}

const signUpConfig = {
  hiddenDefaults: ["phone_number"],
  signUpFields: [
    { label: "Name", key: "name", required: true, type: "string" }
  ]
}

export default withAuthenticator(App, true, [], null, null, signUpConfig);