import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./components/ui/Toast";
import DebugApiPopup from "./components/ui/DebugApiPopup";
import DemoModeBanner from "./components/ui/DemoModeBanner";
import SOSAiWidget from "./components/ui/SOSAiWidget";
import AppRouter from "./routes/AppRouter";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRouter />
          <SOSAiWidget />
          <DebugApiPopup />
          <DemoModeBanner />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
