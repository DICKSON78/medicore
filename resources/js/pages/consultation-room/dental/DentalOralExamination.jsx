import React, { useCallback } from "react";
import { Box, Grid, Typography } from "@mui/material";
import TextField from "../../../components/TextField";
import Select from "../../../components/Select";
import { usePatch, useDentalOptions } from "../../../hooks";

const fields = [
  { key: "lips", label: "Lips", category: "lips" },
  { key: "buccal_mucosa", label: "Buccal Mucosa", category: "buccalMucosa" },
  { key: "tongue", label: "Tongue", category: "tongue" },
  { key: "floor_of_mouth", label: "Floor of Mouth", category: "floorOfMouth" },
  { key: "hard_palate", label: "Hard Palate", category: "palate" },
  { key: "soft_palate", label: "Soft Palate", category: "palate" },
  { key: "oropharynx", label: "Oropharynx", category: "oropharynx" },
  { key: "gingiva", label: "Gingiva", category: "gingiva" },
  { key: "salivary_glands", label: "Salivary Glands", category: "salivaryGlands" },
];

const DentalOralExamination = ({ consultationId, data, onUpdate }) => {
  const { handlePatch: patch } = usePatch();
  const { options } = useDentalOptions();

  const handleChange = useCallback((field, value) => {
    const payload = { what: "Dental Oral Examination", [field]: value };

    patch(`/api/consultations/${consultationId}/auto-save-clinical-notes`, payload)
      .then(() => {
        if (onUpdate) onUpdate();
      });
  }, [consultationId, patch, onUpdate]);

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: "primary.main" }}>
        Intra-Oral Soft Tissue Examination
      </Typography>
      <Grid container spacing={2}>
        {fields.map(({ key, label, category }) => (
          <Grid item xs={12} sm={6} md={4} key={key}>
            <Select
              label={label}
              value={data?.[key] || ""}
              options={options[category] || []}
              onChange={(v) => handleChange(key, v)}
              size="small"
              fullWidth
            />
          </Grid>
        ))}
        <Grid item xs={12}>
          <TextField
            label="Other Findings"
            value={data?.other_findings || ""}
            onChange={(e) => handleChange("other_findings", e.target.value)}
            multiline
            rows={2}
            size="small"
            fullWidth
          />
        </Grid>
        {data?.occlusion && (
          <Grid item xs={12} sm={6}>
            <TextField
              label="Occlusion"
              value={data.occlusion || ""}
              onChange={(e) => handleChange("occlusion", e.target.value)}
              size="small"
              fullWidth
            />
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default DentalOralExamination;
