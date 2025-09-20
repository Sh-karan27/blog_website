import { toast } from "react-toastify";

// Error toast
export const showErrorToast = (message: string) => {
  toast.error(message, {
    style: {
      backgroundColor: "#f44336", // Red
      color: "#fff",
      fontWeight: "bold",
      borderRadius: "8px",
    },
    closeButton: true,
  });
};

// Success toast
export const showSuccessToast = (message: string) => {
  toast.success(message, {
    style: {
      backgroundColor: "#232429", // Green
      color: "#fff",
      fontWeight: "bold",
      borderRadius: "8px",
    },
    closeButton: true,
  });
};
