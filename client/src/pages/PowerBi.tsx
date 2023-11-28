import React, { useEffect, useRef, useState } from "react";
import { useMsal, useAccount, useMsalAuthentication } from "@azure/msal-react";
import { InteractionRequiredAuthError, AccountInfo, InteractionType } from "@azure/msal-browser";

import { protectedResources } from "../authConfig";
import { getrepots, gettoken } from "../powerBiConfig"
import { callApiWIthTokenAndBody, callApiWithToken, exportAndDownloadReport } from "../fetch";
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { setData } from '../store/rootReducer';
import * as powerbi from 'powerbi-client';
import { Report } from "powerbi-report-component"



import { Button, Flex } from "antd";
import {
    FilePdfOutlined,
    FilePptOutlined,
    Html5Outlined,
    FileImageOutlined,
    FileWordOutlined,
    FileExcelOutlined
} from '@ant-design/icons';

const PowerBiContent: React.FC = () => {
    const reports = useSelector((state: RootState) => state.powerbi.reports);
    const currentReport = useSelector((state: RootState) => state.powerbi.selected);

    const dispatch = useDispatch<AppDispatch>();

    const { instance, accounts, inProgress } = useMsal();
    const account = useAccount(accounts[0] || {}) as AccountInfo;
    const [token, setToken] = useState<any>(null);
    const reportContainerRef = useRef(null);
    const [report, setReport] = useState<any>(null)

    const setReportData = (data: any) => {
        dispatch(setData(data.value))
    }
    const authconfig: any = {
        interactionType: InteractionType.Popup,
        scopes: protectedResources.powerBi.scopes,
        account: account
    }


    useMsalAuthentication(authconfig);

    const [sampleReportConfig, setReportConfig] = useState<any>({
        type: 'report',
        id: "",
        embedUrl: undefined,
        tokenType: powerbi.models.TokenType.Embed,
        accessToken: undefined,
        datasetid: undefined,
        permissions: powerbi.models.Permissions.All,
        settings: {
            background: powerbi.models.BackgroundType.Transparent,
            filterPaneEnabled: true,
            navContentPaneEnabled: true
        },
    });

    const powerbiReport = null;


    useEffect(() => {
        const _report: any = reports[currentReport];
        const fetchData = async () => {
            if (_report) {
                const fetchToken: any = await callApiWIthTokenAndBody(token.accessToken, gettoken, {
                    datasets: [{ id: _report.datasetId }],
                    reports: [{ id: _report.id }]
                })

                setReportConfig({
                    ...sampleReportConfig,
                    id: _report.id,
                    datasetid: _report.datasetId,
                    embedUrl: _report.embedUrl,
                    accessToken: fetchToken.token
                });
            }
        }
        fetchData();
    }, [currentReport]);

    useEffect(() => {
        const fetchData = async () => {
            if (token) {
                const fetchedReports: any = await callApiWithToken(token.accessToken, getrepots);
                setReportData(fetchedReports);
                console.log(fetchedReports);
            }
        }
        fetchData()
    }, [token]);

    useEffect(() => {
        const fetchData = async () => {
            if (account && inProgress === "none" && reports.length == 0) {
                try {
                    const _token = await instance.acquireTokenSilent({
                        scopes: protectedResources.powerBi.scopes,
                        account: account
                    });
                    setToken(_token)
                } catch (error) {
                    console.log(error);
                    if (error instanceof InteractionRequiredAuthError) {
                        try {
                            const _token = await instance.acquireTokenPopup({
                                scopes: protectedResources.powerBi.scopes,
                                account: account
                            });
                            setToken(_token)
                        } catch (error) {
                            console.log(error);
                        }
                    }
                }
            }
        };

        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [account, inProgress, instance]);

    const reportClass = 'report-container';

    const reportid: any = sampleReportConfig.id;
    const accessToken: any = sampleReportConfig.accessToken
    const handleClick = () => {
        if (report) report.print();
    };

    const exportExcel = async () => {
        try {
            const pages = await report.getPages();
            const activePage = pages[0]; // Assuming we want to export data from the first page
            const data = await activePage.getVisualData();
            console.log(data)
        } catch (error) {
            console.log(error)
        }
    }

    const handleReportLoad = (report: any) => {
        setReport(report)
        console.log(report)
    }

    return sampleReportConfig.embedUrl ? <div >
        <Flex justify={"space-between"}>
            <Button onClick={() => handleClick()} icon={<FilePdfOutlined />}>
                PDF
            </Button>
            <Button onClick={() => exportAndDownloadReport(reportid, accessToken, "PPTX")} icon={<FilePptOutlined />}>
                PPTX
            </Button>
            <Button onClick={() => exportExcel()} icon={<FileImageOutlined />}>
                PNG
            </Button>
            <Button onClick={() => exportAndDownloadReport(reportid, accessToken, "CSV")} icon={<FileWordOutlined />}>
                CSV
            </Button>
            <Button onClick={() => exportAndDownloadReport(reportid, token.accessToken, "XLSX")} icon={<FileExcelOutlined />}>
                XLSX
            </Button>
            <Button onClick={() => exportAndDownloadReport(reportid, token.accessToken, false)} icon={<Html5Outlined />}>
                MHTML
            </Button>
        </Flex>
        <Report
            tokenType="Embed" // "Aad"
            accessToken={"" + sampleReportConfig.accessToken} // accessToken goes here
            embedUrl={sampleReportConfig.embedUrl} // embedUrl goes here
            embedId={"" + sampleReportConfig.id} // report or dashboard Id goes here
            reportMode="View" // open report in a particular mode View/Edit/Create
            permissions="All"
            datasetId={sampleReportConfig.datasetid}
            style={{
                height: "75vh",
                width: "100 %"
            }}
            onLoad={handleReportLoad}
        />
    </div> : <></>;
};

export const PowerBi: React.FC = () => {
    return (
        <div>
            <PowerBiContent />
        </div>
    );
};