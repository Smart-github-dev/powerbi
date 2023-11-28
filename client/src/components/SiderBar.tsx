import React, { useState } from "react";
import {
    FundOutlined,
    UploadOutlined,
    UserOutlined,
    VideoCameraOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Button, theme, Flex } from 'antd';
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from '../store';
import { selectReport } from "../store/rootReducer"
const { Header, Sider, Content } = Layout;

const SiderBar: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const dispatch = useDispatch<AppDispatch>();

    const reports = useSelector((state: RootState) => state.powerbi.reports);
    const reportDetail = ({ key }: any) => {
        console.log(key)
        dispatch(selectReport(key))
    }
    return (
        <Sider trigger={null} collapsible collapsed={collapsed} style={{ minHeight: "85vh" }}>
            <div className="demo-logo-vertical" />
            <Menu
                theme="dark"
                mode="inline"
                defaultSelectedKeys={['1']}
                onClick={reportDetail}
                items={reports.map((report: any, index: number) => {
                    return {
                        key: (index),
                        icon: <FundOutlined />,
                        label: report.name
                    }
                })}
            />
        </Sider>
    )
}

export default SiderBar;