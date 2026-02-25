import React, { useCallback, useState } from 'react';
import { Box, Typography, IconButton, Avatar, List, ListItem, ListItemAvatar } from '@mui/material';
import { CloudUpload, Delete, InsertDriveFile } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { IFile, ILocationWithIds } from '@/types';
import { getFileType, getFilePreview, getFileSize } from '@/utils/getFilePreview';
import {  CHECKOUT_UPLOAD_URL } from '@/config';

const MAX_SIZE = 20 * 1024 * 1024; // 20MB

interface IUploadFileProps {
  location: ILocationWithIds;
  onFileChange: (files: File[] | null, deletedFiles?: IFile[]) => void;
}

const UploadFile: React.FC<IUploadFileProps> = ({ location, onFileChange }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [deletedFiles, setDeletedFiles] = useState<IFile[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.filter(file => file.size <= MAX_SIZE);
    setFiles(prevFiles => [...prevFiles, ...newFiles]);
    onFileChange([...files, ...newFiles], deletedFiles);
  }, [files, deletedFiles, onFileChange]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxSize: MAX_SIZE
  });

  const handleRemove = (index: number) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
    onFileChange(updatedFiles, deletedFiles);
  };

  const handleRemoveExisting = (file: IFile) => {
    setDeletedFiles(prev => [...prev, file]);
    onFileChange(files, [...deletedFiles, file]);
  };

  return (
    <Box>
      <Box
        {...getRootProps()}
        sx={{
          cursor: 'pointer',
          p: 3,
          textAlign: 'center',
          backgroundColor: 'background.default',
          border: '2px dashed',
          borderColor: 'primary.main',
          borderRadius: 1,
          '&:hover': { backgroundColor: 'action.hover' }
        }}
      >
        <input {...getInputProps()} />
        <CloudUpload sx={{ fontSize: 40, color: 'primary.main' }} />
        <Typography>Drag/Drop files here or click to select files</Typography>
      </Box>

      {/* Display existing files */}
      {location?.files && location?.files?.length > 0 && (
        <List sx={{ mt: 2 }}>
          {location.files.map((file: IFile, index: number) => (
            <ListItem
              key={index}
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <ListItemAvatar>
                {getFileType(file as any).startsWith('image') ? (
                  <Avatar variant="square" src={getFilePreview(file as any, CHECKOUT_UPLOAD_URL) as string} />
                ) : (
                  <Avatar>
                    <InsertDriveFile />
                  </Avatar>
                )}
              </ListItemAvatar>
              <Box sx={{ flex: 1, mr: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  {file.originalname} | {getFileSize(file as any)} MB
                </Typography>
              </Box>
              <IconButton 
                color="error" 
                onClick={() => handleRemoveExisting(file)}
                disabled={deletedFiles.some(df => df.filename === file.filename)}
              >
                <Delete />
              </IconButton>
            </ListItem>
          ))}
        </List>
      )}

      {/* Display new files */}
      {files.length > 0 && (
        <List sx={{ mt: 2 }}>
          {files.map((file, index) => (
            <ListItem
              key={index}
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <ListItemAvatar>
                {file.type.startsWith('image/') ? (
                  <Avatar variant="square" src={URL.createObjectURL(file)} />
                ) : (
                  <Avatar>
                    <InsertDriveFile />
                  </Avatar>
                )}
              </ListItemAvatar>
              <Box sx={{ flex: 1, mr: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  {file.name} | {(file.size / (1024 * 1024)).toFixed(2)} MB
                </Typography>
              </Box>
              <IconButton color="error" onClick={() => handleRemove(index)}>
                <Delete />
              </IconButton>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default UploadFile;
