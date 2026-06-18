import React, { useCallback, useEffect, useState } from "react";
import {
  Box, Button, Card, CardContent, Chip, Dialog, DialogActions,
  DialogContent, DialogTitle, FormControlLabel, Grid, IconButton,
  Radio, RadioGroup, Switch, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Tooltip, Typography, Paper,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useFetch, usePatch, useToast } from "../../../hooks";
import TextField from "../../../components/TextField";
import Select from "../../../components/Select";
import { DENTAL_TREATMENT_OPTIONS, DENTAL_CHART_OPTIONS } from "../../../constants";

const upperQuadrant = [
  { num: 8, label: "8", name: "Central Incisor" },
  { num: 7, label: "7", name: "Lateral Incisor" },
  { num: 6, label: "6", name: "Canine" },
  { num: 5, label: "5", name: "1st Premolar" },
  { num: 4, label: "4", name: "2nd Premolar" },
  { num: 3, label: "3", name: "1st Molar" },
  { num: 2, label: "2", name: "2nd Molar" },
  { num: 1, label: "1", name: "3rd Molar" },
];

const lowerQuadrant = [
  { num: 32, label: "32", name: "3rd Molar" },
  { num: 31, label: "31", name: "2nd Molar" },
  { num: 30, label: "30", name: "1st Molar" },
  { num: 29, label: "29", name: "2nd Premolar" },
  { num: 28, label: "28", name: "1st Premolar" },
  { num: 27, label: "27", name: "Canine" },
  { num: 26, label: "26", name: "Lateral Incisor" },
  { num: 25, label: "25", name: "Central Incisor" },
];

const ToothBox = styled(Box, { shouldForwardProp: (prop) => prop !== "selected" && prop !== "status" })(
  ({ theme, selected, status }) => ({
    width: 52,
    height: 52,
    border: "2px solid",
    borderColor: selected ? theme.palette.primary.main : theme.palette.divider,
    borderRadius: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "0.85rem",
    transition: "all 0.2s",
    backgroundColor: status === "Missing" ? "#f5f5f5"
      : status === "Decayed" ? "#ffcdd2"
      : status === "Filled" ? "#B2DFDB"
      : status === "RootStump" ? "#d7ccc8"
      : status === "FilledDecay" ? "#ce93d8"
      : selected ? theme.palette.primary.light
      : theme.palette.background.paper,
    color: status === "Missing" ? theme.palette.text.disabled
      : selected ? theme.palette.primary.contrastText
      : theme.palette.text.primary,
    "&:hover": { borderColor: theme.palette.primary.main, boxShadow: 1 },
  }),
);

const statusColors = {
  Sound: { bg: "#e8f5e9", color: "#2e7d32", label: "H" },
  Decayed: { bg: "#ffcdd2", color: "#c62828", label: "D" },
  Filled: { bg: "#B2DFDB", color: "#004D40", label: "F" },
  FilledDecay: { bg: "#ce93d8", color: "#6a1b9a", label: "R" },
  Missing: { bg: "#f5f5f5", color: "#9e9e9e", label: "M" },
  Sealant: { bg: "#c8e6c9", color: "#2e7d32", label: "S" },
};

