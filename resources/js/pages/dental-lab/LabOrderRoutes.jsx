import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box, Button, Card, CardContent, Chip, Grid, LinearProgress,
  Paper, Stack, Typography,
} from "@mui/material";
import { Header as PageHeader } from "../../components/Page";
import TextField from "../../components/TextField";
import Select from "../../components/Select";
import DatePicker from "../../components/DatePicker";
import { useFetch, usePatch, useToast } from "../../hooks";
import { formatDate } from "../../helpers";
import { DENTAL_TREATMENT_OPTIONS } from "../../constants";

const statusColors = {
  Ordered: "warning",
  "In Progress": "info",
  Ready: "success",
  Delivered: "secondary",
  Inserted: "primary",
};

const MATERIAL_OPTIONS = [
  { label: "PFM", value: "PFM" },
  { label: "Zirconia", value: "Zirconia" },
  { label: "E-max", value: "Emax" },
  { label: "Composite", value: "Composite" },
  { label: "Acrylic", value: "Acrylic" },
  { label: "Metal Alloy", value: "MetalAlloy" },
  { label: "Cobalt Chrome", value: "CobaltChrome" },
];

const LabOrderRoutes = () => {
  const { patientId, consultationId } = useParams();
  const navigate = useNavigate();
  const addToast = useToast();
  const [patient, setPatient] = useState(null);
  const [consultation, setConsultation] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patch, saving] = usePatch();

  const [showForm, setShowForm] = useState(false);
  const [orderForm, setOrderForm] = useState({
    consultation_id: consultationId,
    order_type: "",
    description: "",
    material: "",
    shade: "",
    tooth_number: "",
    teeth_involved: [],
    lab_name: "",
    lab_notes: "",
    cost: "",
    impression_date: "",
    delivery_date: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [patRes, conRes, ordRes] = await Promise.all([
          fetch(`/api/patients/${patientId}`),
          fetch(`/api/consultations/${consultationId}`),
          fetch(`/api/dental-lab-orders?consultation_id=${consultationId}`),
        ]);
        setPatient((await patRes.json()).data);
        setConsultation((await conRes.json()).data);
        const ordData = (await ordRes.json()).data?.data || [];
        setOrders(ordData);
      } catch (e) {
        addToast("Failed to load data", { variant: "error" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [patientId, consultationId]);

  const handleCreateOrder = async () => {
    try {
      const payload = {
        ...orderForm,
        teeth_involved: orderForm.teeth_involved.length > 0 ? orderForm.teeth_involved : undefined,
      };
      const res = await fetch("/api/dental-lab-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.data) {
        setOrders([json.data, ...orders]);
        setShowForm(false);
        setOrderForm({
          consultation_id: consultationId,
          order_type: "", description: "", material: "", shade: "",
          tooth_number: "", teeth_involved: [], lab_name: "", lab_notes: "",
          cost: "", impression_date: "", delivery_date: "",
        });
        addToast("Lab order created", { variant: "success" });
      }
    } catch (e) {
      addToast("Failed to create order", { variant: "error" });
    }
  };

  const handleStatus = async (id, status) => {
    const endpoint = status === "Ready"
      ? `/api/dental-lab-orders/${id}/mark-delivered`
      : status === "Inserted"
        ? `/api/dental-lab-orders/${id}/mark-inserted`
        : `/api/dental-lab-orders/${id}`;
    try {
      if (status === "Ready" || status === "Inserted") {
        await patch(endpoint, {});
      } else {
        await patch(endpoint, { status });
      }
      const res = await fetch(`/api/dental-lab-orders?consultation_id=${consultationId}`);
      setOrders((await res.json()).data?.data || []);
      addToast("Status updated", { variant: "success" });
    } catch {
      addToast("Failed to update", { variant: "error" });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this lab order?")) return;
    try {
      await fetch(`/api/dental-lab-orders/${id}`, { method: "DELETE" });
      setOrders(orders.filter((o) => o.id !== id));
      addToast("Lab order deleted", { variant: "success" });
    } catch {
      addToast("Failed to delete", { variant: "error" });
    }
  };

  const handlePrintSlip = (order) => {
    const printWindow = window.open("", "_blank");
    const teethLabels = order.teeth_involved
      ? (Array.isArray(order.teeth_involved) ? order.teeth_involved : [order.teeth_involved])
          .map((t) => {
            const found = DENTAL_TREATMENT_OPTIONS.toothNumbers.find((tn) => tn.value === String(t));
            return found ? found.label : `Tooth ${t}`;
          }).join(", ")
      : (order.tooth_number
          ? (DENTAL_TREATMENT_OPTIONS.toothNumbers.find((tn) => tn.value === order.tooth_number)?.label || `Tooth ${order.tooth_number}`)
          : "N/A");

    printWindow.document.write(`
      <html>
      <head><title>Lab Slip - DL-${order.id}</title>
      <style>
        body { font-family: 'Courier New', monospace; padding: 20px; max-width: 400px; margin: auto; }
        h1 { font-size: 18px; text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; }
        h2 { font-size: 14px; text-align: center; margin: 4px 0; }
        .info { margin: 12px 0; }
        .info div { margin: 4px 0; }
        .label { font-weight: bold; display: inline-block; width: 100px; }
        .footer { margin-top: 24px; text-align: center; font-size: 11px; border-top: 1px dashed #999; padding-top: 8px; }
        @media print { .no-print { display: none; } }
      </style>
      </head>
      <body>
        <h1>DENTAL LAB SLIP</h1>
        <h2>Order #DL-${order.id}</h2>
        <hr/>
        <div class="info">
          <div><span class="label">Patient:</span> ${patient?.first_name || ""} ${patient?.last_name || ""}</div>
          <div><span class="label">Order Type:</span> ${order.order_type || ""}</div>
          <div><span class="label">Material:</span> ${order.material || "N/A"}</div>
          <div><span class="label">Shade:</span> ${order.shade || "N/A"}</div>
          <div><span class="label">Tooth/Teeth:</span> ${teethLabels}</div>
          <div><span class="label">Description:</span> ${order.description || "N/A"}</div>
          <div><span class="label">Lab Name:</span> ${order.lab_name || "N/A"}</div>
          <div><span class="label">Impression:</span> ${order.impression_date || "N/A"}</div>
          <div><span class="label">Delivery:</span> ${order.delivery_date || "N/A"}</div>
          ${order.lab_notes ? `<div><span class="label">Lab Notes:</span> ${order.lab_notes}</div>` : ""}
          <div><span class="label">Cost:</span> ${order.cost ? `TZS ${Number(order.cost).toLocaleString()}` : "N/A"}</div>
        </div>
        <hr/>
        <div style="margin-top: 12px;">
          <div>Ordered by: ${order.ordered_by || "______________"}</div>
          <div>Date: ${order.created_at ? formatDate(order.created_at) : new Date().toLocaleDateString()}</div>
        </div>
        <div class="footer">--- This is a computer-generated lab slip ---</div>
        <button class="no-print" onclick="window.print()" style="display:block;margin:20px auto;padding:8px 24px;font-size:14px;">Print</button>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) return <LinearProgress />;

  return (
    <Box>
      <PageHeader
        title="Dental Lab - Order Management"
        trailing={
          <Button variant="outlined" size="small" onClick={() => navigate("/dental-lab/lab-orders")}>
            Back to Orders
          </Button>
        }
      />
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <Typography variant="body2" color="text.secondary">Patient</Typography>
            <Typography variant="body1" fontWeight={500}>
              {patient?.first_name} {patient?.last_name}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={2}>
            <Typography variant="body2" color="text.secondary">Gender</Typography>
            <Typography variant="body1">{patient?.gender}</Typography>
          </Grid>
          <Grid item xs={6} sm={2}>
            <Typography variant="body2" color="text.secondary">Age</Typography>
            <Typography variant="body1">{patient?.age || ""}</Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography variant="body2" color="text.secondary">Phone</Typography>
            <Typography variant="body1">{patient?.phone}</Typography>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6">Lab Orders ({orders.length})</Typography>
        <Button variant="contained" size="small" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "New Order"}
        </Button>
      </Box>

      {showForm && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>Create Lab Order</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Select
                  label="Order Type"
                  value={orderForm.order_type}
                  options={DENTAL_TREATMENT_OPTIONS.labOrderTypes}
                  onChange={(e) => setOrderForm({ ...orderForm, order_type: e.target.value })}
                  fullWidth size="small"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <Select
                  label="Material"
                  value={orderForm.material}
                  options={MATERIAL_OPTIONS}
                  onChange={(e) => setOrderForm({ ...orderForm, material: e.target.value })}
                  fullWidth size="small"
                />
              </Grid>
              <Grid item xs={4} sm={2}>
                <TextField
                  label="Shade"
                  value={orderForm.shade}
                  onChange={(e) => setOrderForm({ ...orderForm, shade: e.target.value })}
                  fullWidth size="small"
                />
              </Grid>
              <Grid item xs={4} sm={2}>
                <Select
                  label="Primary Tooth"
                  value={orderForm.tooth_number}
                  options={DENTAL_TREATMENT_OPTIONS.toothNumbers}
                  onChange={(e) => setOrderForm({ ...orderForm, tooth_number: e.target.value })}
                  fullWidth size="small"
                />
              </Grid>
              <Grid item xs={4} sm={2}>
                <TextField
                  label="Lab Name"
                  value={orderForm.lab_name}
                  onChange={(e) => setOrderForm({ ...orderForm, lab_name: e.target.value })}
                  fullWidth size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  value={orderForm.description}
                  onChange={(e) => setOrderForm({ ...orderForm, description: e.target.value })}
                  multiline rows={2} fullWidth size="small"
                />
              </Grid>
              <Grid item xs={4}>
                <DatePicker
                  label="Impression Date"
                  value={orderForm.impression_date}
                  onChange={(v) => setOrderForm({ ...orderForm, impression_date: v })}
                  size="small"
                />
              </Grid>
              <Grid item xs={4}>
                <DatePicker
                  label="Expected Delivery"
                  value={orderForm.delivery_date}
                  onChange={(v) => setOrderForm({ ...orderForm, delivery_date: v })}
                  size="small"
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Cost (TZS)"
                  value={orderForm.cost}
                  onChange={(e) => setOrderForm({ ...orderForm, cost: e.target.value })}
                  type="number" fullWidth size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Lab Notes"
                  value={orderForm.lab_notes}
                  onChange={(e) => setOrderForm({ ...orderForm, lab_notes: e.target.value })}
                  multiline rows={2} fullWidth size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" onClick={handleCreateOrder} disabled={saving}>
                  Create Order
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {orders.length === 0 ? (
        <Typography color="text.secondary">No lab orders yet</Typography>
      ) : (
        orders.map((order) => (
          <Card key={order.id} sx={{ mb: 1.5 }}>
            <CardContent sx={{ py: 1.5 }}>
              <Grid container alignItems="center" spacing={2}>
                <Grid item xs={12} sm={2}>
                  <Typography variant="body2" fontWeight={600}>
                    DL-{order.id}
                  </Typography>
                  {order.cost && (
                    <Typography variant="caption" color="text.secondary">
                      TZS {Number(order.cost).toLocaleString()}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={6} sm={1.5}>
                  <Typography variant="caption" color="text.secondary">Type</Typography>
                  <Typography variant="body2">{order.order_type}</Typography>
                </Grid>
                <Grid item xs={6} sm={1.5}>
                  <Typography variant="caption" color="text.secondary">Material</Typography>
                  <Typography variant="body2">{order.material || "-"}</Typography>
                </Grid>
                <Grid item xs={6} sm={1}>
                  <Typography variant="caption" color="text.secondary">Shade</Typography>
                  <Typography variant="body2">{order.shade || "-"}</Typography>
                </Grid>
                <Grid item xs={6} sm={1}>
                  <Typography variant="caption" color="text.secondary">Tooth</Typography>
                  <Typography variant="body2">{order.tooth_number || "-"}</Typography>
                </Grid>
                <Grid item xs={6} sm={1.5}>
                  <Typography variant="caption" color="text.secondary">Lab</Typography>
                  <Typography variant="body2">{order.lab_name || "-"}</Typography>
                </Grid>
                <Grid item xs={6} sm={1.5}>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Chip label={order.status} color={statusColors[order.status] || "default"} size="small" />
                </Grid>
                <Grid item xs={12} sm={2.5}>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                    {order.status === "Ordered" && (
                      <Button size="small" variant="outlined" onClick={() => handleStatus(order.id, "In Progress")}>
                        Start
                      </Button>
                    )}
                    {order.status === "In Progress" && (
                      <Button size="small" variant="contained" color="success" onClick={() => handleStatus(order.id, "Ready")}>
                        Mark Ready
                      </Button>
                    )}
                    {order.status === "Ready" && (
                      <Button size="small" variant="outlined" color="secondary" onClick={() => handleStatus(order.id, "Delivered")}>
                        Mark Delivered
                      </Button>
                    )}
                    {order.status === "Delivered" && (
                      <Button size="small" variant="outlined" onClick={() => handleStatus(order.id, "Inserted")}>
                        Mark Inserted
                      </Button>
                    )}
                    <Button size="small" variant="text" onClick={() => handlePrintSlip(order)}>
                      Print
                    </Button>
                    {(order.status === "Ordered" || order.status === "In Progress") && (
                      <Button size="small" variant="text" color="error" onClick={() => handleDelete(order.id)}>
                        Delete
                      </Button>
                    )}
                  </Stack>
                </Grid>
              </Grid>
              {order.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, ml: 0.5 }}>
                  {order.description}
                </Typography>
              )}
              {order.lab_notes && (
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25, ml: 0.5, fontStyle: "italic" }}>
                  Notes: {order.lab_notes}
                </Typography>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
};

export default LabOrderRoutes;
