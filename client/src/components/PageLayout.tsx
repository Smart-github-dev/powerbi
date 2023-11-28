import { NavigationBar } from "./NavigationBar";
import { AuthenticatedTemplate } from "@azure/msal-react";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Button, theme, Flex } from 'antd';
import React from "react";
import SiderBar from "./SiderBar";
const { Header, Sider, Content } = Layout;

export const PageLayout: React.FC<React.PropsWithChildren> = ({ children }) => {

  return (
    <Layout>
      <NavigationBar />
      <Layout>
        <SiderBar></SiderBar>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: "white",
          }}
        >
          {children}
        </Content>
      </Layout>
      <AuthenticatedTemplate>
        <footer></footer>
      </AuthenticatedTemplate>
    </Layout>
  );
};
