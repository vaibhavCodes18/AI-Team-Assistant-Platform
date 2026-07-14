import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LandingPage from "../pages/Landing/LandingPage.jsx";
import Register from "../pages/Register/Register.jsx";
import Login from "../pages/Login/Login.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import Profile from "../pages/profile/Profile.jsx";
import WorkspaceList from "../pages/workspace/WorkspaceList.jsx";
import WorkspaceDetails from "../pages/workspace/WorkspaceDetails.jsx";
import WorkspaceMembers from "../pages/workspace/WorkspaceMembers.jsx";
import WorkspaceProjects from "../pages/workspace/WorkspaceProjects.jsx";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/workspaces" 
          element={
            <ProtectedRoute>
              <WorkspaceList />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/workspaces/:id" 
          element={
            <ProtectedRoute>
              <WorkspaceDetails />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/workspaces/:id/members" 
          element={
            <ProtectedRoute>
              <WorkspaceMembers />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/workspaces/:id/projects" 
          element={
            <ProtectedRoute>
              <WorkspaceProjects />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;