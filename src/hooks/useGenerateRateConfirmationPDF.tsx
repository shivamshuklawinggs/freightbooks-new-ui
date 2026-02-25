import { useMutation } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { validateLoadSchema } from "@/pages/load-service/Schema/loadSchema";
import apiService from "@/service/apiService";
import { toast } from "react-toastify";
import { downloadBase64File } from "@/utils";

interface UseGenerateRateConfirmationPDF {
  type: "load" | "editload";
}

export const useGenerateRateConfirmationPDF = ({ type }: UseGenerateRateConfirmationPDF) => {
  const {
    loadDetails,
    customerId,
    pickupLocationId,
    carrierIds,
    deliveryLocationId,
    customerContactPerson,
    pnonumber,
    termsandconditions,
  } = useSelector((state: RootState) => state[type]);

  // --- Validation helper ---
  const validateTabData = async (): Promise<void> => {
    const validateData = {
      load: loadDetails,
      asset: carrierIds,
      pickup: pickupLocationId,
      delivery: deliveryLocationId,
    };
    await validateLoadSchema("load", validateData["load"]);
    await validateLoadSchema("asset", validateData["asset"]);
    await validateLoadSchema("pickup", validateData["pickup"]);
    await validateLoadSchema("delivery", validateData["delivery"]);
  };

  // --- Mutation with toast feedback ---
  const mutation = useMutation({
    mutationFn: async (id?: string | null) => {
      const loadData = {
        ...loadDetails,
        pnonumber,
        termsandconditions,
        customerId: customerId,
        carrierIds,
        customerContactPerson,
        pickupLocationId,
        deliveryLocationId,
      };

      if (!id) {
        await validateTabData();
        const response = await apiService.generaterateConfirmationPDF(loadData);
        return response.data;
      } else {
        const response = await apiService.getRateConfirmation(id);
        return response.data;
      }
    },

    onMutate: () => {
      toast.dismiss();
      toast.loading("Generating Rate Confirmation PDF...", {
        toastId: "pdf-loading",
        autoClose: false,
      });
    },

   onSuccess: (data) => {
  toast.dismiss("pdf-loading");

  try {
    // Convert & download the PDF
    // const pdfUrl = downloadBase64File(data, "rate-confirmation.pdf");

    // Show success toast with Open + Download options
    toast.success(
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <strong>✅ PDF Generated Successfully!</strong>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => downloadBase64File(data, "rate-confirmation.pdf")}
            style={{
              background: "#2563eb",
              color: "#fff",
              padding: "4px 8px",
              borderRadius: "4px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Download PDF
          </button>

          {/* <button
            onClick={() => window.open(pdfUrl, "_blank")}
            style={{
              background: "#10b981",
              color: "#fff",
              padding: "4px 8px",
              borderRadius: "4px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Open PDF
          </button> */}
        </div>
      </div>,
      {
        autoClose: 8000,
        closeOnClick: false,
        pauseOnHover: true,
      }
    );
  } catch (error) {
    toast.error("❌ Failed to download PDF");
    console.error(error);
  }
},

    onError: (error: any) => {
      toast.dismiss("pdf-loading");
      toast.error(error?.message || "❌ Failed to generate PDF");
      console.error("Error generating PDF:", error);
    },

    onSettled: () => {
      toast.dismiss("pdf-loading");
    },
  });

  // ✅ Wrapper to call mutate safely
  const generatePDF = (id?: string | null) => mutation.mutate(id ?? null);

  return {
    generatePDF,
    generatePDFAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
};
