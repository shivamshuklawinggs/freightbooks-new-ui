import React, { useState, FormEvent } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Box, Paper, Button, Alert, Container, Stack, Stepper, Step, StepLabel, Typography } from "@mui/material";
import { AppDispatch, RootState } from "@/redux/store";
import LoadDetails from "./LoadDetails";
import Carrier from "./Carrier/Index";
import Delivery from "./Delivery";
import { setActiveTab, resetLoad, setCustomerInformation, setSignature } from "@/redux/Slice/loadSlice";
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
import { ArrowBack as ArrowBackIcon, ArrowForward as ArrowForwardIcon, Save as SaveIcon } from '@mui/icons-material';
import SignatureBox from "@/components/SignatureBox";

const CreateLoad: React.FC = () => {
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
        {/* Progress Stepper */}
        <Paper sx={{ p: 1, mb:1, borderRadius: 2, bgcolor: 'background.paper' }}>
          <Stepper activeStep={currentStepIndex} alternativeLabel sx={{ mb: 1 }}>
            {[
              { label: 'Load Details', value: 'load' },
              { label: 'Customer', value: 'customer' },
              { label: 'Carrier/Asset', value: 'asset' },
              { label: 'Pickup', value: 'pickup' },
              { label: 'Delivery', value: 'delivery' },
              { label: 'Documents', value: 'document' }
            ].map((step, index) => (
              <Step key={step.value}>
                <StepLabel 
                  onClick={() => handleTabChange(step.value)}
                  sx={{ 
                    cursor: 'pointer',
                    '& .MuiStepLabel-label': {
                      fontSize: '0.875rem',
                      fontWeight: currentStepIndex >= index ? 600 : 400
                    }
                  }}
                >
                  {step.label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Main Content */}
        <Paper sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Box sx={{ p: 4 }}>
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
              <Box
                className="tab-content-wrapper"
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                  p: 2,
                  width: "100%",
                }}
              >
                {/* Document Upload Section */}
                <DocumentUpload />

                {/* Signature Section (Right Aligned) */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "flex-end",
                    mt: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: "100%", sm: "70%", md: "50%", lg: "40%" },
                      maxWidth: 500,
                    }}
                  >
                    <SignatureBox title="Authorized Signature" defaultSignature={signature} onSave={(dataURl)=>{
                                          dispatch(setSignature(dataURl))
                                        }} />
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        </Paper>
       {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
      {createLoadMutation.isSuccess && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>Load created successfully!</Alert>}

        {/* Action Buttons */}
        <Paper sx={{ p: 3, mt: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Cancel
            </Button>
            
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={handlePrevious}
                disabled={activeTab === "load"}
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                Previous
              </Button>
              <Button
                variant="contained"
                endIcon={activeTab === "document" ? <SaveIcon /> : <ArrowForwardIcon />}
                onClick={activeTab === "document" ? handleSubmit : handleNext}
                disabled={createLoadMutation.isPending}
                sx={{ borderRadius: 2, textTransform: 'none', minWidth: 120 }}
              >
                {activeTab === "document" ? "Save Load" : createLoadMutation.isPending ? "Processing..." : "Next"}
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Box>
    
    </Container>
  );
};
export default withPermission("create", ["loads"])(CreateLoad)
