import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user, logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
      <div className="container">
        <Link className="navbar-brand fw-bold text-primary" to="/">
          <i className="bi bi-paw-fill me-2"></i>PAWdoption
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav" 
          aria-controls="navbarNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/#">About Us</Link>
            </li>

            {/* only show when user logs in*/}
            {user && (
              <li className="nav-item">
                <Link className="nav-link" to="/dashboard">
                  <i className="bi me-1"></i>My Dashboard
                </Link>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center">
            
            {user ? (
              <div className="d-flex align-items-center gap-3">
                <div className="text-end d-none d-md-block">
                  <span className="d-block small text-muted">Signed in as</span>
                  <span className="fw-semibold text-dark">{user.fullname}</span>
                </div>

                <button 
                    onClick={handleLogout} 
                    className="btn btn-outline-danger btn-sm"
                >
                    Logout
                </button>
              </div>
            ) : (

              <div className="d-flex gap-2">
                <Link to="/login" className="btn btn-link text-decoration-none text-dark">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary px-4">
                  Register
                </Link>
              </div>
            )}

          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;