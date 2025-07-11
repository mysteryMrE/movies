import { createContext, useState, useEffect, useContext, useRef } from "react";
import { account } from "../appwrite.js";
import { useNavigate } from "react-router-dom";
import { ID } from "appwrite";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [jwt, setJwt] = useState(null);
  const [authError, setAuthError] = useState(null);
  const jwtRefreshInterval = useRef(null);

  useEffect(() => {
    checkUserStatus();
  }, []);

  useEffect(() => {
    if (user) {
      generateJwt();
      if (jwtRefreshInterval.current) clearInterval(jwtRefreshInterval.current);
      jwtRefreshInterval.current = setInterval(() => {
        generateJwt();
      }, 10 * 60 * 1000);
    } else {
      if (jwtRefreshInterval.current) clearInterval(jwtRefreshInterval.current);
    }
    return () => {
      if (jwtRefreshInterval.current) clearInterval(jwtRefreshInterval.current);
    };
  }, [user]);

  const loginUser = async (userInfo) => {
    setLoading(true);
    setAuthError(null);

    console.log("userInfo", userInfo);

    try {
      let response = await account.createEmailPasswordSession(
        userInfo.email,
        userInfo.password
      );
      let accountDetails = await account.get();
      await generateJwt();
      setUser(accountDetails);
      navigate("/");
    } catch (error) {
      console.error(error);
      setAuthError(error.message || "Login failed. Please check your credentials.");
    }
    setLoading(false);
  };

  const logoutUser = async () => {
    await account.deleteSession("current");
    setUser(null);
    setJwt(null);
  };

  const registerUser = async (userInfo) => {
    setLoading(true);
    setAuthError(null);

    try {
      let response = await account.create(
        ID.unique(),
        userInfo.email,
        userInfo.password1,
        userInfo.name
      );

      await account.createEmailPasswordSession(
        userInfo.email,
        userInfo.password1
      );
      let accountDetails = await account.get();
      await generateJwt();
      setUser(accountDetails);
      navigate("/");
    } catch (error) {
      console.error(error);
      setAuthError(error.message || "Registration failed. Please try again.");
    }

    setLoading(false);
  };

  const checkUserStatus = async () => {
    try {
      let accountDetails = await account.get();
      setUser(accountDetails);
    } catch (error) {}
    setLoading(false);
  };
  const generateJwt = async () => {
    try {
      const jwtResponse = await account.createJWT();
      setJwt(jwtResponse.jwt);
      console.log("new jwt ", jwtResponse.jwt);
    } catch (error) {
      setJwt(null);
      console.error("JWT generation failed:", error);
    }
  };

  const contextData = {
    user,
    jwt,
    loading,
    authError,
    setAuthError,
    loginUser,
    logoutUser,
    registerUser,
  };

  return (
    <AuthContext.Provider value={contextData}>
      {/*loading ? <p>Loading...</p> : children*/}
      {children}
    </AuthContext.Provider>
  );
};

//Custom Hook
const UseAuth = () => {
  return useContext(AuthContext);
};
export { UseAuth, AuthProvider };
