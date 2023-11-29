import React, { useState } from "react";
import {
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
  LoginOutlined
} from '@ant-design/icons';
import { Layout, Menu, Button, theme, Flex } from 'antd';

import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useMsal,
} from "@azure/msal-react";

import { callApiToLogin, callApiToLogout } from "../fetch";
import { NavLink } from "react-router-dom";

const { Header, Sider, Content } = Layout;
export const NavigationBar = () => {
  const { instance } = useMsal();

  const handelLogin = () => {
    callApiToLogin().then((data) => {
      window.open(data, "_self");
    });
  };

  const handleLogout = () => {
    callApiToLogout()
      .then((data) => {
        if (data && data.message === "success") {
          instance.logoutRedirect({ postLogoutRedirectUri: "/" });
        }
      })
      .catch((error) => console.log(error));
  };


  return (
    <Header style={{ padding: 0, background: "#001529" }}  >
      <div style={{ display: "inline-block", paddingRight: "10%", paddingLeft: "10%" }}>
        <AuthenticatedTemplate>
          <div style={{ float: "left" }}>
            <NavLink to="/profile">
              <Button>
                Profile
              </Button>
            </NavLink>
            <NavLink to="/powerbi">
              <Button>
                PowerBi
              </Button>
            </NavLink>
          </div>
          <Button
            type={"primary"}
            className="ml-auto"
            style={{ float: "right" }}
            onClick={handleLogout}
          >
            Sign out
          </Button>
        </AuthenticatedTemplate>
        <UnauthenticatedTemplate>
          <Button
            type={"dashed"}
            style={{ float: "right" }}
            icon={<LoginOutlined />}
            className="ml-auto"
            onClick={handelLogin}
          >
            Sign in
          </Button>
        </UnauthenticatedTemplate>
      </div>
    </Header>
  );
};
