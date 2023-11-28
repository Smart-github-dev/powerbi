import React, { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { InteractionRequiredAuthError } from "@azure/msal-browser";
import { MsalProvider, useMsal } from "@azure/msal-react";

import { Profile } from "./pages/Profile";
import { PageLayout } from "./components/PageLayout";
import { Blank } from "./pages/Blank";
import { PowerBi } from "./pages/PowerBi";

import { callApiToGetSpaCode } from "./fetch";
import { PublicClientApplication } from "@azure/msal-browser";

import "./styles/App.css";

const Pages = () => {
  return (
    <Routes>
      <Route path="/profile" element={<Profile />} />
      <Route path="/powerbi" element={<PowerBi />} />
      <Route path="/blank" element={<Blank />} />
    </Routes>
  );
};

interface AppProps {
  instance: PublicClientApplication;
}

export const App: React.FC<AppProps> = ({ instance }) => {
  const search = useLocation().search;
  const getCode = new URLSearchParams(search).get("getCode");
  const { inProgress } = useMsal();
  const [data, setData] = useState<any>(null); // Use appropriate type for data

  useEffect(() => {
    const fetchData = async () => {
      let apiData;
      let token;

      if (getCode && !data) {
        apiData = await callApiToGetSpaCode();
        const { code, loginHint, sid } = apiData;

        if (inProgress === "none") {
          try {
            token = await instance.acquireTokenByCode({
              code, // Spa Auth code
            });

            setData(token);
          } catch (error) {
            if (error instanceof InteractionRequiredAuthError) {
              try {
                token = await instance.loginPopup({
                  loginHint, // Prefer loginHint claim over sid or preferredUsername
                  scopes: [],
                });

                setData(token);
              } catch (error) {
                console.log(error);
              }
            }
          }
        }
      }
    };

    fetchData();
  }, [instance, inProgress]);

  return (
    <MsalProvider instance={instance}>
      <PageLayout>
        <Pages />
      </PageLayout>
    </MsalProvider>
  );
};
