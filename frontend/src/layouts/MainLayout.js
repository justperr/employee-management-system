import { useState } from "react";
import {
  Layout,
  Menu,
  Typography,
  Button,
  Drawer,
} from "antd";
import {
  DashboardOutlined,
  TeamOutlined,
  ApartmentOutlined,
  SolutionOutlined,
  FileTextOutlined,
  LogoutOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import {
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import authService from "../services/authService";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const user = authService.getCurrentUser();

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const menuItems = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/employees",
      icon: <TeamOutlined />,
      label: "Employees",
    },
    {
      key: "/departments",
      icon: <ApartmentOutlined />,
      label: "Departments",
    },
    {
      key: "/positions",
      icon: <SolutionOutlined />,
      label: "Positions",
    },
    {
      key: "/reports",
      icon: <FileTextOutlined />,
      label: "Reports",
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    authService.logout();

    navigate("/", {
      replace: true,
    });
  };

  const menu = (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[location.pathname]}
      items={menuItems}
      onClick={handleMenuClick}
    />
  );

  return (
    <Layout
      style={{
        minHeight: "100vh",
      }}
    >
      {/* DESKTOP SIDEBAR */}

      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        trigger={null}
        className="desktop-sidebar"
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          height: "100vh",
          overflow: "auto",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            height: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: "18px",
            fontWeight: "bold",
          }}
        >
          EMS
        </div>

        {menu}
      </Sider>

      {/* MOBILE SIDEBAR */}

      <Drawer
        placement="left"
        open={mobileMenuOpen}
        onClose={() =>
          setMobileMenuOpen(false)
        }
        width={200}
        closable={false}
        styles={{
          body: {
            padding: 0,
            background: "#001529",
          },
        }}
      >
        <div
          style={{
            height: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: "18px",
            fontWeight: "bold",
          }}
        >
          EMS
        </div>

        {menu}
      </Drawer>

      {/* MAIN APPLICATION AREA */}

      <Layout
        className="main-layout"
        style={{
          marginLeft: 200,
          minHeight: "100vh",
        }}
      >
        <Header
          style={{
            padding: "0 24px",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom:
              "1px solid #f0f0f0",
            position: "sticky",
            top: 0,
            zIndex: 998,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              minWidth: 0,
            }}
          >
            {/* MOBILE HAMBURGER */}

            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() =>
                setMobileMenuOpen(true)
              }
              className="mobile-menu-button"
              style={{
                display: "none",
                fontSize: "18px",
              }}
            />

            <Text
              strong
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow:
                  "ellipsis",
              }}
            >
              Employee Management System
            </Text>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              flexShrink: 0,
            }}
          >
            <Text className="header-user">
              {user?.email || "User"}
            </Text>

            <Button
              type="text"
              danger
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </Header>

        <Content
          style={{
            margin: "24px",
            padding: "24px",
            background: "#fff",
            minHeight:
              "calc(100vh - 112px)",
            borderRadius: "8px",
          }}
        >
          <Outlet />
        </Content>
      </Layout>

      {/* RESPONSIVE STYLES */}

      <style>
        {`
          @media (max-width: 991px) {
            .desktop-sidebar {
              display: none !important;
            }

            .main-layout {
              margin-left: 0 !important;
            }

            .mobile-menu-button {
              display: inline-flex !important;
            }

            .header-user {
              display: none;
            }

            .ant-layout-content {
              margin: 16px !important;
              padding: 20px !important;
            }
          }

          @media (max-width: 576px) {
            .ant-layout-header {
              padding: 0 16px !important;
            }

            .ant-layout-content {
              margin: 12px !important;
              padding: 16px !important;
            }

            .ant-layout-header .ant-btn {
              padding-inline: 8px;
            }
          }
        `}
      </style>
    </Layout>
  );
};

export default MainLayout;