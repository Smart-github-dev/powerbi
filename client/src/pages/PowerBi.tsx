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
import { useReport } from "powerbi-report-component"



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
    const [report, embed] = useReport();


    const setReportData = (data: any) => {
        dispatch(setData(data.value))
    }
    const authconfig: any = {
        interactionType: InteractionType.Popup,
        scopes: protectedResources.powerBi.scopes,
        account: account
    }


    useMsalAuthentication(authconfig);

    const [sampleReportConfig, setReportConfig] = useState<powerbi.models.IReportEmbedConfiguration>({
        type: 'report',
        id: undefined,
        embedUrl: undefined,
        tokenType: powerbi.models.TokenType.Embed,
        accessToken: undefined,
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



                const config: any = {
                    embedType: 'report',
                    tokenType: 'Embed',
                    accessToken: fetchToken.token,
                    embedUrl: _report.embedUrl,
                    embedId: _report.id,
                    permissions: 'View',
                    settings: {
                        filterPaneEnabled: true,
                        navContentPaneEnabled: true
                    }
                };

                embed(reportContainerRef, config)

                // setReportConfig({
                //     ...sampleReportConfig,
                //     id: _report.id,
                //     embedUrl: _report.embedUrl,
                //     accessToken: fetchToken.token
                // });
                //@ts-ignore
                // const pReport = powerbi.embed(reportContainer, config);

                // setReport(pReport)
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
        // you can use "report" from useReport like
        if (report) report.print();
    };

    return sampleReportConfig.embedUrl ? <div >
        <Flex justify={"space-between"}>
            <Button onClick={() => handleClick()} icon={<FilePdfOutlined />}>
                PDF
            </Button>
            <Button onClick={() => exportAndDownloadReport(reportid, accessToken, "PPTX")} icon={<FilePptOutlined />}>
                PPTX
            </Button>
            <Button onClick={() => exportAndDownloadReport(reportid, accessToken, "PNG")} icon={<FileImageOutlined />}>
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
        <div className={reportClass} ref={reportContainerRef} >

        </div>
    </div> : <></>;
};

export const PowerBi: React.FC = () => {
    return (
        <div>
            <PowerBiContent />
        </div>
    );
};