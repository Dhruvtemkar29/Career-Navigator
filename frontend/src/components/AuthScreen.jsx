
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Compass,
  Mail,
  Lock,
  UserRound,
  Eye,
  EyeOff,
  ArrowRight,
  BrainCircuit
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AuthScreen.css';

export default function AuthScreen() {
  const { login, register } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isLogin && fullName.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    setSubmitting(true);

    try {
      if (isLogin) {
        await login(email.trim().toLowerCase(), password);
      } else {
        await register(fullName.trim(), email.trim().toLowerCase(), password);
      }
    } catch (err) {
      const status = err.response?.status;

      if (status === 401) {
        setError('Invalid email or password.');
      } else if (status === 409) {
        setError('An account with this email already exists.');
      } else if (status === 422) {
        setError('Please check your details and try again.');
      } else if (!err.response) {
        setError('Unable to connect to the server. Please try again.');
      } else {
        setError(err.response?.data?.detail || 'Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setPassword('');
  };

  return (
    <div className="auth-page">
      <motion.div
        className="auth-brand"
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="auth-brand-icon">
          <Compass size={24} />
        </div>
        <span>Career Navigator<span className="auth-brand-dot">.</span></span>
      </motion.div>

      <div className="auth-container">
        <motion.div
          className="auth-visual"
          initial={{ opacity: 0, x: -25 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="auth-visual-top">
            <span className="auth-tag">AI-POWERED CAREER GUIDANCE</span>
            <BrainCircuit size={28} />
          </div>

          <div className="auth-visual-content">
            <h1>Navigate your future. <span>Define your career.</span></h1>
            <p>
              Discover your strengths, explore career opportunities,
              and make informed decisions with AI-powered insights.
            </p>
          </div>

          <div className="auth-visual-bottom">
            <div className="auth-stat">
              <strong>01</strong>
              <span>Assess your profile</span>
            </div>
            <div className="auth-stat">
              <strong>02</strong>
              <span>Discover your potential</span>
            </div>
            <div className="auth-stat">
              <strong>03</strong>
              <span>Plan your future</span>
            </div>
          </div>

          <div className="auth-decoration">CN.</div>
        </motion.div>

        <motion.div
          className="auth-form-panel"
          initial={{ opacity: 0, x: 25 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="auth-form-heading">
            <span className="auth-eyebrow">
              {isLogin ? 'WELCOME BACK' : 'GET STARTED'}
            </span>

            <h2>{isLogin ? 'Sign in to your account' : 'Create your account'}</h2>

            <p>
              {isLogin
                ? 'Continue your career discovery journey.'
                : 'Join Career Navigator and discover your potential.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="auth-field">
                <label htmlFor="fullName">Full Name</label>
                <div className="auth-input-wrapper">
                  <UserRound size={18} />
                  <input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                    required
                  />
                </div>
              </div>
            )}

            <div className="auth-field">
              <label htmlFor="email">Email Address</label>
              <div className="auth-input-wrapper">
                <Mail size={18} />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="password">Password</label>
              <div className="auth-input-wrapper">
                <Lock size={18} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="auth-error" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="auth-submit-button"
              disabled={submitting}
            >
              {submitting
                ? 'Please wait...'
                : isLogin
                  ? 'Sign In'
                  : 'Create Account'}
              {!submitting && <ArrowRight size={19} />}
            </button>
          </form>

          <div className="auth-switch">
            <span>
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
            </span>
            <button type="button" onClick={switchMode}>
              {isLogin ? 'Create account' : 'Sign in'}
            </button>
          </div>

          <p className="auth-footer">
            CAREER NAVIGATOR · YOUR FUTURE STARTS HERE
          </p>
        </motion.div>
      </div>
    </div>
  );
}
