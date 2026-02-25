import React, { useCallback, useState, useEffect } from 'react';
import {
  Box, Typography, IconButton, Avatar,
  List, ListItem, ListItemAvatar
} from '@mui/material';
import { Delete, InsertDriveFile } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { IFile, IExpenseLoadItem } from '@/types';
import { toast } from 'react-toastify';
import { getFilePreview, getFileType } from '@/utils/getFilePreview';
import { EXPENSE_UPLOAD_URL } from '@/config';

const MAX_SIZE = 20 * 1024 * 1024; // 20MB

interface UploadFile {
  file: File | IFile;
  customName: string;
}

const DocumentUpload: React.FC = () => {
  const form = useFormContext<IExpenseLoadItem>();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const { control } = form;

  const {
    append: appendDocuments,
    remove: removeDocuments
  } = useFieldArray({
    control,
    name: 'receipt'
  });

  const {
    append: appendDeleteFiles,
  } = useFieldArray({
    control,
    name: 'deleteFiles' as any
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.filter(file => {
      if (file.size > MAX_SIZE) {
        toast.error(`File ${file.name} exceeds ${MAX_SIZE / (1024 * 1024)}MB limit`);
        return false;
      }
      return true;
    }).map((file) => ({
      file,
      customName: file.name
    }));

    if (newFiles.length > 0) {
      setFiles(prev => [...prev, ...newFiles]);
      appendDocuments(newFiles.map(f => ({ file: f.file })) as any);
    }
  }, [appendDocuments]);

  const handleRemove = (index: number) => {
    const confirm = window.confirm('Are you sure you want to delete this file?');
    if (!confirm) return;

    const fileToRemove = files[index];
    if ('filename' in fileToRemove.file) {
      // If it's an existing file (IFile)
      appendDeleteFiles(fileToRemove.file);
    }
    
    setFiles(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
    removeDocuments(index);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf']
    },
    maxSize: MAX_SIZE
  });

  // Initialize files from form data
  useEffect(() => {
    const existingFiles = form.getValues('receipt') || [];
    if (existingFiles.length > 0 && files.length === 0) {
      setFiles(existingFiles.map(file => ({
        file: file,
        customName: file.originalname || file.filename || 'Unknown'
      })));
    }
  }, [form, files.length]);

  return (
    <Box>
      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed #ccc',
          borderRadius: 1,
          p: 2,
          textAlign: 'center',
          cursor: 'pointer',
          '&:hover': {
            borderColor: 'primary.main'
          }
        }}
      >
        <input {...getInputProps()} />
        <Typography>Drag and drop files here, or click to select files</Typography>
        <Typography variant="caption" color="textSecondary">
          Maximum file size: {MAX_SIZE / (1024 * 1024)}MB
        </Typography>
      </Box>

      {files.length > 0 && (
        <List sx={{ mt: 2 }}>
          {files.map((file, index) => (
            <ListItem
              key={index}
              secondaryAction={
                <IconButton 
                  color="error" 
                  onClick={() => handleRemove(index)}
                  size="small"
                >
                  <Delete />
                </IconButton>
              }
            >
              <ListItemAvatar>
                {getFileType(file.file as any || file).startsWith('image') ? (
                  <Avatar 
                    variant="square" 
                    src={getFilePreview(file.file as any || file,EXPENSE_UPLOAD_URL) || undefined}
                  />
                ) : (
                  <Avatar>
                    <InsertDriveFile />
                  </Avatar>
                )}
              </ListItemAvatar>

              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" noWrap>
                  {file.customName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {file.file instanceof File 
                    ? `${(file.file.size / (1024 * 1024)).toFixed(2)} MB`
                    : `${((file.file.size || 0) / (1024 * 1024)).toFixed(2)} MB`
                  }
                </Typography>
              </Box>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default DocumentUpload;
