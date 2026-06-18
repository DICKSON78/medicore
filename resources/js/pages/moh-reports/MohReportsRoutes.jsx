import React from "react";
import { Route, Routes } from "react-router-dom";
import MonthlyOPDReport from "./MonthlyOPDReport";
import PharmaceuticalConsumption from "./PharmaceuticalConsumption";
import RevenueSummary from "./RevenueSummary";
import IPDReport from "./IPDReport";

const MohReportsRoutes = () => {
  return (
    <Routes>
      <Route path="/monthly-opd" element={<MonthlyOPDReport />} />
      <Route path="/pharmaceutical-consumption" element={<PharmaceuticalConsumption />} />
      <Route path="/revenue-summary" element={<RevenueSummary />} />
      <Route path="/ipd-report" element={<IPDReport />} />
    </Routes>
  );
};

export default MohReportsRoutes;
