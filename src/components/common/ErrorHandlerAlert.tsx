import { FC, useEffect, useState } from 'react'
import { Alert, Collapse, IconButton } from '@mui/material'
import { Close } from '@mui/icons-material';
import { extractFormErrors, formatFieldName } from '@/utils/extractFormErrors';

interface ErrorHandlerAlertProps {
  error: any;
  toast?: boolean
  excludedFields?: string[]
}

const ErrorHandlerAlert: FC<ErrorHandlerAlertProps> = ({ error,toast=false,excludedFields=[] }) => {
  const [open, setOpen] = useState(false)

  const isApiError = !!error?.response || typeof error?.status === 'number'
  const status = error?.status ?? (isApiError ? 400 : undefined)
  const message = error?.response?.data?.message || error?.message
  const required: string[] = Array.isArray(error?.response?.data?.required) ? error?.response?.data?.required : []


  // react-hook-form/Yup errors detection and collection
  const isYupError = !isApiError && error && typeof error === 'object'
  const fieldErrors = isYupError ? extractFormErrors(error, excludedFields) : []
  useEffect(() => {
    if(error){
      setOpen(true)
      return 
    }else{
      setOpen(false)
      return 
    }
  }, [error])

  const severity: 'error' | 'warning' = isApiError && status >= 400 ? 'error' : fieldErrors.length > 0 ? 'warning' : 'error'
  const headerText = isYupError && fieldErrors.length > 0 
    ? 'Please fix the following validation errors:' 
    : message 
  
  return (
    <Collapse in={open}>
      <Alert
        severity={severity}
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={() => setOpen(false)}
          >
            <Close fontSize="inherit" />
          </IconButton>
        }
        sx={{ mb: 2, borderRadius: 2, fontSize: '0.85rem', alignItems: 'flex-start' }}
      >
        {headerText && <strong>{headerText}</strong>}
        {required.length > 0 && (
          <ul style={{ margin: '4px 0 0', paddingLeft: 20 }}>
            {required.map((item: any, index: number) => (
              <li key={index} style={{ fontSize: '0.8rem' }}>
                {typeof item === 'object' ? JSON.stringify(item) : item}
              </li>
            ))}
          </ul>
        )}
        {fieldErrors.length > 0 && (
          <ul style={{ margin: '4px 0 0', paddingLeft: 20 }}>
            {fieldErrors.map((e, i) => (
              <li key={i} style={{ fontSize: '0.8rem' }}>
                <strong>{formatFieldName(e.field)}:</strong> {e.message}
              </li>
            ))}
          </ul>
        )}
      </Alert>
    </Collapse>
  )
}

export default ErrorHandlerAlert