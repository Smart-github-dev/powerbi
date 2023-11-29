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
import { Report, useReport } from "powerbi-report-component"
import * as XLSX from "xlsx"
import { jsPDF } from "jspdf"
import html2canvas from 'html2canvas';

import { Button, Flex } from "antd";
import {
    FilePdfOutlined,
    FilePptOutlined,
    Html5Outlined,
    FileImageOutlined,
    FileWordOutlined,
    FileExcelOutlined
} from '@ant-design/icons';
import { ReportProps } from "powerbi-report-component/lib/types";

const PowerBiContent: React.FC = () => {
    const reports = useSelector((state: RootState) => state.powerbi.reports);
    const currentReport = useSelector((state: RootState) => state.powerbi.selected);

    const dispatch = useDispatch<AppDispatch>();

    const { instance, accounts, inProgress } = useMsal();
    const account = useAccount(accounts[0] || {}) as AccountInfo;
    const [token, setToken] = useState<any>(null);
    const reportRef = useRef(null);
    const [report, setEmbed] = useReport()
    const setReportData = (data: any) => {
        dispatch(setData(data.value))
    }
    const authconfig: any = {
        interactionType: InteractionType.Popup,
        scopes: protectedResources.powerBi.scopes,
        account: account
    }

    const [printMargin, setMargin] = useState({
        top: 80,
        bottom: 60,
        left: 40,
        width: 522
    })


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


    useEffect(() => {
        if (sampleReportConfig.accessToken) {
            const reportconfig: any = {
                embedType: "report",
                tokenType: "Embed",
                accessToken: sampleReportConfig.accessToken,
                embedUrl: sampleReportConfig.embedUrl,
                embedId: sampleReportConfig.id,
                reportMode: "View",
                permissions: "All",
                extraSettings: {
                    filterPaneEnabled: false,
                    navContentPaneEnabled: false
                }
            }
            const demo: any = reportRef.current;
            demo.style = "height:75vh;"
            setEmbed(reportRef, reportconfig);
        }
    }, [sampleReportConfig])
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
    const handleClick = async () => {
        if (report) report.print()
    };

    const exportExcel = async () => {
        try {
            const pages = await report.getPages();
            const activePage = pages[0];

            const visulas = await activePage.getVisuals();
            var wb = XLSX.utils.book_new();
            for (var i = 0; i < visulas.length; i++) {
                const response = await visulas[i].exportData(powerbi.models.ExportDataType.Summarized, 100000);
                console.log(response.data);
                var lines = response.data.split('\n');
                var result = [];
                for (var j = 0; j < lines.length; j++) {
                    var values = lines[j].split(',');
                    result.push(values);
                }
                var ws = XLSX.utils.aoa_to_sheet(result);
                console.log(ws);
                XLSX.utils.book_append_sheet(wb, ws, visulas[i].name)
            }
            XLSX.writeFile(wb, `${activePage.displayName}.xlsx`);

        } catch (error) {
            console.log(error)
        }
    }

    return sampleReportConfig.embedUrl ? <div >
        <Flex justify={"space-between"}>
            <Button onClick={() => handleClick()} icon={<FilePdfOutlined />}>
                PDF
            </Button>
            <Button onClick={() => exportExcel()} icon={<FileImageOutlined />}>
                XLSX
            </Button>
            <Button onClick={() => exportAndDownloadReport(reportid, token.accessToken, false)} icon={<Html5Outlined />}>
                EXPORT (.pbix)
            </Button>
        </Flex>
        <div className={reportClass} style={{
            height: "75vh",
            width: "100%"
        }} ref={reportRef} ></div>
    </div> : <></>;
};

export const PowerBi: React.FC = () => {
    return (
        <div>
            <PowerBiContent />
        </div>
    );
};