import { Box, CircularProgress } from "@mui/material";
import { FC } from 'react';
import { useQuery } from "@tanstack/react-query";
import {allowedreports, IAccountsPayableDetail} from "@/types"
import AgingReport from "./AccountsPayableDetailCard";
import apiService from "@/service/apiService";
import FilterBar from "../FilterBar";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { withPermission } from "@/hooks/ProtectedRoute/authUtils";
import { useParams } from "react-router-dom";
import ErrorHandlerAlert from "@/components/common/ErrorHandlerAlert";


const AccountsPayableDetailReport:FC = () => {
      const {type="AccountsPayableDetail"}=useParams<{type:allowedreports}>()
    const filters = useSelector((state: RootState) => state.report);
    const { data: reportData, isLoading, refetch ,error} = useQuery<IAccountsPayableDetail, Error, IAccountsPayableDetail>({
        queryKey: [type, filters],
        queryFn: async () => {
            const response = await apiService.getReport({ fromDate:filters.fromDate, toDate: filters.toDate,type:type });
            return response 
        },
        enabled: false, // Disable automatic fetching
    });
    const handleApplyFilters = () => {
        refetch(); // Manually refetch data when filters are applied
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
            <Box sx={{ p: 3 }}>
                <ErrorHandlerAlert error={error}/>
                <FilterBar onApplyFilters={handleApplyFilters} />
                {reportData && <AgingReport reportData={reportData} />}
            </Box>
    );
};

export default withPermission("view",["accounting"])(AccountsPayableDetailReport);