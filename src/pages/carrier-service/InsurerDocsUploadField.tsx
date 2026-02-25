import React, { useCallback } from 'react';
import {
  Box, Paper, Typography, IconButton, Avatar,
  List, ListItem, ListItemAvatar
} from '@mui/material';
import { CloudUpload, Delete, InsertDriveFile } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { getFileType, getFilePreview, getFileSize, getFileName } from '@/utils/getFilePreview';
import { ICarrier ,IFile } from '@/types';
import { CARRIER_INSURANCE_DOCUMENTS_UPLOAD_URL } from '@/config';



const MAX_SIZE = 20 * 1024 * 1024; // 20MB


const InsurerDocsUploadField: React.FC = () => {
  const form = useFormContext<ICarrier>();
  const { control } = form;
  
  const {
    fields: documentsFields,
    append: appendDocuments,
    remove: removeDocuments,
  } = useFieldArray({
    control,
    name: 'insuranceDocuments' as const,
  });
  const {
    append:appendDeleteFiles,
  } = useFieldArray({
    control,
    name:'deleteInsuranceFiles' as any
  })
 
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      name: file.name,
      extension: file.name.split('.').pop(),
    }));
    appendDocuments(newFiles as any);
  }, [appendDocuments]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxSize: MAX_SIZE,
  });

  const handleRemove = (index: number) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      const fileItem = documentsFields[index]
      fileItem.filename && deleteFilesHandler(fileItem);
    removeDocuments(index);
    }
  };
  const deleteFilesHandler = (file: IFile) => {
    if ('fieldname' in file && 'filename' in file) {
      appendDeleteFiles(file.filename);
    }
  };
  
  return (
        <Box>
          <Paper
            {...getRootProps()}
            sx={{
              p: 3,
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: 'background.default',
              border: '2px dashed',
              borderColor: 'primary.main',
              '&:hover': { backgroundColor: 'action.hover' },
            }}
          >
            <input {...getInputProps()} />
            <CloudUpload sx={{ fontSize: 40, color: 'primary.main' }} />
            <Typography>Drag/Drop files here or click to select files</Typography>
          </Paper>

          {documentsFields.length > 0 && (
            <List sx={{ mt: 2 }}>
              {documentsFields.map((item, index) => {
                const file = item as IFile;
                return (
                  <ListItem
                    key={item.id}
                    sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}
                  >
                    <ListItemAvatar>
                      {getFileType(item as any).startsWith('image') ? (
                        <Avatar variant="square" src={getFilePreview(item as any,CARRIER_INSURANCE_DOCUMENTS_UPLOAD_URL) || undefined} />
                      ) : (
                        <Avatar>
                          <InsertDriveFile />
                        </Avatar>
                      )}
                    </ListItemAvatar>

                    <Box sx={{ flex: 1, mr: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        File Name: {getFileName(file as any)} | {getFileSize(file as any)} MB
                      </Typography>
                    </Box>

                    <IconButton color="error" onClick={() => handleRemove(index)}>
                      <Delete />
                    </IconButton>
                  </ListItem>
                );
              })}
            </List>
          )}
        </Box>
   

  );
};

export default InsurerDocsUploadField;
