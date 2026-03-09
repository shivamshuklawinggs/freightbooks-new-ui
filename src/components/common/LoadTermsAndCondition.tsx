import { setTermsAndConditions, setAcceptTerms } from '@/redux/Slice/loadSlice'
import { setTermsAndConditions as setEditTermsAndConditions, setAcceptTerms as setEditAcceptTerms } from '@/redux/Slice/EditloadSlice'
import  { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControlLabel, Checkbox, Box, Typography, Grid, Card, Paper, IconButton, Tooltip, CircularProgress, } from '@mui/material'
import { Visibility, Description, AddLocation, Close, Edit, Save } from '@mui/icons-material'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'

import { toast } from "react-toastify"
import { useGenerateRateConfirmationPDF } from '@/hooks/useGenerateRateConfirmationPDF'
import { getIcon } from './icons/getIcon'

const LoadTermsAndCondition = ({ type, handleAddDelivery }: { type: "load" | "editload", handleAddDelivery: () => void }) => {
  const { generatePDF, isLoading: isGeneratingPdf, error: pdfError } = useGenerateRateConfirmationPDF({ type,  })
  const [open, setOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const dispatch = useDispatch()
  
  const companytermsandconditions = useSelector((state: RootState) => 
    state.user.currentCompanyDetails?.termsandconditions
  )
  
  const { termsandconditions, AcceptTerms } = useSelector((state: RootState) => state[type])

  const handleClose = () => {
    setOpen(false)
    setIsEditing(false)
  }

  const handleTermsAndConditionChange = (data: string) => {
    if (type === "load") {
      dispatch(setTermsAndConditions(data))
    }
    if (type === "editload") {
      dispatch(setEditTermsAndConditions(data))
    }
  }

  const handleAcceptTermsChange = (data: boolean) => {
    if (type === "load") {
      dispatch(setAcceptTerms(data))
    }
    if (type === "editload") {
      dispatch(setEditAcceptTerms(data))
    }
  }

  useEffect(() => {
    if (!termsandconditions) {
      if (type === "load") {
        dispatch(setTermsAndConditions(companytermsandconditions))
      }
      if (type === "editload") {
        dispatch(setEditTermsAndConditions(companytermsandconditions))
      }
    }
  }, [termsandconditions, companytermsandconditions, dispatch, type])

 

  useEffect(() => {
    if (pdfError) {
      toast.error(pdfError)
    }
  }, [pdfError])

  return (
    <Card elevation={1} sx={{ p: 3, mt: 2, border: '1px solid', borderColor: 'divider' }}>
      <Grid container spacing={3} alignItems="center">
        {/* Terms and Conditions Section */}
        <Grid item xs={12} md={6}>
          <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={AcceptTerms}
                  onChange={(e) => handleAcceptTermsChange(e.target.checked)}
                  color="primary"
                  sx={{ 
                    '&.Mui-checked': { color: 'primary.main' },
                    mr: 1 
                  }}
                />
              }
              label={
                <Typography variant="subtitle1" fontWeight="medium">
                  I Accept The Terms And Conditions
                </Typography>
              }
            />
          </Box>
          
          <Box display="flex" gap={1}>
            <Tooltip title="View and edit terms">
              <Button
                variant="outlined"
                size="small"
                startIcon={<Visibility />}
                onClick={() => setOpen(true)}
                sx={{ textTransform: 'none' }}
              >
                View Terms
              </Button>
            </Tooltip>
            
           
          </Box>
        </Grid>

        {/* Action Buttons Section */}
        <Grid item xs={12} md={6}>
          <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} justifyContent="flex-end">
            <Tooltip title="Generate rate confirmation PDF">
              <Button
                size="small"
                variant="contained"
                color="primary"
                startIcon={isGeneratingPdf ? <CircularProgress size={16} /> : <Description />}
                onClick={()=>generatePDF()}
                disabled={isGeneratingPdf}
                sx={{ 
                  minWidth: '10px',
                  textTransform: 'none'
                }}
              >
                {isGeneratingPdf ? "Generating PDF..." : "Rate Confirmation"}
              </Button>
            </Tooltip>

            <Tooltip title="Add additional delivery location">
              <Button
                size="small"
                variant="outlined"
                color="secondary"
                startIcon={<AddLocation />}
                onClick={handleAddDelivery}
                sx={{ 
                  minWidth: '10px',
                  textTransform: 'none'
                }}
              >
                Add Delivery Location
              </Button>
            </Tooltip>
          </Box>
        </Grid>
      </Grid>
      {/* Terms & Conditions Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth PaperProps={{ sx: { height: '80vh' } }}>
        <DialogActions>
          <Button onClick={handleClose}>
            {getIcon('CloseIcon')}
          </Button>
        </DialogActions>
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider',
          pb: 2
        }}>
          <Typography variant="h6" component="div">
            Terms and Conditions
          </Typography>
          <Box>
            {!isEditing && (
              <Tooltip title="Edit terms">
                <IconButton onClick={() => setIsEditing(true)} sx={{ mr: 1 }}>
                  <Edit />
                </IconButton>
              </Tooltip>
            )}
            <IconButton onClick={handleClose}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0, '&.MuiDialogContent-root': { pt: 0 } }}>
          <Box sx={{ height: '100%', p: isEditing ? 0 : 3 }}>
            {isEditing ? (
              <CKEditor
                editor={ClassicEditor as any}
                data={termsandconditions || ""}
                onChange={(event, editor) => {
                  const data = editor.getData()
                  handleTermsAndConditionChange(data)
                }}
                config={{
                  toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'undo', 'redo']
                }}
              />
            ) : (
              <Paper variant="outlined" sx={{ p: 3, height: '100%', overflow: 'auto' }}>
                <div 
                  dangerouslySetInnerHTML={{ __html: termsandconditions || "No terms and conditions set" }} 
                  style={{ 
                    fontFamily: 'inherit',
                    lineHeight: 1.6
                  }}
                />
              </Paper>
            )}
          </Box>
        </DialogContent>

        {isEditing && (
          <DialogActions sx={{ borderTop: '1px solid', borderColor: 'divider', p: 2 }}>
            <Button onClick={() => setIsEditing(false)} color="inherit">
              Cancel
            </Button>
            <Button 
              onClick={() => {
                setIsEditing(false)
                toast.success("Terms and conditions updated successfully")
              }} 
              variant="contained"
              startIcon={<Save />}
            >
              Save Changes
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </Card>
  )
}

export default LoadTermsAndCondition