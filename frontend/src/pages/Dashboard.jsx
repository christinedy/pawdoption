import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ChevronDown, Trash2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('applications');
  const [adopter, setAdopter] = useState(null);
  const [applications, setApplications] = useState([]);
  const [adoptionHistory, setAdoptionHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = user.token;
      const { data } = await axios.get('http://localhost:5000/api/adopter/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAdopter(data.adopter);
      setApplications(data.applications);
      setAdoptionHistory(data.adoptionHistory);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      if (err.response?.status === 401) {
        logoutUser();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteApplication = async (appId) => {
    if (!window.confirm('Are you sure you want to delete this application?')) return;

    try {
      const token = user.token;
      await axios.delete(`http://localhost:5000/api/adopter/applications/${appId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete application');
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending': return 'status pending';
      case 'approved': return 'status approved';
      case 'rejected': return 'status rejected';
      default: return 'status default';
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  if (loading) return <div className="dashboard-container"><p>Loading...</p></div>;
  if (error) return <div className="dashboard-container"><p>{error}</p><button onClick={fetchDashboardData}>Retry</button></div>;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>PAWdoption</h1>
        <div style={{ position: 'relative' }}>
          <button className="user-btn" onClick={() => setIsOpen(!isOpen)}>
            <User size={20} /> {adopter?.name} <ChevronDown size={16} />
          </button>
          {isOpen && (
            <div className="dropdown">
              <button onClick={() => navigate('/')}>Home</button>
              <button className="logout" onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </header>

      <div className="dashboard-content">
        <div className="welcome-card">
          <h3>Welcome back, {adopter?.name}!</h3>
          <p>Member since {new Date(adopter?.joinDate).toLocaleDateString()}</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <p>Applications</p>
            <h3>{applications.length}</h3>
          </div>
          <div className="stat-card">
            <p>Approved</p>
            <h3>{applications.filter(a => a.status === 'approved').length}</h3>
          </div>
          <div className="stat-card">
            <p>Adopted</p>
            <h3>{adoptionHistory.length}</h3>
          </div>
        </div>

        <div className="tabs">
          <div className={`tab ${activeTab === 'applications' ? 'active' : ''}`} onClick={() => setActiveTab('applications')}>
            My Applications
          </div>
          <div className={`tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
            Adoption History
          </div>
        </div>

        <div className="tab-content">
          {activeTab === 'applications' && (
            <div>
              {applications.length === 0 ? (
                <p className="empty-message">No applications yet.</p>
              ) : (
                applications.map(app => (
                  <div key={app.id} className="application-card">
                    <div>
                      <h3>{app.petName}</h3>
                      <p>{app.breed}</p>
                      <div className={getStatusClass(app.status)}>{app.status}</div>
                      <small>Applied: {new Date(app.appliedDate).toLocaleDateString()}</small>
                    </div>
                    {app.status === 'pending' && (
                      <button className="btn-delete" onClick={() => handleDeleteApplication(app.id)}>
                        <Trash2 size={16} /> Delete
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              {adoptionHistory.length === 0 ? (
                <p className="empty-message">No adoption history yet</p>
              ) : (
                adoptionHistory.map(hist => (
                  <div key={hist.id} className="application-card">
                    <div>
                      <h3>{hist.petName}</h3>
                      <p>{hist.breed}</p>
                      <div className="status approved">{hist.status}</div>
                      <small>Adopted: {new Date(hist.adoptedDate).toLocaleDateString()}</small>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
