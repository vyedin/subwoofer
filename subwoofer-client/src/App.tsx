import React from 'react';
import logo from './subwoofer_logo.svg';
import './App.css';
import {Chat} from './Chat';
import {Login} from './Login';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Subwoofer Chat</p>
      </header>
      <div className="Chat">
        <Chat />
        <Login />
      </div>
    </div>
  );
}

export default App;
