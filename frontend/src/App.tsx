import React from "react";

import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import EventRecordPage from "./pages/EventRecordPage";
import DashboardPage from "./pages/DashboardPage";
import Login from "./Login";

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
    path: "/event-record",
    element: <EventRecordPage />,
  },
  {
    path: "/dashboard",
    element: <DashboardPage />,
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
