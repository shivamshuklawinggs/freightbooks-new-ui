import React, { useState } from "react";
import {
  Typography,
  CircularProgress,
  Box,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import apiService from "@/service/apiService";
import { IExpenseDispatcher, IFile } from "@/types";

import UploadFile from "./UploadFile";
import { TIME_FORMAT } from "@/config/constant";
import CheckDateTimeDialog from "@/components/common/CommonDatePicker/CheckDateTimeDialog";
import moment from "moment";

interface ICheckInProps {
  expense: IExpenseDispatcher;
  fetchExpenses: () => void;
  loadid: string;
}

const CheckIn: React.FC<ICheckInProps> = ({ expense, fetchExpenses, loadid }) => {
  const queryClient = useQueryClient();

  const [openCheckIn, setOpenCheckIn] = useState(false);
  const [openCheckOut, setOpenCheckOut] = useState(false);
  const [checkInDate, setCheckInDate] = useState<Date | null>(
    expense.location?.checkin ? new Date(expense.location.checkin) : null
  );
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(
    expense.location?.checkout ? new Date(expense.location.checkout) : null
  );
  const [selectedFiles, setSelectedFiles] = useState<File[] | null>(null);
  const [deletedFiles, setDeletedFiles] = useState<IFile[]>([]);

  const checkInMutation = useMutation({
    mutationFn: (formData: FormData) =>
      apiService.checkInLocation(loadid, "checkin", formData),
    onSuccess: () => {
      fetchExpenses();
      queryClient.invalidateQueries({ queryKey: ["dispatcher"] });
      setOpenCheckIn(false);
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: (formData: FormData) =>
      apiService.checkInLocation(loadid, "checkout", formData),
    onSuccess: () => {
      fetchExpenses();
      queryClient.invalidateQueries({ queryKey: ["dispatcher"] });
      setOpenCheckOut(false);
    },
  });

  const handleCheckInSave = () => {
    if (!loadid || !checkInDate) return;
    const formData = new FormData();
    formData.append("checkin", checkInDate.toISOString());
    formData.append("_id", expense.location._id as string);
    checkInMutation.mutate(formData);
  };

  const handleCheckOutSave = () => {
    if (!loadid || !checkOutDate) return;
    const formData = new FormData();

    if (selectedFiles?.length) {
      selectedFiles.forEach((file) => formData.append("file", file));
    }

    if (deletedFiles?.length) {
      formData.append(
        "deletedfiles",
        JSON.stringify(deletedFiles.map((f) => f.filename))
      );
    }

    formData.append("checkout", checkOutDate.toISOString());
    formData.append("_id", expense.location._id as string);
    checkOutMutation.mutate(formData);
  };

  const handleFileChange = (files: File[] | null, deleted?: IFile[]) => {
    setSelectedFiles(files);
    if (deleted) setDeletedFiles(deleted);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* ✅ Check In Section */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 500, width: 70 }}>
            Check In
          </Typography>
          <Box
            onClick={() =>
              !expense.location?.checkout && setOpenCheckIn(true)
            }
            sx={{
              display: "flex",
              alignItems: "center",
              border: "1px solid #ccc",
              borderRadius: 1,
              p: "4px 8px",
              width: 180,
              height: 32,
              cursor: expense.location?.checkout ? "not-allowed" : "pointer",
              opacity: expense.location?.checkout ? 0.7 : 1,
            }}
          >
            <Typography variant="body2" sx={{ flexGrow: 1 }}>
              {checkInDate
                ?moment(checkInDate).format(`${TIME_FORMAT} HH:mm`)
                : "Select date & time"}
            </Typography>
            {checkInMutation.isPending ? (
              <CircularProgress size={20} />
            ) : (
              <CalendarMonthIcon fontSize="small" />
            )}
          </Box>
        </Box>

        {/* ✅ Check Out Section */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 500, width: 70 }}>
            Check Out
          </Typography>
          <Box
            onClick={() =>
              expense.location?.checkin && setOpenCheckOut(true)
            }
            sx={{
              display: "flex",
              alignItems: "center",
              border: "1px solid #ccc",
              borderRadius: 1,
              p: "4px 8px",
              width: 180,
              height: 32,
              cursor: !expense.location?.checkin ? "not-allowed" : "pointer",
              opacity: !expense.location?.checkin ? 0.7 : 1,
            }}
          >
            <Typography variant="body2" sx={{ flexGrow: 1 }}>
              {checkOutDate
                ? moment(checkOutDate).format(`${TIME_FORMAT} HH:mm`)
                : "Select date & time"}
            </Typography>
            {checkOutMutation.isPending ? (
              <CircularProgress size={20} />
            ) : (
              <CalendarMonthIcon fontSize="small" />
            )}
          </Box>
        </Box>

        {/* ✅ Reusable Dialogs */}
        <CheckDateTimeDialog
          open={openCheckIn}
          title="Select Check In Date & Time"
          label="Check In Date & Time"
          value={checkInDate}
          onChange={setCheckInDate}
          onClose={() => setOpenCheckIn(false)}
          onSave={handleCheckInSave}
          isLoading={checkInMutation.isPending}
          // disabledSave={!checkInDate}
        />

        <CheckDateTimeDialog
          open={openCheckOut}
          title="Select Check Out Date & Time"
          label="Check Out Date & Time"
          value={checkOutDate}
          onChange={setCheckOutDate}
          onClose={() => setOpenCheckOut(false)}
          onSave={handleCheckOutSave}
          isLoading={checkOutMutation.isPending}
          // disabledSave={!checkOutDate }
          UploadComponent={
            <UploadFile
              location={expense.location}
              onFileChange={handleFileChange}
            />
          }
        />
      </Box>
    </LocalizationProvider>
  );
};

export default CheckIn;
