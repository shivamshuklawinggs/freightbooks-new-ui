import { Close } from '@mui/icons-material';
import { Alert, AlertTitle, Collapse, IconButton, Typography } from '@mui/material';
import  { useState, useEffect, FC } from 'react'

export const FileImportError: FC<{ allerrors: Array<string>, message: string }> = ({ allerrors, message }) => {
    const [openErrorAlert, setOpenErrorAlert] = useState(true);
    useEffect(() => {
        if (Array.isArray(allerrors) && allerrors.length > 0) {
            setOpenErrorAlert(true);
        }
    }, [allerrors]);
    return Array.isArray(allerrors) && allerrors.length > 0 && (
        <Collapse in={openErrorAlert}>
            <Alert
                severity="error"
                action={
                    <IconButton
                        aria-label="close"
                        color="inherit"
                        size="small"
                        onClick={() => {
                            setOpenErrorAlert(false);
                        }}
                    >
                        <Close fontSize="inherit" />
                    </IconButton>
                }
                sx={{ mb: 2 }}
            >
                <AlertTitle>{message}</AlertTitle>
                <Typography variant="body2">
                    {allerrors.join(', ')}
                </Typography>
            </Alert>
        </Collapse>
    )
}
