import React, { useState } from "react";
import {
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
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
      <Flex gap="middle" justify={"space-around"} align="center">
        <AuthenticatedTemplate>
          <div>
            <Button>
              <NavLink to="/profile">
                Profile
              </NavLink>
            </Button>
            <Button>
              <NavLink to="/powerbi">
                PowerBi
              </NavLink>
            </Button>
          </div>
          <Button
            type={"primary"}
            className="ml-auto"

            onClick={handleLogout}
          >
            Sign out{" "}
          </Button>

        </AuthenticatedTemplate>
        <UnauthenticatedTemplate>
          <Button
            type={"link"}
            className="ml-auto"
            onClick={handelLogin}
          >
            Sign in
          </Button>
        </UnauthenticatedTemplate>
      </Flex>

    </Header>
  );
};
