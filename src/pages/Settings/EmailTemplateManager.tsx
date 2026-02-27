import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  MenuItem,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import api from '@/utils/axiosInterceptor';

interface EmailTemplate {
  _id: string;
  name: string;
  type: string;
  subject: string;
  htmlContent: string;
  variables: string[];
  description?: string;
  isActive: boolean;
  isDefault: boolean;
}

interface TemplateType {
  value: string;
  label: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const EmailTemplateManager: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [templateTypes, setTemplateTypes] = useState<TemplateType[]>([]);
  const [availableVariables, setAvailableVariables] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      name: '',
      type: '',
      subject: '',
      htmlContent: '',
      description: '',
      isActive: true,
    },
  });

  const selectedType = watch('type');

  useEffect(() => {
    fetchTemplates();
    fetchTemplateTypes();
  }, []);

  useEffect(() => {
    if (selectedType) {
      fetchAvailableVariables(selectedType);
    }
  }, [selectedType]);

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/notifications/email-templates');
      if (response.data.success) {
        setTemplates(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to fetch templates');
    }
  };

  const fetchTemplateTypes = async () => {
    try {
      const response = await api.get('/notifications/email-templates/types');
      if (response.data.success) {
        setTemplateTypes(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching template types:', error);
    }
  };

  const fetchAvailableVariables = async (type: string) => {
    try {
      const response = await api.get('/notifications/email-templates/variables', {
        params: { type },
      });
      if (response.data.success) {
        setAvailableVariables(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching variables:', error);
    }
  };

  const handleOpenDialog = (template?: EmailTemplate) => {
    if (template) {
      setEditingTemplate(template);
      reset({
        name: template.name,
        type: template.type,
        subject: template.subject,
        htmlContent: template.htmlContent,
        description: template.description || '',
        isActive: template.isActive,
      });
    } else {
      setEditingTemplate(null);
      reset({
        name: '',
        type: '',
        subject: '',
        htmlContent: '',
        description: '',
        isActive: true,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTemplate(null);
    reset();
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      if (editingTemplate) {
        const response = await api.put(
          `/notifications/email-templates/${editingTemplate._id}`,
          data
        );
        if (response.data.success) {
          toast.success('Template updated successfully');
          fetchTemplates();
          handleCloseDialog();
        }
      } else {
        const response = await api.post('/notifications/email-templates', data);
        if (response.data.success) {
          toast.success('Template created successfully');
          fetchTemplates();
          handleCloseDialog();
        }
      }
    } catch (error: any) {
      console.error('Error saving template:', error);
      toast.error(error.response?.data?.message || 'Failed to save template');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;

    try {
      const response = await api.delete(`/notifications/email-templates/${templateId}`);
      if (response.data.success) {
        toast.success('Template deleted successfully');
        fetchTemplates();
      }
    } catch (error: any) {
      console.error('Error deleting template:', error);
      toast.error(error.response?.data?.message || 'Failed to delete template');
    }
  };

  const handleDuplicate = async (templateId: string) => {
    try {
      const response = await api.post(
        `/notifications/email-templates/${templateId}/duplicate`
      );
      if (response.data.success) {
        toast.success('Template duplicated successfully');
        fetchTemplates();
      }
    } catch (error: any) {
      console.error('Error duplicating template:', error);
      toast.error(error.response?.data?.message || 'Failed to duplicate template');
    }
  };

  const handlePreview = async () => {
    const type = watch('type');
    const htmlContent = watch('htmlContent');
    const subject = watch('subject');

    if (!type || !htmlContent) {
      toast.warning('Please select a type and add HTML content');
      return;
    }

    const sampleVariables: any = {
      customerName: 'John Doe',
      invoiceNumber: 'INV-12345',
      invoiceAmount: '$1,234.56',
      dueDate: new Date().toLocaleDateString(),
      daysUntilDue: '2',
      daysOverdue: '7',
      companyName: 'Your Company',
      companyEmail: 'billing@company.com',
      companyPhone: '(555) 123-4567',
      invoiceUrl: 'https://example.com/invoice/12345',
      lateFee: '$50.00',
    };

    let previewContent = htmlContent;
    let previewSubject = subject;

    for (const [key, value] of Object.entries(sampleVariables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      previewContent = previewContent.replace(regex, String(value));
      previewSubject = previewSubject.replace(regex, String(value));
    }

    setPreviewHtml(`
      <div style="padding: 20px; background: #f5f5f5;">
        <h3 style="margin-bottom: 10px;">Subject: ${previewSubject}</h3>
        <div style="background: white; padding: 20px; border-radius: 8px;">
          ${previewContent}
        </div>
      </div>
    `);
    setPreviewOpen(true);
  };

  const insertVariable = (variable: string) => {
    const currentContent = watch('htmlContent');
    setValue('htmlContent', currentContent + `{{${variable}}}`);
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Email Templates</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Create Template
          </Button>
        </Box>

        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template._id}>
                  <TableCell>
                    {template.name}
                    {template.isDefault && (
                      <Chip label="Default" size="small" color="primary" sx={{ ml: 1 }} />
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={String(template.type).replace(/_/g, ' ')}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{template.subject}</TableCell>
                  <TableCell>
                    <Chip
                      label={template.isActive ? 'Active' : 'Inactive'}
                      size="small"
                      color={template.isActive ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(template)}
                      disabled={template.isDefault}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDuplicate(template._id)}
                    >
                      <CopyIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(template._id)}
                      disabled={template.isDefault}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {templates.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No templates found. Create your first template!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {editingTemplate ? 'Edit Template' : 'Create Template'}
            <IconButton onClick={handleCloseDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 2 }}>
              <Tab label="Basic Info" />
              <Tab label="HTML Content" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Controller
                    name="name"
                    control={control}
                    rules={{ required: 'Name is required' }}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Template Name"
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="type"
                    control={control}
                    rules={{ required: 'Type is required' }}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        fullWidth
                        select
                        label="Template Type"
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        disabled={!!editingTemplate}
                      >
                        {templateTypes.map((type) => (
                          <MenuItem key={type.value} value={type.value}>
                            {type.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="subject"
                    control={control}
                    rules={{ required: 'Subject is required' }}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Email Subject"
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message || 'Use {{variableName}} for dynamic content'}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        multiline
                        rows={2}
                        label="Description"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="isActive"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Switch {...field} checked={field.value} />}
                        label="Active"
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Available Variables:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {availableVariables.map((variable) => (
                      <Chip
                        key={variable}
                        label={`{{${variable}}}`}
                        size="small"
                        onClick={() => insertVariable(variable)}
                        clickable
                      />
                    ))}
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="htmlContent"
                    control={control}
                    rules={{ required: 'HTML content is required' }}
                    render={({ field, fieldState }) => (
                      <Box>
                        <Typography variant="subtitle2" gutterBottom sx={{ mb: 1 }}>
                          HTML Content *
                        </Typography>
                        <Box
                          sx={{
                            border: fieldState.error ? '1px solid #d32f2f' : '1px solid rgba(0, 0, 0, 0.23)',
                            borderRadius: 1,
                            '&:hover': {
                              borderColor: fieldState.error ? '#d32f2f' : 'rgba(0, 0, 0, 0.87)',
                            },
                            '& .ck-editor__editable': {
                              minHeight: '400px',
                            },
                          }}
                        >
                          <CKEditor
                            editor={ClassicEditor as any}
                            data={field.value || ''}
                            onChange={(event: any, editor: any) => {
                              const data = editor.getData();
                              field.onChange(data);
                            }}
                            config={{
                              toolbar: [
                                'heading',
                                '|',
                                'bold',
                                'italic',
                                'underline',
                                'strikethrough',
                                '|',
                                'bulletedList',
                                'numberedList',
                                '|',
                                'outdent',
                                'indent',
                                '|',
                                'link',
                                'blockquote',
                                'imageUpload',
                                'insertTable',
                                'mediaEmbed',
                                '|',
                                'undo',
                                'redo',
                              ]
                            }}
                          />
                        </Box>
                        {fieldState.error && (
                          <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                            {fieldState.error.message}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          Use {'{{variableName}}'} for dynamic content. Click variables above to insert them.
                        </Typography>
                      </Box>
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    startIcon={<VisibilityIcon />}
                    onClick={handlePreview}
                  >
                    Preview Template
                  </Button>
                </Grid>
              </Grid>
            </TabPanel>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {editingTemplate ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Template Preview
            <IconButton onClick={() => setPreviewOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box
            dangerouslySetInnerHTML={{ __html: previewHtml }}
            sx={{ border: '1px solid #ddd', borderRadius: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default EmailTemplateManager;
