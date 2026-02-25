import React, { useState } from "react";
import {
  Box,
  TextField,
  MenuItem,
  InputAdornment,
  Stack,
} from "@mui/material";
import { CalendarToday } from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { DatePicker } from "@mui/x-date-pickers";

import { useAppDispatch, useAppSelector } from "@/redux/store";
import { setFromDateFilter, setToDateFilter } from "@/redux/Slice/DashboardSlice";
import { Dashboardtoday, dateFilterOptions } from "../constant";

import { Moment } from "moment";

const FilterDate: React.FC<{
  type:
  | "AccPayable"
  | "AccReceivable"
  | "Sales"
  | "Expenses"
  | "Profit&Loss";
}> = ({ type }) => {
  const dispatch = useAppDispatch();
  const value = useAppSelector(
    (state) => state.dashboard.dashboard.dateFilters[type]
  );

  const [mode, setMode] = useState<"preset" | "custom">("preset");

  const handlePresetChange = (e: any) => {
    const selected = dateFilterOptions.find(
      (o) => o.label === e.target.value
    );
    if(!selected){
      return;
    }
    if (selected?.value === "custom") {
      setMode("custom");
      return;
    }

    setMode("preset");
    dispatch(
      setFromDateFilter({
        type,
        value: selected?.value as Moment,
        customeDate:false
      })

    );
    dispatch(setToDateFilter({
      type,
      value: Dashboardtoday,
      customeDate:false
    }))
  };

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Box sx={{ display: "flex", gap: 1, minWidth: 260 }}>
        {/* Preset dropdown */}
        <TextField
          select
          size="small"
          defaultValue="Last Month"
          onChange={handlePresetChange}
          fullWidth
        >
          {dateFilterOptions.map((option) => (
            <MenuItem key={option.label} value={option.label}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        {/* Custom date picker */}
      {mode === "custom" && (
  <Stack direction="row" spacing={2}>
    {/* FROM DATE */}
    <DatePicker
      label="From"
      value={value.fromDate}
      maxDate={value.toDate as Moment}
      onChange={(date) => {
        if (!date) return;

        dispatch(setFromDateFilter({ type, value: date ,customeDate:true}));

        // 🔹 Auto-fix invalid range
        if (value.toDate && date.isAfter(value.toDate)) {
          dispatch(setToDateFilter({ type, value: null ,customeDate:true}));
        }
      }}
      slotProps={{
        textField: {
          size: "small",
          fullWidth:true,
          InputProps: {
            startAdornment: (
              <InputAdornment position="start">
                <CalendarToday fontSize="small" />
              </InputAdornment>
            ),
          },
        },
      }}
    />

    {/* TO DATE */}
    <DatePicker
      label="To"
      value={value.toDate}
      minDate={value.fromDate || undefined}
      maxDate={Dashboardtoday}
      onChange={(date) => {
        if (!date) return;
        dispatch(setToDateFilter({ type, value: date ,customeDate:true}));
      }}
      slotProps={{
        textField: {
          size: "small",
          fullWidth:true,
          InputProps: {
            startAdornment: (
              <InputAdornment position="start">
                <CalendarToday fontSize="small" />
              </InputAdornment>
            ),
          },
        },
      }}
    />
  </Stack>
)}

      </Box>
    </LocalizationProvider>
  );
};

export default FilterDate;
