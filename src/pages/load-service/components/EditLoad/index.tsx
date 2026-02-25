import React, { FormEvent, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Tabs, Tab, Box, Paper, Button, Alert, Container, Stack, Divider } from "@mui/material";
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





  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {updateLoadMutation.isError && <Alert severity="error" sx={{ mb: 2 }}>{updateLoadMutation.error.message}</Alert>}
      {updateLoadMutation.isSuccess && <Alert severity="success" sx={{ mb: 2 }}>Load updated successfully!</Alert>}

      <Box component="form" className="loadForm" id="editLoadForm" onSubmit={handleSubmit}>
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={activeTab || "load"}
            onChange={(_, newValue) => handleTabChange(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              "& .MuiTab-root": { textTransform: "none" },
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
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
          <Box>
            <Button
              variant="outlined"
              color="error"
              onClick={async () => {
                if (window.confirm("Are you sure you want to cancel? All unsaved changes will be lost.")) {
                  queryClient.refetchQueries({ queryKey: ['load', loadId] });
                }
              }}
            >
              Cancel
            </Button>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              onClick={() => {
                const currentIndex = tabs.indexOf(activeTab || "");
                if (currentIndex > 0) {
                  dispatch(setActiveTab(tabs[currentIndex - 1]));
                }
              }}
              disabled={activeTab === "load"}
            >
              Previous
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={activeTab === "document" ? handleSubmit : handleNext}
            >
              {activeTab === "document" ? "Save" : updateLoadMutation.isPending ? "Saving..." : "Next"}
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={updateLoadMutation.isPending}
            >
              {updateLoadMutation.isPending ? "Saving..." : "Save"}
            </Button>

          </Stack>
        </Box>
      </Box>
    </Container>
  );
};

export default withPermission("update", ["loads"])(EditLoad);