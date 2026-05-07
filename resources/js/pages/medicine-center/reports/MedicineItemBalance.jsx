import React, { useEffect, useState } from "react";
import { Stack, Tooltip, IconButton } from "@mui/material";
import RefreshIcon from "@mui/icons-material/RefreshRounded";

import Page from "../../../components/Page";
import Report from "../../../components/reports/Report";
import { SearchTextField } from "../../../components/Table";
import Select from "../../../components/Select";

import { numberFormat, throttle } from "../../../helpers";

const MedicineItemBalance = ({ module, consultationType }) => {
  const [params, setParams] = useState({
    status: "Active",
    q: undefined,
    report_period: "weekly",
  });

  useEffect(() => {
    document.title = `Medicine Item Balance Report - ${window.APP_NAME}`;
  }, []);

  const getReportPeriodTitle = () => {
    switch (params.report_period) {
      case "daily":
        return "Daily Report";
      case "weekly":
        return "Weekly Report";
      case "monthly":
        return "Monthly Report";
      case "yearly":
        return "Yearly Report";
      default:
        return "";
    }
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: module || "Medicine Center" },
        { title: "Medicine Item Balance" },
      ]}
    >
      <Report
        title={`Medicine Item Balance Report - ${getReportPeriodTitle()}`}
        uri="api/medicines"
        params={{ ...params, status: "Active" }}
        prependInner={
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mb: 2 }}>
            <Select
              label="Report Period"
              options={[
                { id: "daily", name: "Daily" },
                { id: "weekly", name: "Weekly" },
                { id: "monthly", name: "Monthly" },
                { id: "yearly", name: "Yearly" },
              ]}
              optionsLabel="name"
              optionsValue="id"
              value={params.report_period}
              onChange={(value) =>
                setParams({ ...params, report_period: value })
              }
              sx={{ minWidth: 180 }}
            />
            <SearchTextField
              label="Search"
              placeholder="Search by name..."
              onChange={(value) =>
                throttle(() => setParams(prev => ({ ...prev, q: value })), 500)
              }
              sx={{ width: 250 }}
            />
          </Stack>
        }
        columns={[
          {
            field: "name",
            headerName: "Item Name",
            valueGetter: (item) => item.name,
            tableCellProps: { sx: { width: 250 } },
          },
          {
            field: "balance",
            headerName: "Total Items",
            tableCellProps: { sx: { width: 120 } },
            valueGetter: (item) => {
              const balance = parseFloat(item.balance) || 0;
              return numberFormat(balance < 0 ? 0 : balance);
            },
          },
          {
            field: "issued_today",
            headerName: "Issued Per Day",
            tableCellProps: { sx: { width: 120 } },
            valueGetter: (item) => {
              const issued = parseInt(item.issued_today) || 0;
              return numberFormat(issued);
            },
          },
          {
            field: "remaining_stock",
            headerName: "Remain Stock",
            tableCellProps: { sx: { width: 120 } },
            valueGetter: (item) => {
              const balance = parseFloat(item.balance) || 0;
              const issued = parseInt(item.issued_today) || 0;
              const remaining = balance - issued;
              return numberFormat(remaining < 0 ? 0 : remaining);
            },
          },
          {
            field: "expiry_date",
            headerName: "Expiry Date",
            tableCellProps: { sx: { width: 150 } },
            valueGetter: (item) => {
              if (!item.expiry_date) return "No expiry";
              const expiryDate = new Date(item.expiry_date);
              const now = new Date();
              const formattedDate = expiryDate.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              });
              // Mark expired items
              if (expiryDate < now) {
                return `${formattedDate} (Expired)`;
              }
              return formattedDate;
            },
          },
        ]}
        summationFooterColumns={[
          { value: "Totals", span: 2, tableCellProps: { sx: { fontWeight: "bold" } } },
          {
            reducer: (total, item) => total + (parseFloat(item.balance) < 0 ? 0 : parseFloat(item.balance) || 0),
          },
          {
            reducer: (total, item) => total + (parseInt(item.issued_today) || 0),
          },
          {
            reducer: (total, item) => {
              const balance = parseFloat(item.balance) || 0;
              const issued = parseInt(item.issued_today) || 0;
              const remaining = balance - issued;
              return total + (remaining < 0 ? 0 : remaining);
            },
          },
          { value: "" },
        ]}
      />
    </Page>
  );
};

export default MedicineItemBalance;
