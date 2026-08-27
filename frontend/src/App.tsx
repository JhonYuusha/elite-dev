import { BrowserRouter, Navigate, Route, Routes,} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { EventDetailsPage } from "./pages/EventDetailsPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { MyTicketsPage } from "./pages/MyTicketsPage";
import { SharedTicketPage } from "./pages/SharedTicketPage";
import { GatePage } from "./pages/GatePage";

function Placeholder({ title }: { title: string }) {
  return (
    <main>
      <h1>{title}</h1>
    </main>
  );
}

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
            element={<Placeholder title="Painel do organizador" />}
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