import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tabs, Tab, IconButton, TablePagination, } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { Remove as RemoveIcon, Add as AddIcon } from '@mui/icons-material';
import { RootState, AppDispatch } from '@/redux/store';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { fetchDocuments } from '@/redux/api';
import { getSubDocumentName,getDocumentCell } from '@/utils';
import { IDocument, IFile } from '@/types';
import { setDocuments } from '@/redux/Slice/DocumentSlice';
import SubDocument from './subDocument'; // Import the SubDocument component
import {documentType} from '@/data/documetsdata';
import { withPermission } from '@/hooks/ProtectedRoute/authUtils';
import { HOUR_MINUTE_FORMAT, TIME_FORMAT } from '@/config/constant';
import moment from 'moment';


const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxHeight: '90vh',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  overflow: 'auto'
};

const Documents: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, pagination } = useSelector((state: RootState) => state.documents);
  const [activeTab, setActiveTab] = useState<string>('load');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [selectedDocument] = useState<IFile | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const handleExpandRow = (id: string,) => {
    if (expandedRow === id) {
      setExpandedRow(null);
    } else {
      setExpandedRow(id);
    }
  };
  const { isPending } = useQuery({
    queryKey: ['documents', activeTab, currentPage, limit],
    queryFn: async () => {
      return await dispatch(fetchDocuments({ 
        page: currentPage, 
        limit, 
        type: activeTab 
      }));
    },
  });

  useEffect(() => {
    dispatch(setDocuments([]));
    setCurrentPage(1);
    setExpandedRow(null);
  }, [activeTab, dispatch]);

  return (
    <>
      <Box sx={{ minHeight: '100vh' }}>
          <Box mb={2}>
            <Typography variant="h5" fontWeight={700}>Documents</Typography>
            <Typography variant="body2" color="text.secondary">View and manage uploaded documents</Typography>
          </Box>
          <Paper elevation={0} sx={{ mb: 1.5, borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
            >
              {documentType.map((status) => (
                <Tab key={status.value} label={status.label} value={status.value} />
              ))}
            </Tabs>
          </Paper>
          <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell padding="checkbox" />
                    {getDocumentCell(activeTab)}
                    <TableCell sx={{ fontWeight: 700, py: 1.5 }}>Created Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Last Updated</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isPending ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                        <LoadingSpinner size={36} />
                      </TableCell>
                    </TableRow>
                  ) : data?.length > 0 ? (
                    data.map((document: IDocument) => {
                      const isExpanded = expandedRow === document._id;
                      return (
                        <React.Fragment key={document._id}>
                          <TableRow hover>
                            <TableCell padding="checkbox">
                              <IconButton size="small" onClick={() => handleExpandRow(document._id)}>
                                {isExpanded ? <RemoveIcon fontSize="small" /> : <AddIcon fontSize="small" />}
                              </IconButton>
                            </TableCell>
                            <TableCell sx={{ py: 1.25 }}>{getSubDocumentName(document, activeTab)}</TableCell>
                            <TableCell sx={{ py: 1.25 }}>{moment(document.createdAt).format(`${TIME_FORMAT} ${HOUR_MINUTE_FORMAT}`)}</TableCell>
                            <TableCell sx={{ py: 1.25 }}>{moment(document.updatedAt).format(`${TIME_FORMAT} ${HOUR_MINUTE_FORMAT}`)}</TableCell>
                          </TableRow>
                          {isExpanded && (
                            <TableRow>
                              <TableCell colSpan={8} sx={{ py: 0, bgcolor: 'action.hover' }}>
                                <Box sx={{ m: 1 }}>
                                  <SubDocument parentId={document._id} type={activeTab} />
                                </Box>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                        <Typography variant="body2" color="text.secondary">No records found</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={pagination.total}
              page={currentPage - 1}
              rowsPerPage={limit}
              onPageChange={(_, newPage) => setCurrentPage(newPage + 1)}
              onRowsPerPageChange={(event) => setLimit(Number(event.target.value))}
              sx={{ '& .MuiTablePagination-toolbar': { minHeight: 48 } }}
            />
          </Paper>
      </Box>
      <Modal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
      >
        <Box sx={modalStyle}>
          <Typography variant="h6" component="h2" gutterBottom>
            Document Preview
          </Typography>
          {selectedDocument && (
            <iframe
              src={selectedDocument.url}
              style={{ width: '100%', height: 'calc(90vh - 100px)' }}
              title="Document Preview"
            />
          )}
        </Box>
      </Modal>
    </>
  );
};

export default withPermission("view",["documents"])(Documents);
