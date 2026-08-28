import { BrowserRouter, Navigate, Route, Routes,} from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { EventDetailsPage } from "./pages/EventDetailsPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { MyTicketsPage } from "./pages/MyTicketsPage";
import { SharedTicketPage } from "./pages/SharedTicketPage";
import { GatePage } from "./pages/GatePage";
import { OrganizerPage } from "./pages/OrganizerPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route path="/login" element={<LoginPage />} />

          <Route 
          path="/events/:id" 
          element={<EventDetailsPage />} />

          <Route 
          path="/tickets" 
          element={<MyTicketsPage />} />

          <Route
            path="/organizer"
            element={<OrganizerPage />}
          />

          <Route
            path="/gate"
            element={<GatePage />}
          />

          <Route path="*" element={<Navigate to="/" replace />} />

          <Route 
          path="/checkout/:id" 
          element={<CheckoutPage />} />

          <Route
          path="/shared/:token"
          element={<SharedTicketPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;