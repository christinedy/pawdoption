import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { validatePassword } from "../utils/validatePassword";
import authImage from "../assets/PAWdoption.png";

function Register() {
  const { registerUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // 1. Add state for Error and Success messages
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const submitRegister = async (e) => {
    e.preventDefault();
    
    // Clear previous messages
    setError(null);
    setSuccess(null);

    // Password strength validation
    const message = validatePassword(password);
    if (message) {
      // 2. Replace alert with setError
      setError(message);
      return;
    }

    try {
      await registerUser(fullname, email, phone, address, password);
      
      // 3. Show success message and redirect after a short delay
      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/");
      }, 2000); // Wait 2 seconds so they can read the message

    } catch (err) {
      // 4. Handle API errors
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100">
      <div className="card auth-card w-100" style={{ maxWidth: "900px" }}>
        <div className="row g-0">
          
          {/* Form Side */}
          <div className="col-md-6 auth-form-container">
            <h2 className="form-title">Create Account</h2>

            {/* 5. Display Error Message */}
            {error && (
              <div className="alert alert-danger text-center p-2 mb-3" role="alert">
                {error}
              </div>
            )}

            {/* 6. Display Success Message */}
            {success && (
              <div className="alert alert-success text-center p-2 mb-3" role="alert">
                {success}
              </div>
            )}

            <form onSubmit={submitRegister}>
              <input
                type="text"
                className="form-control"
                placeholder="Full Name"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                required
              />

              <input
                type="email"
                className="form-control mt-3"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                type="text"
                className="form-control mt-3"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />

              <input
                type="text"
                className="form-control mt-3"
                placeholder="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />

              {/* Password */}
              <div className="password-wrapper mt-3 mb-1">
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

              <p className="text-muted small">
                Password must contain:  
                <br />• 6+ characters  
                <br />• 1 uppercase letter  
                <br />• 1 number  
              </p>

              <button type="submit" className="btn btn-custom w-100 mt-2">
                Register
              </button>
            </form>

            <div className="text-center mt-3">
              <span className="text-muted small">Already have an account? </span>
              <Link to="/login" className="auth-link">Login</Link>
            </div>
          </div>

          {/* Illustration Side */}
          <div className="col-md-6 illustration-side d-none d-md-flex">
            <img 
              src={authImage} 
              alt="Register Illustration" 
              className="illustration-img" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;