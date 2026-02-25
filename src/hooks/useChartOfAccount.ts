import { useQuery } from '@tanstack/react-query';
import apiService from '@/service/apiService';
import { IChartAccount } from '@/types';
import { useMemo } from 'react';
export const useChartOfAccount = ({
  type,
  removeMasters,
  regularExpression,
  nor = []
}: {
  type: ('asset' | 'liability' | 'equity' | 'income' | 'expense')[] | 'asset' | 'liability' | 'equity' | 'income' | 'expense';
  removeMasters?: string[];
  regularExpression?: "TAX" | "DISCOUNT";
  nor: string[];
}) => {
  const typeParam = Array.isArray(type) ? type.join(",") : type;
  const { data: chartAccounts = [], isLoading: isLoadingChartAccounts } = useQuery<IChartAccount[]>({
    queryKey: ['chartAccounts',typeParam,removeMasters],
    queryFn: async () => {
     try {
      const response = await apiService.getChartAccounts({ 
        isChartData:"0",nor:nor?.join(","),
        type:typeParam,regularExpression,removeMasters:removeMasters?.join(",")});
      return response.data || []
     } catch (error) {
      return []
     }
    },
    
  });
    const chartAccountOptions = useMemo(
      () => chartAccounts.map((opt) => ({ value: opt._id!, label:opt.name })),
      [chartAccounts]
    )
  return { chartAccounts, isLoadingChartAccounts,chartAccountOptions };
};
