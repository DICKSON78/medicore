import React, { useMemo, useState } from "react";
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import { ThemeProvider } from "@mui/material/styles";
import { ToastContextProvider } from "../contexts/ToastContext";
import { FilterProvider } from "../contexts/FilterContext";
import { NotificationProvider } from "../contexts/NotificationContext";
import lightTheme from "../themes/light";
import darkTheme from "../themes/dark";

import AuthLayout from "../layouts/Auth";
import DefaultLayout from "../layouts/Default";
import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";
import ReceptionRoutes from "../pages/reception/ReceptionRoutes";
import PaymentCenterRoutes from "../pages/payment-center/PaymentCenterRoutes";
import ConsultationRoomRoutes from "../pages/consultation-room/ConsultationRoomRoutes";
import DentalLabRoutes from "../pages/dental-lab/DentalLabRoutes";
import MedicineCenterRoutes from "../pages/medicine-center/MedicineCenterRoutes";
import ProcedureRoomRoutes from "../pages/procedure-room/ProcedureRoomRoutes";
import DispensingMainRoutes from "../pages/dispensing/DispensingMainRoutes";
import OtherDispensingRoutes from "../pages/other-dispensing/OtherDispensingRoutes";
import InventoryManagementRoutes from "../pages/inventory-management/InventoryManagementRoutes";
import MarketingRoutes from "../pages/marketing/MarketingRoutes";
import FinancialManagementRoutes from "../pages/financial-management/FinancialManagementRoutes";
import DentalMorbidityReport from "../pages/reports/dental/DentalMorbidityReport";
import DentalAppointments from "../pages/appointments/DentalAppointments";
import UserManagementRoutes from "../pages/user-management/UserManagementRoutes";
import PatientRecordsRoutes from "../pages/patient-records/PatientRecordsRoutes";
import SettingsRoutes from "../pages/settings/SettingsRoutes";
import MohReportsRoutes from "../pages/moh-reports/MohReportsRoutes";

const App = () => {
  const [themeMode, setThemeMode] = useState(
    window.localStorage.getItem("theme_mode") || "light"
  );

  const theme = useMemo(() => {
    return themeMode === "light" ? lightTheme : darkTheme;
  }, [themeMode]);

  const [user, setUser] = useState();
  const [smsBalance, setSmsBalance] = useState(0);

  return (
    <ThemeProvider theme={theme}>
      <ToastContextProvider>
        <FilterProvider>
          <NotificationProvider>
            <CssBaseline />
            <GlobalStyles
              styles={{
                "*::selection": {
                  backgroundColor: theme.palette.primary.main,
                  color: "#fff",
                },
              }}
            />
            <Router
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
          <Routes>
            <Route
              path="/"
              exact
              element={<Navigate to="/login" />}
            />
            <Route
              path="/"
              element={<AuthLayout />}
            >
              <Route
                path="/login"
                element={<Login />}
              />
            </Route>
            <Route
              path="/"
              element={
                <DefaultLayout
                  setUser={setUser}
                  smsBalance={smsBalance}
                />
              }
            >
              <React.Fragment>
                <Route
                  path="dashboard"
                  element={<Dashboard setSmsBalance={setSmsBalance} />}
                />
                <Route
                  path="patient-records/*"
                  element={<PatientRecordsRoutes />}
                />
                <Route
                  path="reception/*"
                  element={
                    user?.privileges?.reception ? <ReceptionRoutes /> : null
                  }
                />
                <Route
                  path="payment-center/*"
                  element={
                    user?.privileges?.payment_center ? (
                      <PaymentCenterRoutes />
                    ) : null
                  }
                />
                <Route
                  path="consultation-room/*"
                  element={
                    user?.privileges?.consultation_room ? (
                      <ConsultationRoomRoutes />
                    ) : null
                  }
                />
                <Route
                  path="optician-center/*"
                  element={null}
                />
                <Route
                  path="dental-lab/*"
                  element={<DentalLabRoutes />}
                />
                <Route
                  path="medicine-center/*"
                  element={
                    user?.privileges?.medicine_center ? (
                      <MedicineCenterRoutes />
                    ) : null
                  }
                />
                <Route
                  path="dispensing/*"
                  element={<DispensingMainRoutes />}
                />
                <Route
                  path="procedure-room/*"
                  element={
                    user?.privileges?.procedure_room ? (
                      <ProcedureRoomRoutes />
                    ) : null
                  }
                />
                <Route
                  path="other-dispensing/*"
                  element={
                    user?.privileges?.other_dispensing ? (
                      <OtherDispensingRoutes />
                    ) : null
                  }
                />
                <Route
                  path="inventory-management/*"
                  element={
                    user?.privileges?.inventory_management ? (
                      <InventoryManagementRoutes />
                    ) : null
                  }
                />
                <Route
                  path="marketing/*"
                  element={
                    user?.privileges?.marketing ? <MarketingRoutes /> : null
                  }
                />
                <Route
                  path="financial-management/*"
                  element={
                    user?.privileges?.financial_management ? (
                      <FinancialManagementRoutes />
                    ) : null
                  }
                />
                <Route
                  path="user-management/*"
                  element={
                    user?.privileges?.user_management ? (
                      <UserManagementRoutes />
                    ) : null
                  }
                />
                <Route
                  path="settings/*"
                  element={
                    user?.privileges?.settings ? <SettingsRoutes /> : null
                  }
                />
                <Route
                  path="reports/dental-morbidity"
                  element={
                    user?.privileges?.consultation_room ? (
                      <DentalMorbidityReport />
                    ) : null
                  }
                />
                <Route
                  path="dental-appointments"
                  element={<DentalAppointments />}
                />
                <Route
                  path="moh-reports/*"
                  element={<MohReportsRoutes />}
                />
              </React.Fragment>
            </Route>
          </Routes>
            </Router>
          </NotificationProvider>
        </FilterProvider>
      </ToastContextProvider>
    </ThemeProvider>
  );
};

export default App;