const DentalChartingEditor = ({ consultationId, readOnly }) => {
  const addToast = useToast();
  const [chartData, setChartData] = useState([]);
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [toothDialogOpen, setToothDialogOpen] = useState(false);
  const [toothForm, setToothForm] = useState({});
  const { data: fetchData, loading } = useFetch(
    `/api/dental-charting/consultation/${consultationId}`,
    { loadOnMount: true, loadOnReload: true },
  );
  const [patch, saving] = usePatch();

  useEffect(() => {
    if (fetchData?.data) {
      setChartData(fetchData.data);
    }
  }, [fetchData]);

  const getToothStatus = useCallback((toothNum) => {
    return chartData.find((t) => t.tooth_number === toothNum);
  }, [chartData]);

  const handleToothClick = (toothNum) => {
    if (readOnly) return;
    const existing = getToothStatus(toothNum);
    setToothForm(existing ? {
      tooth_number: existing.tooth_number,
      status: existing.status,
      caries_status: existing.caries_status,
      restoration_type: existing.restoration_type,
      surface_involved: existing.surface_involved,
      mobility: existing.mobility,
      periodontal_pocket_depth: existing.periodontal_pocket_depth,
      bleeding_on_probing: existing.bleeding_on_probing || false,
      furcation_involvement: existing.furcation_involvement,
      notes: existing.notes || "",
    } : {
      tooth_number: toothNum,
      status: "Present",
      caries_status: "Sound",
      restoration_type: "",
      surface_involved: "",
      mobility: "",
      periodontal_pocket_depth: "",
      bleeding_on_probing: false,
      furcation_involvement: "",
      notes: "",
    });
    setSelectedTooth(toothNum);
    setToothDialogOpen(true);
  };

  const handleSaveTooth = async () => {
    try {
      const existing = getToothStatus(toothForm.tooth_number);
      if (existing) {
        await patch(`/api/dental-charting/${existing.id}`, toothForm);
      } else {
        await patch("/api/dental-charting", {
          consultation_id: consultationId,
          ...toothForm,
        });
      }
      const res = await fetch(`/api/dental-charting/consultation/${consultationId}`);
      const json = await res.json();
      if (json.data) setChartData(json.data);
      setToothDialogOpen(false);
      addToast("Tooth charting saved", { variant: "success" });
    } catch (e) {
      addToast("Failed to save tooth charting", { variant: "error" });
    }
  };

  const handleBulkSave = async () => {
    try {
      const teeth = chartData.map((t) => ({
        tooth_number: t.tooth_number,
        tooth_quadrant: t.tooth_quadrant,
        status: t.status,
        caries_status: t.caries_status,
        restoration_type: t.restoration_type,
        surface_involved: t.surface_involved,
        mobility: t.mobility,
        periodontal_pocket_depth: t.periodontal_pocket_depth,
        bleeding_on_probing: t.bleeding_on_probing,
        furcation_involvement: t.furcation_involvement,
        notes: t.notes,
      }));
      await patch("/api/dental-charting/bulk", {
        consultation_id: consultationId,
        teeth,
      });
      addToast("Charting saved successfully", { variant: "success" });
    } catch (e) {
      addToast("Failed to save charting", { variant: "error" });
    }
  };

  const renderArch = (isUpper) => {
    const quad = isUpper ? [...upperQuadrant].reverse() : lowerQuadrant;
    const rightQuad = isUpper ? upperQuadrant : [...lowerQuadrant].reverse();
    return (
      <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5, mb: 1 }}>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          {rightQuad.map((tooth) => {
            const data = getToothStatus(isUpper ? tooth.num + 8 : tooth.num);
            const cs = data?.caries_status || "Sound";
            const colors = statusColors[cs] || statusColors.Sound;
            return (
              <Tooltip
                key={tooth.num}
                title={`Tooth ${tooth.num} (${tooth.name}): ${cs}${data?.status === "Missing" ? " - MISSING" : ""}`}
              >
                <ToothBox
                  selected={selectedTooth === tooth.num}
                  status={data?.status}
                  onClick={() => handleToothClick(isUpper ? tooth.num + 8 : tooth.num)}
                  sx={{
                    bgcolor: data?.status === "Missing" ? "#f5f5f5"
                      : data?.caries_status === "Decayed" ? "#ffcdd2"
                      : data?.caries_status === "Filled" ? "#B2DFDB"
                      : data?.caries_status === "FilledDecay" ? "#ce93d8"
                      : "#e8f5e9",
                  }}
                >
                  {isUpper ? tooth.num + 8 : tooth.num}
                </ToothBox>
              </Tooltip>
            );
          })}
        </Box>
      </Box>
    );
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: "primary.main" }}>
            Dental Chart (Odontogram)
          </Typography>
          {!readOnly && chartData.length > 0 && (
            <Button variant="contained" size="small" onClick={handleBulkSave} disabled={saving}>
              Save Charting
            </Button>
          )}
        </Box>

        <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mb: 1, flexWrap: "wrap" }}>
          {Object.entries(statusColors).map(([key, val]) => (
            <Chip
              key={key}
              label={key}
              size="small"
              sx={{ bgcolor: val.bg, color: val.color, fontWeight: 600, fontSize: "0.7rem" }}
            />
          ))}
        </Box>

        <Box sx={{ textAlign: "center", mb: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            UPPER ARCH (Maxillary)
          </Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Box>
            <Box sx={{ display: "flex", gap: 0.5, mb: 0.5 }}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => {
                const data = getToothStatus(n);
                return (
                  <Tooltip key={n} title={`Tooth ${n}`}>
                    <ToothBox
                      selected={selectedTooth === n}
                      status={data?.status}
                      onClick={() => handleToothClick(n)}
                    >
                      {n}
                    </ToothBox>
                  </Tooltip>
                );
              })}
            </Box>
            <Box sx={{ display: "flex", gap: 0.5, mb: 0.5 }}>
              {[16, 15, 14, 13, 12, 11, 10, 9].map((n) => {
                const data = getToothStatus(n);
                return (
                  <Tooltip key={n} title={`Tooth ${n}`}>
                    <ToothBox
                      selected={selectedTooth === n}
                      status={data?.status}
                      onClick={() => handleToothClick(n)}
                    >
                      {n}
                    </ToothBox>
                  </Tooltip>
                );
              })}
            </Box>
          </Box>
        </Box>

        <Box sx={{ textAlign: "center", mt: 2, mb: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            LOWER ARCH (Mandibular)
          </Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Box>
            <Box sx={{ display: "flex", gap: 0.5, mb: 0.5 }}>
              {[17, 18, 19, 20, 21, 22, 23, 24].map((n) => {
                const data = getToothStatus(n);
                return (
                  <Tooltip key={n} title={`Tooth ${n}`}>
                    <ToothBox
                      selected={selectedTooth === n}
                      status={data?.status}
                      onClick={() => handleToothClick(n)}
                    >
                      {n}
                    </ToothBox>
                  </Tooltip>
                );
              })}
            </Box>
            <Box sx={{ display: "flex", gap: 0.5, mb: 0.5 }}>
              {[32, 31, 30, 29, 28, 27, 26, 25].map((n) => {
                const data = getToothStatus(n);
                return (
                  <Tooltip key={n} title={`Tooth ${n}`}>
                    <ToothBox
                      selected={selectedTooth === n}
                      status={data?.status}
                      onClick={() => handleToothClick(n)}
                    >
                      {n}
                    </ToothBox>
                  </Tooltip>
                );
              })}
            </Box>
          </Box>
        </Box>

        <Dialog open={toothDialogOpen} onClose={() => setToothDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Tooth #{toothForm.tooth_number} - {DENTAL_TREATMENT_OPTIONS.toothNumbers.find((t) => Number(t.value) === toothForm.tooth_number)?.label?.split(" - ")[1] || ""}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={6}>
                <Select
                  label="Tooth Status"
                  value={toothForm.status || ""}
                  options={DENTAL_CHART_OPTIONS.toothStatus}
                  onChange={(e) => setToothForm({ ...toothForm, status: e.target.value })}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={6}>
                <Select
                  label="Caries Status"
                  value={toothForm.caries_status || ""}
                  options={DENTAL_CHART_OPTIONS.cariesStatus}
                  onChange={(e) => setToothForm({ ...toothForm, caries_status: e.target.value })}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={6}>
                <Select
                  label="Restoration Type"
                  value={toothForm.restoration_type || ""}
                  options={DENTAL_TREATMENT_OPTIONS.treatmentTypes}
                  onChange={(e) => setToothForm({ ...toothForm, restoration_type: e.target.value })}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={6}>
                <Select
                  label="Surface(s) Involved"
                  value={toothForm.surface_involved || ""}
                  options={DENTAL_TREATMENT_OPTIONS.toothSurfaces}
                  onChange={(e) => setToothForm({ ...toothForm, surface_involved: e.target.value })}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={4}>
                <Select
                  label="Mobility"
                  value={toothForm.mobility || ""}
                  options={DENTAL_CHART_OPTIONS.mobility}
                  onChange={(e) => setToothForm({ ...toothForm, mobility: e.target.value })}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Pocket Depth (mm)"
                  value={toothForm.periodontal_pocket_depth || ""}
                  onChange={(e) => setToothForm({ ...toothForm, periodontal_pocket_depth: e.target.value })}
                  fullWidth
                  size="small"
                  type="number"
                />
              </Grid>
              <Grid item xs={4}>
                <Select
                  label="Furcation"
                  value={toothForm.furcation_involvement || ""}
                  options={DENTAL_CHART_OPTIONS.furcationInvolvement}
                  onChange={(e) => setToothForm({ ...toothForm, furcation_involvement: e.target.value })}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={toothForm.bleeding_on_probing || false}
                      onChange={(e) => setToothForm({ ...toothForm, bleeding_on_probing: e.target.checked })}
                    />
                  }
                  label="Bleeding on Probing"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Notes"
                  value={toothForm.notes || ""}
                  onChange={(e) => setToothForm({ ...toothForm, notes: e.target.value })}
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setToothDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSaveTooth} disabled={saving}>
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default DentalChartingEditor;
