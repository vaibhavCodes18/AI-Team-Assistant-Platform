import toast from "react-hot-toast";
import { logoutUser } from "../api/authApi";
import { useNavigate } from "react-router-dom";

export const handleLogout = async () => {
    const navigate = useNavigate();
    try {
      const logoutRes = await logoutUser();
      toast.success(logoutRes?.msg || 'Logged out successfully');
    } catch (error) {
      console.error('Logout API failed:', error);
    } finally {
      localStorage.removeItem('accessToken');
      navigate('/login');
    }
  };