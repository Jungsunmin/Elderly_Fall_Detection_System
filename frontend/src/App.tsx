import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import EventRecordPage from "./pages/EventRecordPage";
import DashboardPage from "./pages/DashboardPage";
import Login from "./Login";
import AppLayout from "./components/AppLayout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/login/oauth2/code/google",
    element: <Login />,
  },
  {
    element: <AppLayout />,
    children: [
      {
        path: "/dashboard",
        element: <DashboardPage />,
      },
      {
        path: "/event-record",
        element: <EventRecordPage />,
      },
    ]
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
