import React, { useCallback } from "react";
import { Box, Grid, Typography } from "@mui/material";
import TextField from "../../../components/TextField";
import Select from "../../../components/Select";
import { usePatch } from "../../../hooks";
import { ORAL_EXAMINATION_FINDINGS } from "../../../constants";

const fields = [
  { key: "lips", label: "Lips", options: ORAL_EXAMINATION_FINDINGS.lips },
  { key: "buccal_mucosa", label: "Buccal Mucosa", options: ORAL_EXAMINATION_FINDINGS.buccalMucosa },
  { key: "tongue", label: "Tongue", options: ORAL_EXAMINATION_FINDINGS.tongue },
  { key: "floor_of_mouth", label: "Floor of Mouth", options: ORAL_EXAMINATION_FINDINGS.floorOfMouth },
  { key: "hard_palate", label: "Hard Palate", options: ORAL_EXAMINATION_FINDINGS.palate },
  { key: "soft_palate", label: "Soft Palate", options: ORAL_EXAMINATION_FINDINGS.palate },
  { key: "oropharynx", label: "Oropharynx", options: ORAL_EXAMINATION_FINDINGS.oropharynx },
  { key: "gingiva", label: "Gingiva", options: ORAL_EXAMINATION_FINDINGS.gingiva },
  { key: "salivary_glands", label: "Salivary Glands", options: ORAL_EXAMINATION_FINDINGS.salivaryGlands },
];

const DentalOralExamination = ({ consultationId, data, onUpdate }) => {
  const [patch, loading] = usePatch();

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
        {fields.map(({ key, label, options }) => (
          <Grid item xs={12} sm={6} md={4} key={key}>
            <Select
              label={label}
              value={data?.[key] || ""}
              options={options}
              onChange={(e) => handleChange(key, e.target.value)}
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
