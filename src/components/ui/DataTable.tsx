import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  Divider,
  alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export interface ColumnDef {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  width?: number | string;
  minWidth?: number | string;
}

interface DataTableProps<T> {
  columns: ColumnDef[];
  data: T[];
  isLoading?: boolean;
  renderRow: (item: T, index: number) => React.ReactNode;
  total?: number;
  page?: number;
  rowsPerPage?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rows: number) => void;
  rowsPerPageOptions?: number[];
  emptyMessage?: string;
  size?: 'small' | 'medium';
  stickyHeader?: boolean;
  extraRow?: React.ReactNode;
}

const DataTable = <T,>({
  columns,
  data,
  isLoading,
  renderRow,
  total,
  page = 0,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [10, 25, 50],
  emptyMessage = 'No records found',
  size = 'small',
  stickyHeader = false,
  extraRow,
}: DataTableProps<T>) => {
  const theme = useTheme();
  const showPagination = total !== undefined && onPageChange && onRowsPerPageChange;

  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <TableContainer>
        <Table size={size} stickyHeader={stickyHeader}>
          <TableHead>
            <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.06) }}>
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  align={col.align ?? 'left'}
                  sx={{
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    py: 1.5,
                    width: col.width,
                    minWidth: col.minWidth,
                    bgcolor: alpha(theme.palette.primary.main, 0.06),
                  }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                  <LoadingSpinner size={36} />
                </TableCell>
              </TableRow>
            ) : data.length > 0 ? (
              <>
                {data.map((item, index) => renderRow(item, index))}
                {extraRow}
              </>
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 5 }}>
                  <Typography variant="body2" color="text.secondary">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {showPagination && (
        <>
          <Divider />
          <TablePagination
            component="div"
            count={total}
            page={page}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={rowsPerPageOptions}
            onPageChange={(_, newPage) => onPageChange(newPage)}
            onRowsPerPageChange={(e) => onRowsPerPageChange(Number(e.target.value))}
            sx={{ '& .MuiTablePagination-toolbar': { minHeight: 48 } }}
          />
        </>
      )}
    </Paper>
  );
};

export default DataTable;
