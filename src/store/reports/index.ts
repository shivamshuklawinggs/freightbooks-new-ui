import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import moment from 'moment';

interface ReportState {
  reportPeriod: string;
  fromDate: Date;
  toDate: Date;
}

const initialState: ReportState = {
  reportPeriod: 'this_year_to_date',
  fromDate: moment().subtract(1, 'year').toDate(),
  toDate: moment().toDate(),
};

const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    setReportPeriod: (state, action: PayloadAction<string>) => {
      state.reportPeriod = action.payload;

      if (action.payload === 'this_year_to_date') {
        state.fromDate = moment().startOf('year').toDate();
        state.toDate = moment().toDate();
      }
    },
    setFromDate: (state, action: PayloadAction<Date>) => {
      state.fromDate = action.payload;
    },
    setToDate: (state, action: PayloadAction<Date>) => {
      state.toDate = action.payload;
    },
  
    setFilters: (state, action: PayloadAction<Partial<ReportState>>) => {
      return { ...state, ...action.payload };
    },
  },
});

export const {
  setReportPeriod,
  setFromDate,
  setToDate,
  setFilters,
} = reportSlice.actions;

export default reportSlice.reducer;
