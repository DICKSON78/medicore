import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Typography,
} from "@mui/material";
import {
  AssignmentRounded as TotalOrdersIcon,
  HourglassEmptyRounded as PendingIcon,
  PlayCircleRounded as InProgressIcon,
  CheckCircleRounded as ReadyForDeliveryIcon,
  FingerprintRounded as ImpressionsIcon,
  LocalShippingRounded as DeliveriesIcon,
  ErrorOutlineRounded as OverdueIcon,
  CheckCircleOutlineRounded as CompletedIcon,
  LocalShippingRounded as DeliveredIcon,
} from "@mui/icons-material";
import { purple, teal, orange, green, cyan, pink, red, blue, indigo } from "@mui/material/colors";

import Modal from "../../../components/Modal";
import { Header as PageHeader } from "../../../components/Page";
import InfoCard from "../../dashboard/InfoCard";
import { useFetch, useToast } from "../../../hooks";
import { formatError, numberFormat } from "../../../helpers";

const Dashboard = () => {
  const navigate = useNavigate();
  const addToast = useToast();
  const modalRef = useRef();

  const { data, loading, error } = useFetch(
    "/api/dental-lab/dashboard",
    {},
    true,
    null,
    (response) => response.data.data
  );

  useEffect(() => {
    document.title = `Dental Lab Dashboard - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const stats = data || {};

  return (
    <Box>
      <PageHeader title="Dental Lab Dashboard" />

      {loading && <LinearProgress />}

      {data && (
        <>
          <Grid container spacing={{ xs: 2, sm: 2, md: 3 }} sx={{ mb: 3 }}>
            <InfoCard
              title="Total Orders"
              count={numberFormat(stats.total_orders)}
              icon={<TotalOrdersIcon />}
              color={purple[400]}
              onClick={() => navigate("/dental-lab/lab-orders")}
            />
            <InfoCard
              title="Pending Orders"
              count={numberFormat(stats.pending_orders)}
              icon={<PendingIcon />}
              color={teal[400]}
              onClick={() => navigate("/dental-lab/lab-orders?status=Ordered")}
            />
            <InfoCard
              title="In Progress"
              count={numberFormat(stats.in_progress_orders)}
              icon={<InProgressIcon />}
              color={orange[400]}
              onClick={() => navigate("/dental-lab/lab-orders?status=In+Progress")}
            />
            <InfoCard
              title="Ready for Delivery"
              count={numberFormat(stats.ready_for_delivery)}
              icon={<ReadyForDeliveryIcon />}
              color={green[400]}
              onClick={() => navigate("/dental-lab/lab-orders?status=Ready")}
            />
            <InfoCard
              title="Delivered"
              count={numberFormat(stats.delivered_orders || 0)}
              icon={<DeliveredIcon />}
              color={blue[400]}
              onClick={() => navigate("/dental-lab/lab-orders?status=Delivered")}
            />
            <InfoCard
              title="Inserted"
              count={numberFormat(stats.inserted_orders || 0)}
              icon={<CompletedIcon />}
              color={indigo[400]}
              onClick={() => navigate("/dental-lab/lab-orders?status=Inserted")}
            />
            <InfoCard
              title="Today Impressions"
              count={numberFormat(stats.today_impressions)}
              icon={<ImpressionsIcon />}
              color={cyan[400]}
              onClick={() => navigate("/dental-lab/lab-orders")}
            />
            <InfoCard
              title="Today Deliveries"
              count={numberFormat(stats.today_deliveries)}
              icon={<DeliveriesIcon />}
              color={pink[400]}
              onClick={() => navigate("/dental-lab/lab-orders")}
            />
            <InfoCard
              title="Overdue Orders"
              count={numberFormat(stats.overdue_orders || 0)}
              icon={<OverdueIcon />}
              color={red[400]}
              onClick={() => navigate("/dental-lab/lab-orders")}
            />
            <InfoCard
              title="Total Cost (TZS)"
              count={numberFormat(stats.total_cost || 0)}
              icon={<TotalOrdersIcon />}
              color={purple[400]}
            />
          </Grid>

          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Recent Lab Orders</Typography>
              {stats.recent_orders?.length > 0 ? (
                <Grid container spacing={2}>
                  {stats.recent_orders.map((order) => {
                    const patientId = order.payment_cache_item?.payment_cache?.check_in?.patient_id;
                    const consultationId = order.consultation_id;
                    return (
                      <Grid item xs={12} sm={6} md={4} key={order.id}>
                        <Card
                          variant="outlined"
                          sx={{ cursor: "pointer" }}
                          onClick={() => {
                            if (patientId && consultationId) {
                              navigate(`/dental-lab/lab-orders/${patientId}/${consultationId}`);
                            }
                          }}
                        >
                          <CardContent>
                            <Typography variant="subtitle2">DL-{order.id} - {order.order_type}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              Status: {order.status}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Lab: {order.lab_name || "N/A"}
                            </Typography>
                            {order.cost && (
                              <Typography variant="body2" color="text.secondary">
                                Cost: TZS {Number(order.cost).toLocaleString()}
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              ) : (
                <Typography color="text.secondary">No recent orders</Typography>
              )}
            </CardContent>
          </Card>

          <Modal ref={modalRef} />
        </>
      )}
    </Box>
  );
};

export default Dashboard;
