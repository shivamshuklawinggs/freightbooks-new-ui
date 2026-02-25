import React from "react";
import {  TableContainer, Paper, Table, TableHead, TableRow, TableCell, Button, Typography } from "@mui/material";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export interface IPaginatedTableProps<T> {
  data: T[];
  totalLoaded: number;
  totalRecords: number;
  isLoading?: boolean;
  isFetching?: boolean;
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  columns: { key: string; label: string }[];
  renderRow: (item: T, index: number) => React.ReactNode;
  paginationType?: "infinite" | "normal"; // infinite by default
  itemsPerPage?: number;
}

const PaginatedTable = <T,>({
  data,
  totalLoaded,
  totalRecords,
  isLoading,
  isFetching,
  hasNextPage,
  fetchNextPage,
  columns,
  renderRow,
  paginationType = "infinite",
  itemsPerPage = 10,
}: IPaginatedTableProps<T>) => {
  const showLoadMore = paginationType === "infinite" && hasNextPage;

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={col.key}>
                <Typography variant="h6" fontWeight="bold">
                  {col.label}
                </Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        {data.map((item, index) => renderRow(item, index))}

        {(isLoading || isFetching) && (
          <TableRow>
            <TableCell colSpan={columns.length} align="center">
              <LoadingSpinner />
            </TableCell>
          </TableRow>
        )}

        {showLoadMore && (
          <TableRow>
            <TableCell colSpan={columns.length} align="center">
              <Button onClick={fetchNextPage}>Load More</Button>
            </TableCell>
          </TableRow>
        )}

        {!isLoading && (
          <TableRow>
            <TableCell colSpan={columns.length} align="center">
              <Typography variant="body2">
                Showing {totalLoaded} of {totalRecords} records
              </Typography>
            </TableCell>
          </TableRow>
        )}
      </Table>
    </TableContainer>
  );
};

export default PaginatedTable;
