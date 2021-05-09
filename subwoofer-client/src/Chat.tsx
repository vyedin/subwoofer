import React, { useState, useCallback, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { Form, Input, Button, List, Avatar } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { Hub, Auth } from "aws-amplify";

// The chat component used the react-use-websocket API here: https://www.npmjs.com/package/react-use-websocket
// Some logic to fetch current session data are from here: 
// https://towardsdatascience.com/create-a-question-and-answer-bot-with-amazon-kendra-and-aws-fargate-79c537d68e45

export const Chat = () => {

  let rootPath = 'wss://8ks1akfff9.execute-api.us-east-1.amazonaws.com/Prod'
  const [socketUrl, setSocketUrl] = useState(rootPath) //this is a bit of a hack as we have to get auth data before we can connect to the socket
  const [userID, setUserID] = useState<string>()
  const [inputtedMessage, setInputtedMessage] = useState('');
  const [user, setUser] = useState(false);
  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl, {
    share: true,
    shouldReconnect: () => true,
  });
  const [messageHistory, setMessageHistory] = useState<{ message: string, user: string }[]>([]);

  useEffect(() => {
    if (!user) {
      getCurrentUser();
    }
    Hub.listen("auth", (data) => {
      const { payload } = data;
      if (payload.data && payload.data.event === "signIn" && !user) {
        getCurrentUser();
      }
    });
  }, []);

  const getCurrentUser = () => {
    Auth.currentAuthenticatedUser({
      bypassCache: false,
    })
      .then((_user) => {
        setUser(_user);
        setupWebsocket(_user);
      })
      .catch((err) => console.log(err));
  };

  const setupWebsocket = (user: { username: any; signInUserSession: any; }) => {
    const { username, signInUserSession } = user;
    setUserID(username)
    console.log(signInUserSession);
    setSocketUrl(`${rootPath}?token=
      ${signInUserSession.accessToken.jwtToken}&username=${username}`)
  }

  // useEffect(() => {
  //   lastMessage && setMessageHistory(prev => prev.concat(lastMessage.data));
  // }, [lastMessage]);

  useEffect(() => {
    lastMessage && userID && setMessageHistory(prev => prev.concat([JSON.parse(lastMessage.data)]));
    console.log(messageHistory)
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
              avatar={<Avatar src='https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png' />}
              title={item.user}
              description={item.message}
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
            disabled={connectionStatus !== 'Open'}
            onChange={e => setInputtedMessage(e.target.value)}/>
        </Form.Item>
        <Form.Item>
        <Button type='primary' size='large' icon={<SendOutlined/>} htmlType='submit'
          onClick={() => handleSendMessage(`{ "message": "${inputtedMessage}", "user": "${userID}" }`)}
          disabled={readyState !== ReadyState.OPEN}>Reply</Button>
        </Form.Item>
      </Form>
    </div>
  );
};
