import React, { useCallback, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  IconButton,
  Avatar,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useDropzone } from 'react-dropzone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import { InsertDriveFile } from '@mui/icons-material';
import { Controller, useFormContext } from 'react-hook-form';

import { getFileName, getFilePreview, getFileSize, getFileType } from '@/utils/getFilePreview';
import { DRIVING_LICENSE_UPLOAD_URL } from '@/config';
import { IDriver } from '@/types';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const UploadFile: React.FC = () => {
  const { control, setValue, watch,formState: { errors } } = useFormContext<IDriver>();
  const file = watch('file');

  
  const [localFile, setLocalFile] = useState<File | null>(null);

  const handleFile = useCallback(
    (file: File | null) => {
      setLocalFile(file);
      setValue('file', file as unknown as any);
    },
    [setValue]
  );

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      handleFile(acceptedFiles[0]);
    }
  }, [handleFile]);

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    multiple: false,
    noClick: true,
    noKeyboard: true,
    accept: {
      'image/*': [],
      'application/pdf': [],
    },
  });

  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    handleFile(selectedFile);
  };

  const handleDelete = () => {
    handleFile(null);
  };

  const displayFile = localFile || file;
  const fileType = getFileType(displayFile as unknown as any);

  return (
    <Controller
      name="file"
      control={control}
      render={() => (
        <Box sx={{ width: '100%', mt: 2 }}>
          {!displayFile ? (
            <Box
              {...getRootProps()}
              sx={{
                border: '2px dashed #ccc',
                borderRadius: 1,
                p: 2,
                textAlign: 'center',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'action.hover',
                },
              }}
            >
              <input {...getInputProps()} />
              <Button
                variant="contained"
                startIcon={<CloudUploadIcon />}
                sx={{ mb: 1 }}
                onClick={open}
              >
                Upload License
              </Button>
              <VisuallyHiddenInput
                type="file"
                onChange={handleManualChange}
                accept="image/*,.pdf"
              />
              <Typography variant="caption" color="text.secondary">
                Drag and drop a file here or click to select
              </Typography>
            </Box>
          ) : (
            <Box sx={{ mt: 2, position: 'relative' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {fileType?.startsWith('image') ? (
                  <Avatar
                    variant="square"
                    src={getFilePreview( displayFile as unknown as any, DRIVING_LICENSE_UPLOAD_URL ) || undefined}
                    sx={{ width: 56, height: 56 }}
                  />
                ) : (
                  <Avatar>
                    <InsertDriveFile />
                  </Avatar>
                )}
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" noWrap>
                    {getFileName(displayFile as unknown as any)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {getFileSize(displayFile as unknown as any)} MB
                  </Typography>
                </Box>
                <IconButton onClick={handleDelete} size="small" color="error">
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
          )}
          {errors?.file && <Typography variant="caption" color="error">{errors?.file?.message  || ''}</Typography>}
        </Box>
      )}
    />
  );
};

export default UploadFile;
