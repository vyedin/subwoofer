import React, { useState, useCallback, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { Form, Input, Button, List, Avatar } from 'antd';
import { SendOutlined } from '@ant-design/icons';

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

  const handleSendMessage = useCallback((message: string) => {
    sendMessage(JSON.stringify({ 'action': 'sendmessage', 'data': message}));
    setInputtedMessage('')
  }, []);

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

  return (
    <div>
      <List
        itemLayout='horizontal'
        dataSource={messageHistory}
        renderItem={item => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />}
              title="Nina"
              description={item}
            />
          </List.Item>
        )}
        />
      <Form
        name='chat_message_form'
        layout='inline'
        >
        <Form.Item>
          <Input
            type={'text'}
            size='large'
            value={inputtedMessage}
            disabled={connectionStatus != 'Open'}
            onChange={e => setInputtedMessage(e.target.value)}/>
        </Form.Item>
        <Form.Item>
        <Button type='primary' size='large' icon={<SendOutlined/>} htmlType='submit'
          onClick={() => handleSendMessage(inputtedMessage)}
          disabled={readyState !== ReadyState.OPEN}>Reply</Button>
        </Form.Item>
      </Form>
    </div>
  );
};
