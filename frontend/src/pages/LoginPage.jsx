import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setAuthToken } from '../services/apiClient';
import { login, signup } from '../services/authService';

export default function LoginPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState('login');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyName2, setCompanyName2] = useState('');

  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');

    try {
      if (mode === 'login') {
        const data = await login({ email, password });
        localStorage.setItem('token', data.token);
        setAuthToken(data.token);
        nav('/dashboard');
      } else {
        const data = await signup({ name, email, password, companyName: companyName || companyName2 });
        localStorage.setItem('token', data.token);
        setAuthToken(data.token);
        nav('/dashboard');
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Auth failed');
    }
  }

  return (
    <div className="container" style={{ maxWidth: 520, paddingTop: 48 }}>
      <div className="text-center mb-4">
        <h2>AI Social Marketing Tool</h2>
        <div className="text-muted">Create flyers & reels and publish (simulation).</div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex gap-2 mb-3">
            <button className={`btn ${mode === 'login' ? 'btn-primary' : 'btn-outline-primary'} w-50`} onClick={() => setMode('login')}>
              Login
            </button>
            <button className={`btn ${mode === 'signup' ? 'btn-primary' : 'btn-outline-primary'} w-50`} onClick={() => setMode('signup')}>
              Signup
            </button>
          </div>

          <form onSubmit={onSubmit}>
            {mode === 'signup' ? (
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
            ) : null}

            <div className="mb-3">
              <label className="form-label">Email</label>
              <input className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            {mode === 'signup' ? (
              <div className="mb-3">
                <label className="form-label">Company Name</label>
                <input className="form-control" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              </div>
            ) : null}

            {error ? <div className="alert alert-danger">{error}</div> : null}

            <button className="btn btn-success w-100" type="submit">
              {mode === 'login' ? 'Login' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

