import { createBrowserRouter } from "react-router-dom";

import Login from "../../features/auth/Login";
import Register from "../../features/auth/Register";
import Dashboard from "../../features/dashboard/Dashboard";
import Projects from "../../features/projects/Projects";
import Tasks from "../../features/tasks/Tasks";
import Settings from "../../features/settings/Settings";
import Applayout from "@/components/layout/Applayout";
import ProtectedRoute from "./ProtectedRoute";
import Home from "@/features/home/Home";

export const router = createBrowserRouter([
  {
    path:"/",
    element:<Home/>
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/app",
        element: <Applayout />,
        children: [
          {
            path: "dashboard",
            element: <Dashboard />,
          },
          {
            path: "projects",
            element: <Projects />,
          },
          {
            path: "tasks",
            element: <Tasks />,
          },
          {
            path: "settings",
            element: <Settings />,
          },
        ],
      },
    ],
  },
]);
