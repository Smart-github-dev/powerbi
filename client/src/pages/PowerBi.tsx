import React, { useEffect, useRef, useState } from "react";
import { useMsal, useAccount, useMsalAuthentication } from "@azure/msal-react";
import { InteractionRequiredAuthError, AccountInfo, InteractionType } from "@azure/msal-browser";

import { protectedResources } from "../authConfig";
import { getrepots, gettoken } from "../powerBiConfig"
import { callApiWIthTokenAndBody, callApiWithToken, exportAndDownloadReport } from "../fetch";
import { ProfileData } from "../components/ProfileData";
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { setData } from '../store/rootReducer';
import { PowerBIEmbed } from 'powerbi-client-react';

import { models, Report, Embed, service, Page, } from 'powerbi-client';
import * as pbi from 'powerbi-client';

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
    const reportRef = useRef(null);

    const setReportData = (data: any) => {
        dispatch(setData(data.value))
    }
    const authconfig: any = {
        interactionType: InteractionType.Popup,
        scopes: protectedResources.powerBi.scopes,
        account: account
    }

    const [report, setReport] = useState<any>();


    const [eventHandlersMap, setEventHandlersMap] = useState<Map<string, (event?: service.ICustomEvent<any>, embeddedEntity?: Embed) => void | null>>(new Map([
        ['loaded', (event) => {
            //@ts-ignore
            console.log(event.exportData);
            report.getPages().then((pages: any) => {
                const activePage = pages[0];
                activePage.getVisuals().then((visuals: any) => {
                    const visual = visuals[0];
                    console.log(visual)
                })
            })

            setReport(event)
        }],
        ['rendered', () => console.log('Report has rendered')],
        ['error', (event?: service.ICustomEvent<any>) => {
            if (event) {
                console.error(event.detail);
            }
        },
        ],
        ['visualClicked', () => console.log('visual clicked')],
        ['pageChanged', (event) => console.log(event)],
    ]));


    const setDataSelectedEvent = () => {
        // setEventHandlersMap(new Map<string, (event?: service.ICustomEvent<any>, embeddedEntity?: Embed) => void | null>([
        //     ...eventHandlersMap,
        //     ['dataSelected', (event) => console.log(event)],
        // ]));

        console.log('Data Selected event set successfully. Select data to see event in console.');
    }


    const changeVisualType = async (): Promise<void> => {
        // Check if report is available or not
        if (!report) {
            console.log('Report not available');
            return;
        }

        // Get active page of the report
        const activePage: Page | undefined = await report.getActivePage();

        if (!activePage) {
            console.log('No Active page found');
            return;
        }

        try {
            const visual: any = await activePage.getVisualByName('VisualContainer6');

            const response = await visual.changeType('lineChart');

            console.log(`The ${visual.type} was updated to lineChart.`);

            return response;
        }
        catch (error) {
            if (error === 'PowerBIEntityNotFound') {
                console.log('No Visual found with that name');
            } else {
                console.log(error);
            }
        }
    };


    // const exportAndDownloadReport = async (reportid: string, accesstoken: string, exportFormat: string) => {
    //     try {
    //         const result = await report.exportData(models.ExportDataType.Summarized, exportFormat);
    //         const downloadLink = document.createElement('a');
    //         downloadLink.href = result.fileUrl;
    //         downloadLink.download = `exported_report.${exportFormat.toLowerCase()}`;
    //         downloadLink.click();
    //         console.log('Exported data:', result);
    //     } catch (error) {
    //         console.error('Error:', error);
    //     }
    // };

    useMsalAuthentication(authconfig);

    const [sampleReportConfig, setReportConfig] = useState<models.IReportEmbedConfiguration>({
        type: 'report',
        id: undefined,
        embedUrl: undefined,
        tokenType: models.TokenType.Embed,
        accessToken: undefined,
        permissions: models.Permissions.All,
        settings: {
            background: models.BackgroundType.Transparent,
            filterPaneEnabled: true,
            navContentPaneEnabled: true
        },
    });




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
                    embedUrl: _report.embedUrl,
                    accessToken: fetchToken.token
                });
                console.log(sampleReportConfig, fetchToken)
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
    return sampleReportConfig.embedUrl ? <div >
        <Flex justify={"space-between"}>
            <Button onClick={() => exportAndDownloadReport(reportid, accessToken, "PDF")} icon={<FilePdfOutlined />}>
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
        <PowerBIEmbed
            embedConfig={sampleReportConfig}
            eventHandlers={eventHandlersMap}
            cssClassName={reportClass}
            getEmbeddedComponent={(embedObject: Embed) => {
                console.log(`Embedded object of type "${embedObject.embedtype}" received`);
                // console.log(embedObject)
                // setReport(embedObject as Report);
            }}
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