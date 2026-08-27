import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { LoginPage } from "./pages/LoginPage";

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
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={<Placeholder title="Eventos em cartaz" />}
          />

          <Route
            path="/organizer"
            element={<Placeholder title="Painel do organizador" />}
          />

          <Route
            path="/gate"
            element={<Placeholder title="Portaria" />}
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;