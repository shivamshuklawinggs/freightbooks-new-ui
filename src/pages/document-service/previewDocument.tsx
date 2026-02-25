import React from 'react';
// Import the main component
import { Viewer ,Worker} from '@react-pdf-viewer/core';

// Import the styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import { IFile } from '@/types';
import { Button, Box,  Dialog, DialogActions, DialogContent, IconButton, Card, CardMedia,  } from '@mui/material';
import { FileDownload as FileDownloadIcon, Close as CloseIcon,PictureAsPdf as PdfIcon, InsertDriveFile as FileIcon, Image as ImageIcon, Description as DocIcon, TableChart as ExcelIcon,  } from "@mui/icons-material";
import { handleFileDownload } from '@/utils';

interface PreviewDocumentProps {
    file: IFile | null;
    handleClose: () => void;
}
const getFileIconComponent = (file: IFile): React.ReactNode => {
    if (!file) return <FileIcon />;
  
    const fileType = file.mimetype || '';
  
    if (fileType.startsWith("image")) return <ImageIcon color="primary" />;
    if (fileType.startsWith("application/pdf")) return <PdfIcon color="error" />;
    if (fileType.startsWith("application/msword") ||
      fileType.startsWith("application/vnd.openxmlformats-officedocument.wordprocessingml.document")) {
      return <DocIcon color="primary" />;
    }
    if (fileType.startsWith("application/vnd.ms-excel") ||
      fileType.startsWith("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")) {
      return <ExcelIcon color="success" />;
    }
    return <FileIcon />;
  };
const PreviewDocument: React.FC<PreviewDocumentProps> = ({ file, handleClose }) => {
    const renderFilePreview = () => {
        if (!file) return null;

        if (file.mimetype?.includes('image') || file.mimetype?.includes('webp') || file.mimetype?.includes('svg')) {
            return (
                <Card sx={{ maxWidth: '100%', maxHeight: '80vh' }}>
                    <CardMedia
                        component="img"
                        image={file.url + file.filename}
                        alt={file.filename}
                        sx={{ objectFit: 'contain', maxHeight: '70vh' }}
                    />
                </Card>
            );
        }
        if(file.mimetype?.includes('video') || file.mimetype?.includes('webm') ) {
            return (
                <Card sx={{ maxWidth: '100%', maxHeight: '80vh' }}>
                    <CardMedia
                        component="video"
                        src={file.url + file.filename}
                        
                        sx={{ objectFit: 'contain', maxHeight: '70vh' }}
                    />
                </Card>
            );
        }
        if(file.mimetype?.includes('pdf')) {
            return (
                <Box >
                   <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                   <Viewer fileUrl={file.url + file.filename} />
                   </Worker>
                  
                </Box>
            )
        }

        return (
            <Box sx={{ textAlign: 'center', p: 3 }}>
                {getFileIconComponent(file)}
            </Box>
        );
    };

    return (
        <Dialog
            open={!!file}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
        >
            <DialogActions sx={{ p: 1 }}>
                <IconButton onClick={handleClose}>
                    <CloseIcon />
                </IconButton>
            </DialogActions>
            <DialogContent>
                {renderFilePreview()}
            </DialogContent>
            <DialogActions>
                <Button
                    startIcon={<FileDownloadIcon />}
                    onClick={() => file && handleFileDownload(file, file.url as string)}
                >
                    Download
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PreviewDocument;