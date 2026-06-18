import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  LinearProgress,
  Typography,
} from "@mui/material";
import {
  Person2Rounded as PatientIcon,
  AddRounded as LensIcon,
  AssessmentRounded as RefractionIcon,
  MedicalServicesRounded as EyeExamIcon,
  LibraryBooksRounded as ReportsIcon,
  ScheduleRounded as ScheduleIcon,
  InventoryRounded as InventoryIcon,
  LocalPharmacyRounded as GlassIcon,
} from "@mui/icons-material";
import {
  cyan,
  green,
  lime,
  orange,
  pink,
  purple,
  teal,
} from "@mui/material/colors";

import { Header as PageHeader } from "../../../components/Page";
import InfoCard from "../../dashboard/InfoCard";
import { useFetch, useToast } from "../../../hooks";
import { formatError, numberFormat, getWeekStartDate, getWeekEndDate } from "../../../helpers";

const Dashboard = () => {
  const navigate = useNavigate();
  const addToast = useToast();

  const [dateParams] = useState({
    start_date: getWeekStartDate().toISOString().split('T')[0],
    end_date: getWeekEndDate().toISOString().split('T')[0],
  });

  const { data, loading, error } = useFetch(
    "api/optician-center/dashboard",
    dateParams,
    true,
    {
      summary: {
        total_glass_patients: 0,
        glass_patients_today: 0,
        refractions_today: 0,
        lens_fittings: 0,
        scheduled_appointments: 0,
        completed_appointments: 0,
        pending_appointments: 0,
        total_revenue: 0,
        items_dispensed: 0,
      },
      statistics: {
        appointments_by_status: [],
        revenue_trend: [],
        top_items_dispensed: [],
        appointments_trend: [],
      },
    },
    (response) => response.data.data
  );

  useEffect(() => {
    document.title = `Optician Center Dashboard - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error, addToast]);

  if (loading) {
    return (
      <Box>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader title="Optician Center Dashboard" />
      {!loading && data ? (
        <Grid
          container
          spacing={{ xs: 2, sm: 2, md: 3 }}
          sx={{ mb: 4 }}
        >
          <InfoCard
            title="Total Glass Patients"
            count={numberFormat(data.summary?.total_glass_patients || 0)}
            icon={<GlassIcon />}
            color={purple[300]}
            onClick={() => navigate('/optician-center/glass-patients')}
          />
          <InfoCard
            title="Glass Patients Today"
            count={numberFormat(data.summary?.glass_patients_today || 0)}
            icon={<PatientIcon />}
            color={teal[400]}
            onClick={() => navigate('/optician-center/glass-patients')}
          />
          <InfoCard
            title="Refractions Today"
            count={numberFormat(data.summary?.refractions_today || 0)}
            icon={<RefractionIcon />}
            color={green[400]}
            onClick={() => navigate('/optician-center/glass-patients')}
          />
          <InfoCard
            title="Lens Fittings"
            count={numberFormat(data.summary?.lens_fittings || 0)}
            icon={<LensIcon />}
            color={teal[400]}
            onClick={() => navigate('/optician-center/dispensing-requests')}
          />
          <InfoCard
            title="Scheduled Appointments"
            count={numberFormat(data.summary?.scheduled_appointments || 0)}
            icon={<ScheduleIcon />}
            color={orange[400]}
            onClick={() => navigate('/optician-center/glass-patients')}
          />
          <InfoCard
            title="Completed Appointments"
            count={numberFormat(data.summary?.completed_appointments || 0)}
            icon={<EyeExamIcon />}
            color={cyan[500]}
            onClick={() => navigate('/optician-center/glass-patients')}
          />
          <InfoCard
            title="Pending Appointments"
            count={numberFormat(data.summary?.pending_appointments || 0)}
            icon={<ReportsIcon />}
            color={pink[400]}
            onClick={() => navigate('/optician-center/glass-patients')}
          />
          <InfoCard
            title="Items Dispensed"
            count={numberFormat(data.summary?.items_dispensed || 0)}
            icon={<InventoryIcon />}
            color={lime[600]}
            onClick={() => navigate('/optician-center/reports/items-dispensed')}
          />
        </Grid>
      ) : (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <Typography variant="h6">No data available.</Typography>
        </Box>
      )}
    </Box>
  );
};

export default Dashboard;
