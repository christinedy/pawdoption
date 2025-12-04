import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

import authImage from "../assets/PAWdoption.png"; 

function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); 
  
  // 1. New state to handle error messages
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null); // Clear any previous errors when trying again

    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      // 2. Instead of alert(), we set the state
      setError(err.response?.data?.message || "Invalid email or password");
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100">
      <div className="card auth-card w-100" style={{ maxWidth: "900px" }}>
        <div className="row g-0">

          <div className="col-md-6 auth-form-container">
            <h2 className="form-title">Login</h2>

            {/* 3. Display the error here if it exists */}
            {error && (
              <div className="alert alert-danger text-center p-2 mb-3" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <input
                type="email"
                className="form-control"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <div className="password-wrapper mb-3">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control mb-0"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`bi ${showPassword ? "bi-eye" : "bi-eye-slash"}`}></i>
                </button>
              </div>
                
              <div className="d-flex justify-content-end mb-3">
                 <Link to="/forgot-password" className="auth-link">Forgot Password?</Link>
              </div>

              <button type="submit" className="btn btn-custom w-100 mb-3">
                Log In
              </button>
            </form>

            <div className="text-center mt-2">
              <span className="text-muted small">Don't have an account? </span>
              <Link to="/register" className="auth-link">Sign up</Link>
            </div>
          </div>


          <div className="col-md-6 illustration-side d-none d-md-flex">

            <img 
              src={authImage} 
              alt="Login Illustration" 
              className="illustration-img" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;