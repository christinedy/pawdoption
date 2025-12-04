import { useState } from "react";
import axios from "axios";
import { API_URL } from "../config";
import { Link } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  
  // 1. Add state for messages
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email });
      // 2. Set success message instead of alert
      setSuccess("If the account exists, a reset link was sent to your email!");
    } catch (err) {
      // 3. Set error message
      setError("Error sending reset email. Please try again.");
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100">
      <div className="card auth-card p-5 shadow-lg" style={{ maxWidth: "500px", width: "100%" }}>
        <h2 className="form-title">Forgot Password</h2>
        <p className="text-muted text-center mb-4">Enter your email and we'll send you a link to reset your password.</p>
        
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
          <input
            type="email"
            className="form-control"
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-custom w-100 mt-3">Send reset link</button>
        </form>
        <div className="text-center mt-3">
             <Link to="/login" className="auth-link">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;