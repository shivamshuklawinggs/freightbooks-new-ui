import React, { useState, FormEvent } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Box, Button, Alert, Container, Stack, Stepper, Step, StepLabel, useTheme, alpha, CircularProgress, Typography, Card, CardContent } from "@mui/material";
import { LocalShipping, People, Business, LocationOn, AttachFile, Save as SaveIcon, ArrowBack as ArrowBackIcon, ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import { AppDispatch, RootState } from "@/redux/store";
import LoadDetails from "./LoadDetails";
import Carrier from "./Carrier/Index";
import Delivery from "./Delivery";
import { setActiveTab, resetLoad, setCustomerInformation } from "@/redux/Slice/loadSlice";
import { toast } from "react-toastify";
import Pickup from "./Pickup";
import { useNavigate } from "react-router-dom";
import { paths } from "@/utils/paths";
import DocumentUpload from "./DocumentUpload";
import { validateLoadSchema } from "@/pages/load-service/Schema/loadSchema";
import { tabs } from "@/data/Loads";
import CustomerInformation from "./CustomerInformation/Index";
import { LoadValidationData } from "@/redux/InitialData/Load";
import apiService from "@/service/apiService";
import { useMutation, useQuery } from '@tanstack/react-query';
import { withPermission } from "@/hooks/ProtectedRoute/authUtils";

const CreateLoad: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { currentCompany } = useSelector((state: RootState) => state.user);
  const { activeTab, loadDetails, termsandconditions, customerId, pickupLocationId, carrierIds, deliveryLocationId, customerContactPerson,
    files, pnonumber, AcceptTerms ,signature} = useSelector((state: RootState) => state.load);

  const [error, setError] = useState<string | null>(null);
  const createLoadMutation = useMutation({
    mutationFn: (formData: FormData) => apiService.createLoad(formData),
    onSuccess: () => {
      toast.success(`Load created successfully!`);
      dispatch(resetLoad());
      navigate(paths.viewload);
    },
    onError: (err: any) => {
      const errorMsg = err?.response?.data?.message || err.message || 'Failed to submit load.';
      toast.error(errorMsg);
      setError(errorMsg);
      console.warn('Error submitting load:', err);
    }
  });

  const validateTabData = async (tabname: string): Promise<void> => {
    const validateData: LoadValidationData = {
      load: loadDetails,
      customer: {
        customerId: customerId || null,
        customerContactPerson,
      },
      asset: carrierIds,
      pickup: pickupLocationId,
      delivery: deliveryLocationId,
      document: {
        files,
      }
    };
    await validateLoadSchema(tabname, validateData[tabname as keyof LoadValidationData]);
  };

  const handleNext = async () => {
    try {
      setError(null);
      const currentIndex = tabs.indexOf(activeTab || "load");

      if (currentIndex < tabs.length - 1) {
        const tabname = tabs[currentIndex];
        await validateTabData(tabname); // Validate current tab data
        dispatch(setActiveTab(tabs[currentIndex + 1]));
      }
    } catch (error: any) {
      toast.error(error.message);
      setError(error.message);
    }
  };

  const handlePrevious = () => {
    const currentIndex = tabs.indexOf(activeTab || "load");
    if (currentIndex > 0) {
      dispatch(setActiveTab(tabs[currentIndex - 1]));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await Promise.all(tabs.map(validateTabData));
      const formData = new FormData();

      // Add files
      files.forEach((file: any) => {
        formData.append('loads', file);
      });
      // Prepare load data
      const loadData = {
        ...loadDetails,
        signature:signature,
        pnonumber, termsandconditions,
        customerId: customerId,
        carrierIds: carrierIds, customerContactPerson: customerContactPerson,
        pickupLocationId: pickupLocationId,
        deliveryLocationId: deliveryLocationId,
        AcceptTerms: AcceptTerms
      };
      formData.append("loadData", JSON.stringify(loadData))

      createLoadMutation.mutate(formData);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err.message || 'Failed to submit load.';
      toast.error(errorMsg);
      setError(errorMsg);
      console.warn('Error submitting load:', err);
    }
  };

  const handleTabChange = async (nextTab: string | null) => {
    if (nextTab) {
      try {
        setError(null);
        dispatch(setActiveTab(nextTab));
      } catch (error: any) {
        toast.error(error.message);
        setError(error.message);
      }
    }
  };

  useQuery({
    queryKey: ['validateCustomer', customerId, currentCompany],
    queryFn: async () => {
      if (!customerId) return null;
      const customerResponse = await apiService.getCustomer(customerId);
      if (customerResponse.data.companyId !== currentCompany) {
        dispatch(setCustomerInformation(null));
      }
      return null;
    },
    enabled: !!customerId && !!currentCompany
  });





  const currentStepIndex = tabs.indexOf(activeTab || "load");
  
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box component="form" className="loadForm" id="createLoadForm" onSubmit={handleSubmit}>
        {/* Progress Stepper and Main Content */}
        <Card 
          variant="outlined" 
          sx={{ 
            borderRadius: 3,
            bgcolor: alpha(theme.palette.background.paper, 0.8),
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            boxShadow: theme.shadows[2]
          }}
        >
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ display: 'flex', height: '100%' }}>
              {/* Vertical Stepper Sidebar */}
              <Box sx={{ 
                width: 280,
                borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                p: 3,
                bgcolor: alpha(theme.palette.background.paper, 0.3)
              }}>
                <Stepper activeStep={currentStepIndex} orientation="vertical">
                  {[
                    { label: 'Load Details', value: 'load', icon: <LocalShipping /> },
                    { label: 'Customer', value: 'customer', icon: <People /> },
                    { label: 'Carrier/Asset', value: 'asset', icon: <Business /> },
                    { label: 'Pickup', value: 'pickup', icon: <LocationOn />},
                    { label: 'Delivery', value: 'delivery', icon: <LocationOn />},
                    { label: 'Documents', value: 'document', icon: <AttachFile /> }
                  ].map((step, index) => (
                    <Step key={step.value}>
                      <StepLabel 
                        onClick={() => handleTabChange(step.value)}
                        sx={{ 
                          cursor: 'pointer',
                          '& .MuiStepLabel-label': {
                            fontSize: '0.875rem',
                            fontWeight: currentStepIndex >= index ? 600 : 400,
                            color: currentStepIndex >= index ? 'primary.main' : 'text.secondary',
                            mb: 0.5
                          },
                          '& .MuiStepLabel-text': {
                            display: 'block'
                          },
                          '& .MuiStepIcon-root': {
                            color: currentStepIndex >= index ? 'primary.main' : 'action.disabled',
                            '&.Mui-active': {
                              color: 'primary.main',
                              boxShadow: `0 0 0 6px ${alpha(theme.palette.primary.main, 0.12)}`
                            },
                            '&.Mui-completed': {
                              color: 'primary.main'
                            }
                          }
                        }}
                        icon={step.icon}
                      >
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'inherit', color: 'inherit' }}>
                            {step.label}
                          </Typography>
                        </Box>
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>
              
              {/* Main Content Area */}
              <Box sx={{ flex: 1, minHeight: 600 }}>
            {activeTab === "load" && (
              <Box className="tab-content-wrapper">
                <LoadDetails />
              </Box>
            )}
            {activeTab === "customer" && (
              <Box className="tab-content-wrapper">
                <CustomerInformation />
              </Box>
            )}
            {activeTab === "asset" && (
              <Box className="tab-content-wrapper">
                <Carrier />
              </Box>
            )}
            {activeTab === "pickup" && (
              <Box className="tab-content-wrapper">
                <Pickup />
              </Box>
            )}
            {activeTab === "delivery" && (
              <Box className="tab-content-wrapper">
                <Delivery />
              </Box>
            )}
            {activeTab === "document" && (
              <Box className="tab-content-wrapper">
               
                  {/* Document Upload Section */}
                  <DocumentUpload />
                </Box>
            )}
              </Box>
            </Box>
          </CardContent>
        </Card>
        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}
        {createLoadMutation.isSuccess && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
            Load created successfully!
          </Alert>
        )}

        {/* Action Buttons */}
        <Card 
          variant="outlined" 
          sx={{ 
            borderRadius: 3,
            bgcolor: alpha(theme.palette.background.paper, 0.8),
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            boxShadow: theme.shadows[2]
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<ArrowBackIcon />}
                onClick={() => {
                  if (window.confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
                    dispatch(resetLoad());
                    navigate(window.location.pathname)
                  }
                }}
                sx={{ 
                  borderRadius: 2, 
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 1.5,
                  px: 3
                }}
              >
                Cancel
              </Button>
              
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={handlePrevious}
                  disabled={activeTab === "load"}
                  sx={{ 
                    borderRadius: 2, 
                    textTransform: 'none',
                    fontWeight: 600,
                    py: 1.5,
                    px: 3
                  }}
                >
                  Previous
                </Button>
                <Button
                  variant="contained"
                  endIcon={activeTab === "document" ? <SaveIcon /> : <ArrowForwardIcon />}
                  onClick={activeTab === "document" ? handleSubmit : handleNext}
                  disabled={createLoadMutation.isPending}
                  startIcon={createLoadMutation.isPending ? <CircularProgress size={20} color="inherit" /> : null}
                  sx={{ 
                    borderRadius: 2, 
                    textTransform: 'none', 
                    fontWeight: 600,
                    minWidth: 120,
                    py: 1.5,
                    px: 3,
                    boxShadow: theme.shadows[4],
                    '&:hover': {
                      boxShadow: theme.shadows[6],
                      transform: 'translateY(-1px)'
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  {activeTab === "document" ? "Save Load" : createLoadMutation.isPending ? "Processing..." : "Next"}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};
export default withPermission("create", ["loads"])(CreateLoad)
