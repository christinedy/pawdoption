import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const API_URL = "http://localhost:5000/api/auth";

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (userInfo) setUser(userInfo);
  }, []);

  // REGISTER USER
  const registerUser = async (fullname, email, phone, address, password) => {
    try {
      const { data } = await axios.post(`${API_URL}/register`, {
        fullname,
        email,
        phone,
        address,
        password,
      });

      localStorage.setItem("userInfo", JSON.stringify(data));
      setUser(data);

      return data;
    } catch (error) {
      throw error;
    }
  };

  // LOGIN USER
  const login = async (email, password) => {
    try {
      const { data } = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });

      localStorage.setItem("userInfo", JSON.stringify(data));
      setUser(data);

      return data;
    } catch (error) {
      throw error;
    }
  };

  // LOGOUT
  const logoutUser = () => {
    localStorage.removeItem("userInfo");
    setUser(null);
  };

  // FORGOT PASSWORD
  const forgotPassword = async (email) => {
    try {
      const { data } = await axios.post(`${API_URL}/forgot-password`, { email });
      return data; 
    } catch (error) {
      throw error;
    }
  };

  // RESET PASSWORD
  const resetPassword = async (token, password) => {
    try {
      const { data } = await axios.post(`${API_URL}/reset-password/${token}`, {
        password,
      });
      return data; 
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        registerUser,
        login,
        logoutUser,
        forgotPassword, 
        resetPassword,  
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};