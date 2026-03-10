import React, { FormEvent, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Box, Button, Alert, Container, Stack, Stepper, Step, StepLabel, useTheme, alpha, CircularProgress, Typography, Card, CardContent } from "@mui/material";
import { LocalShipping, People, Business, LocationOn, AttachFile, Save as SaveIcon, ArrowBack as ArrowBackIcon, ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import LoadDetails from "./LoadDetails";
import Delivery from "./Delivery";
import Pickup from "./Pickup";
import {
  setActiveTab,
  resetLoad,
  initializeLoadData,
} from "@/redux/Slice/EditloadSlice";
import apiService from "@/service/apiService";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { paths } from "@/utils/paths";
import DocumentUpload from "./DocumentUpload";
import { tabs } from "@/data/Loads";
import { validateLoadSchema } from "../../Schema/loadSchema";
import { transformLoadData } from "@/utils/transformData";
import { LoadValidationData } from "@/redux/InitialData/Load";
import { RootState, AppDispatch } from "@/redux/store";
import CustomerInformation from "./CustomerInformation/Index";
import Carrier from "./Carrier/Index";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { withPermission } from "@/hooks/ProtectedRoute/authUtils";

const EditLoad: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loadId } = useParams<{ loadId: string }>();
  const queryClient = useQueryClient();
  const {
    activeTab,
    loadDetails,
    customerId,
    pickupLocationId,
    carrierIds,
    deliveryLocationId,
    customerContactPerson,
    files,
    pnonumber, termsandconditions,
    deletedfiles, signature,
    AcceptTerms
  } = useSelector((state: RootState) => state.editload);

  useQuery({
    queryKey: ['load', loadId],
    queryFn: async () => {
      if (loadId) {
        const response = await apiService.getLoad(loadId);
        const transformedData = transformLoadData(response.data);
        dispatch(initializeLoadData(transformedData));
        return response.data;
      }
      return null;
    },
    enabled: !!loadId,
  });

  const updateLoadMutation = useMutation({
    mutationFn: (formData: FormData) => apiService.updateLoad(loadId!, formData),
    onSuccess: () => {
      toast.success("Load updated successfully!");
      setTimeout(() => {
        navigate(paths.viewload);
      }, 1000);
    },
    onError: (err: any) => {
      const errorMsg = err?.response?.data?.message || err.message || "Failed to update load.";
      toast.error(errorMsg);
    },
  });

  const validateTabData = async (tabname: string): Promise<void> => {
    const validateData: LoadValidationData = {
      load: {
        ...loadDetails,
        declaredValue: loadDetails.declaredValue || 0,
        weight: loadDetails.weight || 0,
      },
      customer: {
        customerId: customerId || null,
        customerContactPerson,
      },
      asset: carrierIds,
      pickup: pickupLocationId,
      delivery: deliveryLocationId,
      document: {
        files,
      },
    };
    await validateLoadSchema(tabname, validateData[tabname as keyof LoadValidationData]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      await Promise.all(tabs.map(validateTabData));
      const formData = new FormData();

      // Add files
      files.forEach((file: InstanceType<typeof File | typeof Object>) => {
        let data = file as File || Object;
        if (data instanceof File) {
          formData.append("loads", data);
        }
      });
      // Prepare load data

      const loadData = {
        ...loadDetails,
        pnonumber,
        signature: signature,
        termsandconditions,
        declaredValue: loadDetails.declaredValue || 0,
        weight: loadDetails.weight || 0,
        customerId: customerId,
        carrierIds: carrierIds,
        customerContactPerson: customerContactPerson,
        pickupLocationId: pickupLocationId,
        deliveryLocationId: deliveryLocationId,
        deletedfiles: deletedfiles?.length ? deletedfiles : undefined,
        AcceptTerms: AcceptTerms
      };
      formData.append("loadData", JSON.stringify(loadData));

      updateLoadMutation.mutate(formData);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err.message || "Failed to update load.";
      toast.error(errorMsg);
    }
  };

  const handleTabChange = async (nextTab: string | null) => {
    try {
      dispatch(setActiveTab(nextTab));
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleNext = async () => {
    try {
      const currentIndex = tabs.indexOf(activeTab || "");

      if (currentIndex < tabs.length - 1) {
        const tabname = tabs[currentIndex];
        await validateTabData(tabname); // Validate current tab data
        dispatch(setActiveTab(tabs[currentIndex + 1]));
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (loadId) {
      dispatch(resetLoad()); // Reset state before fetching new data
    }
  }, [loadId]);

  const currentStepIndex = tabs.indexOf(activeTab || "load");

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box component="form" className="loadForm" id="editLoadForm" onSubmit={handleSubmit}>
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
        {updateLoadMutation.isError && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {updateLoadMutation.error.message}
          </Alert>
        )}
        {updateLoadMutation.isSuccess && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
            Load updated successfully!
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
                onClick={async () => {
                  if (window.confirm("Are you sure you want to cancel? All unsaved changes will be lost.")) {
                    queryClient.refetchQueries({ queryKey: ['load', loadId] });
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
                  onClick={() => {
                    const currentIndex = tabs.indexOf(activeTab || "");
                    if (currentIndex > 0) {
                      dispatch(setActiveTab(tabs[currentIndex - 1]));
                    }
                  }}
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
                  disabled={updateLoadMutation.isPending}
                  startIcon={updateLoadMutation.isPending ? <CircularProgress size={20} color="inherit" /> : null}
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
                  {activeTab === "document" ? "Update Load" : updateLoadMutation.isPending ? "Processing..." : "Next"}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default withPermission("update", ["loads"])(EditLoad);