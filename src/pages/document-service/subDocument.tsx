import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { useQuery } from '@tanstack/react-query';
import { fetchSubDocuments } from '@/redux/api';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Stack, Chip, TablePagination, Tabs, Tab, Checkbox, Button, } from '@mui/material';
import { RemoveRedEye as ViewIcon, Download, Mail } from '@mui/icons-material';
import { IDocument, IFile } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { handleFileDownload,getSubDocumentName } from '@/utils';
import { toast } from 'react-toastify';
import SendEmail from './SendEmail';
import PreviewDocument from './previewDocument';
import {carrierSubTypes,customerSubTypes,loadSubTypes} from '@/data/documetsdata';
import ExpenseDocument from './ExpenseDocument';
import { HOUR_MINUTE_FORMAT, TIME_FORMAT } from '@/config/constant';
import moment from 'moment';

interface SubDocumentProps {
  parentId: string;
  type: string;
}

const SubDocument: React.FC<SubDocumentProps> = ({ parentId, type }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, pagination } = useSelector((state: RootState) => state.subDocuments);
  const [activeId, setActiveId] = useState<string>(
    type === 'carrier' ? 'carrierId' : 
    type === 'customer' ? 'customerId' : 
    type === 'load' ? 'loadId' : ''
  );
  const subtypes = type === 'carrier' ? carrierSubTypes : type === 'customer' ? customerSubTypes : loadSubTypes;
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [subtype, setSubtype] = useState<string>('');
  const [selectedDocuments, setSelectedDocuments] = useState<IFile[]>([]);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [file, setFile] = useState<IFile | null>(null);

  
  const handleCheckboxChange = (document: IFile) => {
    setSelectedDocuments(prev => {
      const isSelected = prev.some(doc => doc.filename === document.filename);
      if (isSelected) {
        return prev.filter(doc => doc.filename !== document.filename);
      } else {
        return [...prev, document];
      }
    });
  };
 const handleFileOpen = (document: IFile) => {
    setFile(document);
  };
  const handleFileClose = () => {
    setFile(null);
  };
  const handleEmailDialogOpen = () => {
    if (selectedDocuments.length === 0) {
      toast.error('Please select at least one document to send');
      return;
    }
    setEmailDialogOpen(true);
  };
  useEffect(() => {
    setCurrentPage(1);
    // Set default subtype and activeId when type changes
    if (type === 'carrier') {
      setSubtype('carrier');
      setActiveId('carrierId');
    } else if (type === 'customer') {
      setSubtype('customer');
      setActiveId('customerId');
    } else if (type === 'load') {
      setSubtype('load');
      setActiveId('loadId');
    }
  }, [type]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    setSubtype(newValue);
    setCurrentPage(1);
  };


  const { isPending } = useQuery({
    queryKey: ['subDocuments', type, subtype, parentId, currentPage, limit, activeId],
    queryFn: async () => {
      if (!activeId || !parentId || !subtype) {
        throw new Error('Missing required parameters');
      }
      
      const params:Record<string,any> = {
        page: currentPage,
        limit,
        type: subtype,
        [activeId as keyof typeof params]: parentId,
      };
      return await dispatch(fetchSubDocuments(params));
    },
    enabled: Boolean(parentId && activeId && subtype)
  });



  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Tabs value={subtype} onChange={handleTabChange}>
          {subtypes.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </Tabs>
        {selectedDocuments.length > 0 && (
          <Button
            variant="contained"
            size='small'
            startIcon={<Mail />}
            onClick={handleEmailDialogOpen}
          >
            Send {selectedDocuments.length} Document(s)
          </Button>
        )}
      </Box>

      {subtype && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                   Select
                </TableCell>
                <TableCell>{subtype === 'expense' ? 'Service' : subtype === 'driver' ? 'Driver Name' :subtype === 'carrierinsurance' ? 'Insurance Company' : 'Name'}</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>File</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isPending ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <LoadingSpinner size={30} />
                  </TableCell>
                </TableRow>
              ) :subtype === 'expense' ? (
                <ExpenseDocument data={data} selectedDocuments={selectedDocuments} setSelectedDocuments={setSelectedDocuments} file={file} setFile={setFile} />
              ) : data?.length > 0 ? (
                data.map((document: IDocument) => {
                  const files = document?.file
                  return (
                    <TableRow key={document._id}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedDocuments.some(doc => doc.filename === files?.filename)}
                          onChange={() => handleCheckboxChange(files as IFile)}
                        />
                      </TableCell>
                      <TableCell>{ getSubDocumentName(document,subtype)}</TableCell>
                      <TableCell>{moment(document.createdAt).format(`${TIME_FORMAT} ${HOUR_MINUTE_FORMAT}`)}</TableCell>
                      <TableCell>
                        <Chip
                          label={files?.originalname || 'No file'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="right">
                          <IconButton
                            size="small"
                            onClick={() => handleFileOpen(files as IFile)}
                            disabled={!files}
                          >
                            <ViewIcon  color='primary'/>
                          </IconButton>
                          <IconButton
                            size="small"
                            color='primary'
                            onClick={() => handleFileDownload(files as IFile, files?.url as string)}
                            disabled={!files}
                          >
                            <Download />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No documents found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={pagination?.total || 0}
            page={currentPage - 1}
            onPageChange={(_, newPage) => setCurrentPage(newPage + 1)}
            rowsPerPage={limit}
            onRowsPerPageChange={(event) => setLimit(Number(event.target.value))}
          />
        </TableContainer>
      )}
       <SendEmail selectedDocuments={selectedDocuments} setSelectedDocuments={setSelectedDocuments} emailDialogOpen={emailDialogOpen} setEmailDialogOpen={setEmailDialogOpen} />
      {file && (
        <PreviewDocument file={file} handleClose={handleFileClose} />
      )}
    </Box>
  );
};

export default SubDocument;