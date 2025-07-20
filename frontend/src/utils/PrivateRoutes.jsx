import { Outlet, Navigate } from "react-router-dom";
import { UseAuth } from "../contexts/AuthContext.jsx";

const PrivateRoutes = () => {
  const { user } = UseAuth();

  return user ? <Outlet /> : <Navigate to="/" />;
};

export default PrivateRoutes;
