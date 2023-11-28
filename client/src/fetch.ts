/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import axios from "axios";

export const callApiWithToken = async (
  accessToken: string,
  apiEndpoint: string
) => {
  const headers = new Headers();
  const bearer = `Bearer ${accessToken}`;
  headers.append("Authorization", bearer);

  const options = {
    method: "GET",
    headers: headers,
  };

  return fetch(apiEndpoint, options)
    .then((response) => response.json())
    .catch((error) => console.log(error));
};

export const callApiWIthTokenAndBody = async (
  accessToken: string,
  apiEndpoint: string,
  data: any
) => {
  const headers = new Headers();
  const bearer = `Bearer ${accessToken}`;
  headers.append("Authorization", bearer);
  headers.append("Content-Type", "application/json");

  return fetch(apiEndpoint, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .catch((error) => console.log(error));
};

const triggeringExportFile = async (
  reportId: string,
  accessToken: string,
  exportId: string
) => {
  try {
    const response2 = await axios.get(
      `GET https://api.powerbi.com/v1.0/myorg/reports/${reportId}/exports/${exportId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response2);
  } catch (error) {
    console.log(error);
  }
};

export const exportAndDownloadReport = async (
  reportId: string,
  accessToken: string,
  exportFormat: any
) => {
  try {
    const apiUrl = "https://api.powerbi.com";

    const exportParameters = {
      format: "Pdf",
      locale: "en-US",
    };

    // if (!exportFormat) {
    axios({
      method: "POST",
      url: "exportTo",
      data: {
        format: exportFormat,
        accessToken: accessToken,
        reportId: reportId,
      },
    })
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
    // } else {
    // axios({
    //   method: "POST",
    //   url: "exportTofile",
    //   data: {
    //     format: exportFormat,
    //     accessToken: accessToken,
    //     reportId: reportId,
    //   },
    // })
    //   .then((response) => {
    //     console.log(response);
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //   });
    // }
  } catch (error) {
    console.error("Error:", error);
  }
};

export const callApiToLogin = () => {
  return fetch("/auth/login")
    .then((response) => response.json())
    .catch((error) => console.log(error));
};

export const callApiToLogout = () => {
  return fetch("/auth/logout")
    .then((response) => response.json())
    .catch((error) => console.log(error));
};

export const callApiToGetSpaCode = () => {
  return fetch("/auth/fetchCode")
    .then((response) => response.json())
    .catch((error) => console.log(error));
};
