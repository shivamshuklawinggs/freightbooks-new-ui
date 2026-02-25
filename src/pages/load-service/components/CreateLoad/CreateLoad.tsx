import React, { useState, FormEvent } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Tabs, Tab, Box, Paper, Button, Alert, Container, Stack, Divider } from "@mui/material";
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





  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {createLoadMutation.isSuccess && <Alert severity="success" sx={{ mb: 2 }}>Load created successfully!</Alert>}

      <Box component="form" className="loadForm" id="createLoadForm" onSubmit={handleSubmit}>
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={activeTab || "load"}
            onChange={(_, newValue) => handleTabChange(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              '& .MuiTab-root': { textTransform: 'none' }
            }}
          >
            <Tab label="Load Details" value="load" />
            <Tab label="Customer Information" value="customer" />
            <Tab label="Carrier/Asset Information" value="asset" />
            <Tab label="Pickup Information" value="pickup" />
            <Tab label="Delivery Information" value="delivery" />
            <Tab label="Upload Document" value="document" />
          </Tabs>

          <Box sx={{ p: 3 }}>
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

        <Divider sx={{ my: 3 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Box>
            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                if (window.confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
                  dispatch(resetLoad());
                  navigate(window.location.pathname)
                }
              }}
            >
              Cancel
            </Button>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              onClick={handlePrevious}
              disabled={activeTab === "load"}
            >
              Previous
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={activeTab === "document" ? handleSubmit : handleNext}
            >
              {activeTab === "document" ? "Save" : createLoadMutation.isPending ? "Saving..." : "Next"}

            </Button>

          </Stack>
        </Box>
      </Box>
    </Container>
  );
};
export default withPermission("create", ["loads"])(CreateLoad)
