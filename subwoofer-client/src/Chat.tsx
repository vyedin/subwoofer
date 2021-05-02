import React, { useState, useCallback, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

//Generates the click handler, which returns a promise that resovles to the provided url.
const generateAsyncUrlGetter = (url: string, timeout = 2000) => () => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(url);
      }, timeout);
    })
  };

export const Chat = () => {
  const [socketUrl] = useState('wss://d8xem5kqu1.execute-api.us-east-1.amazonaws.com/Prod');
  const [messageHistory, setMessageHistory] = useState([]);
  const [inputtedMessage, setInputtedMessage] = useState('');
  const {
    sendMessage,
    lastMessage,
    readyState,
  } = useWebSocket(socketUrl, {
      share: true,
      shouldReconnect: () => true,
  });

  useEffect(() => {
    lastMessage && setMessageHistory(prev => prev.concat(lastMessage.data));
  }, [lastMessage]);

  const handleSendMessage = useCallback((message: string) =>
    sendMessage(JSON.stringify({ 'action': 'sendmessage', 'data': message})), []);

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

  return (
    <div>
      <span>The WebSocket is currently {connectionStatus}</span>
      <p>Message History: {messageHistory.join(', ')}</p>
      <input
          type={'text'}
          value={inputtedMessage}
          onChange={e => setInputtedMessage(e.target.value)}/>
        <button
          onClick={() => handleSendMessage(inputtedMessage)}
          disabled={readyState !== ReadyState.OPEN}>Send</button>
    </div>
  );
};