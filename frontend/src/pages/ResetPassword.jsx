import { useState } from "react";
import axios from "axios";
import { API_URL } from "../config";
import { validatePassword } from "../utils/validatePassword";
import { useParams, useNavigate } from "react-router-dom";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // 1. Add state for messages
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate new password
    const message = validatePassword(password);
    if (message) {
      // 2. Show validation error in the UI, not alert
      setError(message);
      return;
    }

    try {
      await axios.post(`${API_URL}/auth/reset-password/${token}`, { password });
      
      // 3. Show success and wait 2 seconds before redirecting
      setSuccess("Password updated! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      
    } catch (err) {
      setError("Failed to update password. Link might be expired.");
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100">
      <div className="card auth-card p-5 shadow-lg" style={{ maxWidth: "500px", width: "100%" }}>
        <h2 className="form-title">Reset Password</h2>

        {/* 4. Display messages here */}
        {error && (
          <div className="alert alert-danger text-center p-2" role="alert">
            {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success text-center p-2" role="alert">
            {success}
          </div>
        )}

        <form onSubmit={submit}>
          <div className="password-wrapper mb-3">
            <input
              type={showPassword ? "text" : "password"}
              className="form-control mb-0"
              placeholder="New Password"
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

          <p className="text-muted small">
            Password must contain:
            <br />• 6+ characters  
            <br />• 1 uppercase letter  
            <br />• 1 number  
          </p>

          <button type="submit" className="btn btn-custom w-100 mt-2">
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;