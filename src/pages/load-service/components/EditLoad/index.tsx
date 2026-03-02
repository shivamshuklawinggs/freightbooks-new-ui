import React, { FormEvent, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Box, Paper, Button, Alert, Container, Stack, Stepper, Step, StepLabel } from "@mui/material";
import LoadDetails from "./LoadDetails";
import Delivery from "./Delivery";
import Pickup from "./Pickup";
import {
  setActiveTab,
  resetLoad,
  initializeLoadData,
  setSignature,
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
import { ArrowBack as ArrowBackIcon, ArrowForward as ArrowForwardIcon, Save as SaveIcon } from '@mui/icons-material';
import SignatureBox from "@/components/SignatureBox";

const EditLoad: React.FC = () => {
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
      // if(signature){
      //   formData.append("signature",signature)
      // }
      // Prepare load data

      const loadData = {
        ...loadDetails,
        pnonumber,
        signature:signature,
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
        {/* Progress Stepper */}
        <Paper sx={{ p: 1, mb: 1, borderRadius: 2, bgcolor: 'background.paper' }}>
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
           {updateLoadMutation.isError && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{updateLoadMutation.error.message}</Alert>}
      {updateLoadMutation.isSuccess && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>Load updated successfully!</Alert>}
        {/* Action Buttons */}
        <Paper sx={{ p: 3, mt: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<ArrowBackIcon />}
              onClick={async () => {
                if (window.confirm("Are you sure you want to cancel? All unsaved changes will be lost.")) {
                  queryClient.refetchQueries({ queryKey: ['load', loadId] });
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
                onClick={() => {
                  const currentIndex = tabs.indexOf(activeTab || "");
                  if (currentIndex > 0) {
                    dispatch(setActiveTab(tabs[currentIndex - 1]));
                  }
                }}
                disabled={activeTab === "load"}
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                Previous
              </Button>
              <Button
                variant="contained"
                endIcon={activeTab === "document" ? <SaveIcon /> : <ArrowForwardIcon />}
                onClick={activeTab === "document" ? handleSubmit : handleNext}
                disabled={updateLoadMutation.isPending}
                sx={{ borderRadius: 2, textTransform: 'none', minWidth: 120 }}
              >
                {activeTab === "document" ? "Update Load" : updateLoadMutation.isPending ? "Processing..." : "Next"}
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Box>
    
    </Container>
  );
};

export default withPermission("update", ["loads"])(EditLoad);