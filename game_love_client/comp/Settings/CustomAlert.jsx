// comp/Settings/CustomAlert.jsx

import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

export default function CustomAlert({
  open,
  onClose,
  message,
  type = "info", // info / error
}) {
  const colors = {
    info: {
      bg: "#E3F2FD",
      border: "#64B5F6",
    },
    error: {
      bg: "#FFEBEE",
      border: "#EF5350",
    },
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={3500}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert
        onClose={onClose}
        variant="filled"
        severity={type}
        sx={{
          backgroundColor: colors[type].bg,
          border: `2px solid ${colors[type].border}`,
          color: "#000",
          borderRadius: 3,
          fontSize: "1.1rem",
          padding: "10px 16px",
          boxShadow: 3,
          width: "100%",
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
