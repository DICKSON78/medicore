import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Button, Card, CardContent, Divider, Grid, LinearProgress,
  Paper, Stack, Typography,
} from "@mui/material";
import { Header as PageHeader } from "../../../components/Page";
import Modal from "../../../components/Modal";
import Form from "../../../components/Form";
import TextField from "../../../components/TextField";
import Select from "../../../components/Select";
import ConfirmationDialog from "../../../components/ConfirmationDialog";
import ConsultationItemsCard from "../clinical-notes/ConsultationItemsCard";
import SelectItems from "../clinical-notes/SelectItems";
import DiagnosisCard from "../clinical-notes/DiagnosisCard";
import SelectDiagnoses from "../clinical-notes/SelectDiagnoses";
import PatientFilePDF from "../../patient-records/patient-file/PatientFilePDF";
import DentalOralExamination from "./DentalOralExamination";
import DentalChartingEditor from "./DentalChartingEditor";
import { useFetch, usePatch, useToast } from "../../../hooks";
import { formatDateForDb, formatError, getValidationError } from "../../../helpers";

const Subheader = ({ title, sx }) => (
  <Box sx={{
    backgroundColor: "#00796B", color: "white", py: 1.5, px: 3, my: 2,
    borderRadius: 1, textAlign: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", ...sx,
  }}>
    <Typography variant="h6" fontWeight="600" sx={{ fontSize: "1rem" }}>{title}</Typography>
  </Box>
);

