import React, { useState } from "react";
import {
  Box, Button, Card, CardContent, Grid, LinearProgress, Paper, Typography,
} from "@mui/material";
import { Header as PageHeader } from "../../../../components/Page";
import TextField from "../../../../components/TextField";
import Select from "../../../../components/Select";
import { useFetch, usePatch, useToast } from "../../../../hooks";
import { DENTAL_TREATMENT_OPTIONS } from "../../../../constants";

const DentalTreatmentTemplate = ({ patient, paymentCacheitem }) => {
  const addToast = useToast();
  const [patch, saving] = usePatch();

  const [form, setForm] = useState({
    treatment_type: "",
    tooth_number: "",
    tooth_surface: "",
    anaesthesia_type: "",
    preoperative_notes: "",
    intraoperative_notes: "",
    postoperative_notes: "",
    prescription: "",
    material_used: "",
    treated_by: "",
    treatment_date: "",
  });

  const handleSubmit = async () => {
    try {
      await patch("/api/dental-treatment-records", {
        payment_cache_item_id: paymentCacheitem.id,
        ...form,
      });
      addToast("Treatment record saved", { variant: "success" });
    } catch (e) {
      addToast("Failed to save", { variant: "error" });
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <PageHeader title="Dental Treatment Record" />

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom fontWeight={600}>
            Patient: {patient?.first_name} {patient?.last_name} | Item: {paymentCacheitem?.item?.name}
          </Typography>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <Select
            label="Treatment Type"
            value={form.treatment_type}
            options={DENTAL_TREATMENT_OPTIONS.treatmentTypes}
            onChange={(e) => setForm({ ...form, treatment_type: e.target.value })}
            fullWidth size="small"
          />
        </Grid>
        <Grid item xs={6} sm={2}>
          <Select
            label="Tooth Number"
            value={form.tooth_number}
            options={DENTAL_TREATMENT_OPTIONS.toothNumbers}
            onChange={(e) => setForm({ ...form, tooth_number: e.target.value })}
            fullWidth size="small"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <Select
            label="Tooth Surface"
            value={form.tooth_surface}
            options={DENTAL_TREATMENT_OPTIONS.toothSurfaces}
            onChange={(e) => setForm({ ...form, tooth_surface: e.target.value })}
            fullWidth size="small"
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <Select
            label="Anaesthesia"
            value={form.anaesthesia_type}
            options={DENTAL_TREATMENT_OPTIONS.anaesthesiaTypes}
            onChange={(e) => setForm({ ...form, anaesthesia_type: e.target.value })}
            fullWidth size="small"
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Pre-operative Notes"
            value={form.preoperative_notes}
            onChange={(e) => setForm({ ...form, preoperative_notes: e.target.value })}
            multiline rows={3} fullWidth size="small"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Intra-operative Notes"
            value={form.intraoperative_notes}
            onChange={(e) => setForm({ ...form, intraoperative_notes: e.target.value })}
            multiline rows={3} fullWidth size="small"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Post-operative Notes"
            value={form.postoperative_notes}
            onChange={(e) => setForm({ ...form, postoperative_notes: e.target.value })}
            multiline rows={3} fullWidth size="small"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Material Used"
            value={form.material_used}
            onChange={(e) => setForm({ ...form, material_used: e.target.value })}
            fullWidth size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Prescription"
            value={form.prescription}
            onChange={(e) => setForm({ ...form, prescription: e.target.value })}
            multiline rows={3} fullWidth size="small"
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            label="Treatment Date"
            value={form.treatment_date}
            onChange={(e) => setForm({ ...form, treatment_date: e.target.value })}
            type="date" fullWidth size="small"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Treated By (Doctor ID)"
            value={form.treated_by}
            onChange={(e) => setForm({ ...form, treated_by: e.target.value })}
            fullWidth size="small"
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
            <Button variant="contained" onClick={handleSubmit} disabled={saving}>
              {saving ? "Saving..." : "Save Treatment Record"}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default DentalTreatmentTemplate;
