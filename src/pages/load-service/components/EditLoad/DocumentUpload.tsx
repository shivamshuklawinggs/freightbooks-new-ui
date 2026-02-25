import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Paper, Typography, IconButton, Avatar, List, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import { CloudUpload, Delete, InsertDriveFile } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import {
  setFiles,
  removeFile,
} from '@/redux/Slice/EditloadSlice';
import { AppDispatch, RootState } from '@/redux/store';
import { getFilePreview } from '@/utils/getFilePreview';
import { LOAD_UPLOAD_URL } from '@/config';

const DocumentUpload = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { files } = useSelector((state: RootState) => state.editload);

  interface FileType {
    name: string;
    [key: string]: any; // Add additional properties if needed
  }

  const onDrop = useCallback(
    (acceptedFiles: FileType[]) => {
      const updatedFiles: FileType[] = [...files, ...acceptedFiles];
      dispatch(setFiles(updatedFiles));
    },
    [files, dispatch]
  );

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
    maxSize: 20971520, // 20MB
  });

  const deleteFile = (index: number) => {
    const confirm = window.confirm('Are you sure you want to delete this file?');
    if (!confirm) return;
    dispatch(removeFile(index));
  };

  

  const getFileType = (file: any) => {
    if (file instanceof File) return file.type;
    if (file instanceof Object) return file.mimetype;
    return '';
  };

  const getFileName = (file: any) => {
    return file.name || file.originalname || 'Unknown file';
  };

  const getFileSize = (file: any) => {
    if (file instanceof File) {
      return (file.size / (1024 * 1024)).toFixed(2);
    }else if(file instanceof Object){
      return (file.size / (1024 * 1024)).toFixed(2);
    }
    return '?';
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
          '&:hover': {
            backgroundColor: 'action.hover'
          }
        }}
      >
        <input {...getInputProps()} />
        <CloudUpload sx={{ fontSize: 40, color: 'primary.main' }} />
        <Typography>
          Drag/Drop files here or click to select files
        </Typography>
      </Paper>

      {files && files.length > 0 && (
        <List sx={{ mt: 2 }}>
          {files.map((file, index) => (
            <ListItem
              key={index}
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <ListItemAvatar>
                {getFileType(file).startsWith('image') ? (
                  <Avatar variant="square" src={getFilePreview(file,LOAD_UPLOAD_URL) || undefined} />
                ) : (
                  <Avatar>
                    <InsertDriveFile />
                  </Avatar>
                )}
              </ListItemAvatar>
              <ListItemText primary={getFileName(file)} secondary={`${getFileSize(file)} MB`} />
              <IconButton color="error"  onClick={() => deleteFile(index)}>
                <Delete />
              </IconButton>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default DocumentUpload;