const DentalClinicalNotes = ({ patient, consultation }) => {
  const addToast = useToast();
  const navigate = useNavigate();
  const modalRef = useRef();
  const formRef = useRef();

  const [saveLoading, setSaveLoading] = useState(false);
  const [completeLoading, setCompleteLoading] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    chief_complaint: "", history_present_illness: "", family_history: "",
    general_health: "", remarks: "", patient_to_return: "No", to_return_date: "",
    extra_oral_examination: "", tmj_examination: "", lymph_nodes: "",
    oral_hygiene_status: "", tobacco_use: "", alcohol_use: "",
  });
  const [diagnoses, setDiagnoses] = useState([]);
  const [consItems, setConsItems] = useState([]);
  const [oralExamData, setOralExamData] = useState(null);

  const [autoPatch, autoSaving] = usePatch();
  const [completePatch, completing] = usePatch();

  const autoSaveTimer = useRef(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState("");

  useEffect(() => {
    if (consultation) {
      const c = consultation;
      setFormData((prev) => ({
        ...prev,
        chief_complaint: c.chief_complaint || "",
        history_present_illness: c.history_present_illness || "",
        family_history: c.family_history || "",
        general_health: c.general_health || "",
        remarks: c.remarks || "",
        patient_to_return: c.patient_to_return || "No",
        to_return_date: c.to_return_date || "",
        extra_oral_examination: c.extra_oral_examination || "",
        tmj_examination: c.tmj_examination || "",
        lymph_nodes: c.lymph_nodes || "",
        oral_hygiene_status: c.oral_hygiene_status || "",
        tobacco_use: c.tobacco_use || "",
        alcohol_use: c.alcohol_use || "",
      }));
      setDiagnoses(c.diagnoses || []);
      setOralExamData(c.dental_oral_examination || null);
    }
  }, [consultation]);

  useEffect(() => {
    if (consultation?.id) {
      fetch(`/api/patient-payment-cache-items?consultation_id=${consultation.id}&per_page=100`)
        .then((r) => r.json())
        .then((d) => {
          if (d.data?.data) setConsItems(d.data.data);
        });
    }
  }, [consultation?.id]);

  const handleChange = (field) => (e) => {
    const value = e.target ? e.target.value : e;
    setFormData((prev) => ({ ...prev, [field]: value }));
    scheduleAutoSave({ ...formData, [field]: value });
  };

  const scheduleAutoSave = (data) => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      autoSave(data);
    }, 2000);
  };

  const autoSave = async (data) => {
    if (!consultation?.id) return;
    setAutoSaveStatus("Saving...");
    try {
      const payload = { what: "Consultation", ...data };
      await autoPatch(`/api/consultations/${consultation.id}/auto-save-clinical-notes`, payload);
      setAutoSaveStatus("Saved");
      setTimeout(() => setAutoSaveStatus(""), 3000);
    } catch {
      setAutoSaveStatus("Save failed");
    }
  };

  const handleCompleteClinicalNotes = async () => {
    if (!consultation?.id) return;
    setCompleteLoading(true);
    try {
      const payload = {
        chief_complaint: formData.chief_complaint,
        history_present_illness: formData.history_present_illness,
        family_history: formData.family_history,
        general_health: formData.general_health,
        extra_oral_examination: formData.extra_oral_examination,
        tmj_examination: formData.tmj_examination,
        lymph_nodes: formData.lymph_nodes,
        oral_hygiene_status: formData.oral_hygiene_status,
        tobacco_use: formData.tobacco_use,
        alcohol_use: formData.alcohol_use,
        remarks: formData.remarks,
        patient_to_return: formData.patient_to_return,
        to_return_date: formData.patient_to_return === "Yes" ? formData.to_return_date : null,
      };
      await completePatch(`/api/consultations/${consultation.id}`, {
        ...payload,
        status: "Consulted",
      });
      addToast("Clinical notes saved successfully", { variant: "success" });
      setCompleteDialogOpen(false);
      navigate(-1);
    } catch (e) {
      addToast(formatError(e), { variant: "error" });
    } finally {
      setCompleteLoading(false);
    }
  };

  if (!consultation) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary">Loading consultation...</Typography>
        <LinearProgress sx={{ mt: 2 }} />
      </Box>
    );
  }

  const isCompleted = consultation.status === "Consulted";

  return (
    <Paper sx={{ p: { xs: 2, md: 3 } }}>
      <PageHeader title="Dental Clinical Notes" />

      {autoSaveStatus && (
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "right", mb: 1 }}>
          {autoSaveStatus}
        </Typography>
      )}

      <Subheader title="Patient Information" />
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="body2" color="text.secondary">Patient Name</Typography>
          <Typography variant="body1" fontWeight={500}>
            {patient?.first_name} {patient?.middle_name} {patient?.last_name}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="body2" color="text.secondary">MRN / ID</Typography>
          <Typography variant="body1" fontWeight={500}>{patient?.hospital_id || patient?.id}</Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="body2" color="text.secondary">Gender / Age</Typography>
          <Typography variant="body1" fontWeight={500}>
            {patient?.gender} / {patient?.age || ""}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="body2" color="text.secondary">Phone</Typography>
          <Typography variant="body1" fontWeight={500}>{patient?.phone}</Typography>
        </Grid>
      </Grid>

      <Subheader title="Chief Complaint & History" />
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Chief Complaint"
            value={formData.chief_complaint}
            onChange={handleChange("chief_complaint")}
            multiline rows={2} fullWidth size="small"
            disabled={isCompleted}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="History of Present Illness"
            value={formData.history_present_illness}
            onChange={handleChange("history_present_illness")}
            multiline rows={3} fullWidth size="small"
            disabled={isCompleted}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Medical History / General Health"
            value={formData.general_health}
            onChange={handleChange("general_health")}
            multiline rows={3} fullWidth size="small"
            disabled={isCompleted}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Family History"
            value={formData.family_history}
            onChange={handleChange("family_history")}
            multiline rows={2} fullWidth size="small"
            disabled={isCompleted}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <Select
            label="Tobacco Use"
            value={formData.tobacco_use}
            options={[
              { label: "None", value: "None" },
              { label: "Current Smoker", value: "Current" },
              { label: "Former Smoker", value: "Former" },
              { label: "Smokeless Tobacco", value: "Smokeless" },
              { label: "Passive Smoker", value: "Passive" },
            ]}
            onChange={handleChange("tobacco_use")}
            fullWidth size="small" disabled={isCompleted}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <Select
            label="Alcohol Use"
            value={formData.alcohol_use}
            options={[
              { label: "None", value: "None" },
              { label: "Social", value: "Social" },
              { label: "Moderate", value: "Moderate" },
              { label: "Heavy", value: "Heavy" },
            ]}
            onChange={handleChange("alcohol_use")}
            fullWidth size="small" disabled={isCompleted}
          />
        </Grid>
      </Grid>

      <Subheader title="Extra-Oral Examination" />
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Extra-Oral Examination"
            value={formData.extra_oral_examination}
            onChange={handleChange("extra_oral_examination")}
            multiline rows={2} fullWidth size="small"
            disabled={isCompleted}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="TMJ Examination"
            value={formData.tmj_examination}
            onChange={handleChange("tmj_examination")}
            multiline rows={2} fullWidth size="small"
            disabled={isCompleted}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Lymph Nodes"
            value={formData.lymph_nodes}
            onChange={handleChange("lymph_nodes")}
            multiline rows={2} fullWidth size="small"
            disabled={isCompleted}
          />
        </Grid>
      </Grid>

      <Subheader title="Intra-Oral Examination" />
      <DentalOralExamination
        consultationId={consultation.id}
        data={oralExamData}
        onUpdate={() => {
          fetch(`/api/consultations/${consultation.id}`)
            .then((r) => r.json())
            .then((d) => { if (d.data?.dental_oral_examination) setOralExamData(d.data.dental_oral_examination); });
        }}
      />

      <Box sx={{ my: 2 }}>
        <Subheader title="Dental Charting (Odontogram)" />
        <DentalChartingEditor consultationId={consultation.id} readOnly={isCompleted} />
      </Box>

      <Subheader title="Oral Hygiene Status" />
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Select
            label="Oral Hygiene Status"
            value={formData.oral_hygiene_status}
            options={[
              { label: "Good", value: "Good" },
              { label: "Fair", value: "Fair" },
              { label: "Poor", value: "Poor" },
              { label: "Very Poor", value: "VeryPoor" },
            ]}
            onChange={handleChange("oral_hygiene_status")}
            fullWidth size="small" disabled={isCompleted}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Select
            label="Patient to Return"
            value={formData.patient_to_return}
            options={[
              { label: "No", value: "No" },
              { label: "Yes", value: "Yes" },
            ]}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, patient_to_return: e.target.value }));
              scheduleAutoSave({ ...formData, patient_to_return: e.target.value });
            }}
            fullWidth size="small" disabled={isCompleted}
          />
        </Grid>
        {formData.patient_to_return === "Yes" && (
          <Grid item xs={12} sm={4}>
            <TextField
              label="Return Date"
              value={formData.to_return_date}
              onChange={handleChange("to_return_date")}
              type="date" fullWidth size="small" disabled={isCompleted}
            />
          </Grid>
        )}
      </Grid>

      <Box sx={{ my: 2 }}>
        <Subheader title="Diagnoses & Items" />
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <DiagnosisCard
              consultationId={consultation.id}
              diagnoses={diagnoses}
              diagnosisType="Principal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <DiagnosisCard
              consultationId={consultation.id}
              diagnoses={diagnoses}
              diagnosisType="Additional"
            />
          </Grid>
        </Grid>
        <Box sx={{ mt: 1 }}>
          <SelectDiagnoses consultationId={consultation.id} />
        </Box>
      </Box>

      <Box sx={{ my: 2 }}>
        <Subheader title="Treatment / Prescription Items" />
        <ConsultationItemsCard items={consItems} consultationId={consultation.id} />
        <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
          <SelectItems
            consultationId={consultation.id}
            onRefresh={() => {
              fetch(`/api/patient-payment-cache-items?consultation_id=${consultation.id}&per_page=100`)
                .then((r) => r.json())
                .then((d) => { if (d.data?.data) setConsItems(d.data.data); });
            }}
          />
        </Box>
      </Box>

      <Subheader title="Remarks" />
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Remarks"
            value={formData.remarks}
            onChange={handleChange("remarks")}
            multiline rows={2} fullWidth size="small"
            disabled={isCompleted}
          />
        </Grid>
      </Grid>

      <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: "flex-end" }}>
        <Button variant="outlined" onClick={() => navigate(-1)}>Back</Button>
        {!isCompleted && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => setCompleteDialogOpen(true)}
            disabled={completeLoading}
          >
            {completeLoading ? "Saving..." : "Complete Clinical Notes"}
          </Button>
        )}
        <PatientFilePDF
          patient={patient}
          consultation={consultation}
          diagnoses={diagnoses}
          items={consItems}
        />
      </Stack>

      <ConfirmationDialog
        open={completeDialogOpen}
        onClose={() => setCompleteDialogOpen(false)}
        onConfirm={handleCompleteClinicalNotes}
        title="Complete Clinical Notes"
        message="Are you sure you want to complete these clinical notes? The consultation will be marked as 'Consulted'."
        confirmLabel="Complete"
        loading={completeLoading}
      />
    </Paper>
  );
};

export default DentalClinicalNotes;
