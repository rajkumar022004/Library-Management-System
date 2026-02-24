import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Logout() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    logout();
    // Redirect to login after showing message
    const timer = setTimeout(() => {
      navigate('/login');
    }, 2000);

    return () => clearTimeout(timer);
  }, [logout, navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontSize: '24px',
      textAlign: 'center',
      padding: '20px'
    }}>
      <div>
        <h2>You have successfully logged out.</h2>
        <p style={{ marginTop: '20px', fontSize: '16px' }}>Redirecting to login page...</p>
      </div>
    </div>
  );
}

export default Logout;