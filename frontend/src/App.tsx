import {
  Suspense,
  lazy,
} from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthProvider";
import { LoadingState } from "./components/ui/LoadingState";

const HomePage = lazy(() =>
  import("./pages/HomePage").then((module) => ({
    default: module.HomePage,
  })),
);

const LoginPage = lazy(() =>
  import("./pages/LoginPage").then((module) => ({
    default: module.LoginPage,
  })),
);

const EventDetailsPage = lazy(() =>
  import("./pages/EventDetailsPage").then((module) => ({
    default: module.EventDetailsPage,
  })),
);

const CheckoutPage = lazy(() =>
  import("./pages/CheckoutPage").then((module) => ({
    default: module.CheckoutPage,
  })),
);

const MyTicketsPage = lazy(() =>
  import("./pages/MyTicketsPage").then((module) => ({
    default: module.MyTicketsPage,
  })),
);

const SharedTicketPage = lazy(() =>
  import("./pages/SharedTicketPage").then((module) => ({
    default: module.SharedTicketPage,
  })),
);

const GatePage = lazy(() =>
  import("./pages/GatePage").then((module) => ({
    default: module.GatePage,
  })),
);

const OrganizerPage = lazy(() =>
  import("./pages/OrganizerPage").then((module) => ({
    default: module.OrganizerPage,
  })),
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense
          fallback={
            <main className="route-loading">
              <LoadingState
                title="ELITE / TICKETS"
                message="Carregando página..."
              />
            </main>
          }
        >
          <Routes>
            <Route
              path="/"
              element={<HomePage />}
            />

            <Route
              path="/login"
              element={<LoginPage />}
            />

            <Route
              path="/events/:id"
              element={<EventDetailsPage />}
            />

            <Route
              path="/checkout/:id"
              element={<CheckoutPage />}
            />

            <Route
              path="/tickets"
              element={<MyTicketsPage />}
            />

            <Route
              path="/shared/:token"
              element={<SharedTicketPage />}
            />

            <Route
              path="/organizer"
              element={<OrganizerPage />}
            />

            <Route
              path="/gate"
              element={<GatePage />}
            />

            <Route
              path="*"
              element={<Navigate to="/" replace />}
            />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;