import { Box, CircularProgress, } from "@mui/material";

import { useQuery } from "@tanstack/react-query";
import {ReportData} from "@/types"
import ProfitAndLossCard from "./ProfitAndLossCard";
import apiService from "@/service/apiService";
import FilterBar from "../FilterBar";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { withPermission } from "@/hooks/ProtectedRoute/authUtils";
import ErrorHandlerAlert from "@/components/common/ErrorHandlerAlert";

const ProfitAndLoss = () => {
    const filters = useSelector((state: RootState) => state.report);

    const { data: reportData, isLoading, refetch,error } = useQuery<ReportData, Error, ReportData>({
        queryKey: ['profit-and-loss', filters],
        queryFn: async () => {
            const response = await apiService.getReport({ fromDate: filters.fromDate, toDate: filters.toDate,type:"profit-and-loss" });
            return response.data 
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
                {/* <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h4">Profit and Loss</Typography>
                    <Box>
                        <Button>Save As</Button>
                    </Box>
                </Box> */}
                <ErrorHandlerAlert error={error}/>
                <FilterBar onApplyFilters={handleApplyFilters} />
                {reportData && <ProfitAndLossCard reportData={reportData} />}
            </Box>
    );
};

export default withPermission("view",["accounting"])(ProfitAndLoss);