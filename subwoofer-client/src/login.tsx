import React, { useState } from "react";
import { Amplify, Auth } from "aws-amplify";
import aws_exports from './aws-exports';
import { Form, Input, Button } from 'antd';
Amplify.configure(aws_exports);

export const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
  
    function validateForm() {
      return email.length > 0 && password.length > 0;
    }

    const handleSubmit = async(e: React.MouseEvent<HTMLInputElement>): Promise<void> => {
        e.preventDefault();

        try {
          const user = await Auth.signIn(email, password);
          alert("Logged in");
        } catch (ex) {
          alert(ex);
        }
      }
  
    return (
      <div className="Login">
        <Form 
            name='login'
            layout='vertical'
        >
          <Form.Item 
            label="Email"
            name="email"
            rules={[{ type: 'email', required: true, message: 'Please input your username!' }]}
          >
            <Input onChange={e => setEmail(e.target.value)}/>
          </Form.Item>
          <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
           >
            <Input.Password onChange={e => setPassword(e.target.value)}/>
          </Form.Item>
          <Button type='primary' size='large' htmlType='submit'
            onClick={handleSubmit} disabled={!validateForm()}>
                Login
          </Button>
        </Form>
      </div>
    );
  }
