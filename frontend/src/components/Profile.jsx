
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
    UserRound,
    Mail,
    ShieldCheck,
    CalendarDays,
    LogOut,
    Moon,
    Sun,
    Monitor,
    CheckCircle2
} from 'lucide-react';
import './Profile.css';

export default function Profile() {
    const { user, logout } = useAuth();
    const { theme, setTheme } = useTheme();

    const initials = (user?.full_name || 'Student')
        .split(' ')
        .map(name => name[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    return (
        <div className="profile-page">
            <div className="profile-header">
                <div>
                    <p className="eyebrow">CAREER NAVIGATOR / ACCOUNT</p>
                    <h1>My Profile</h1>
                    <p>Manage your account information and preferences.</p>
                </div>
                <span className="profile-status">
                    <span />
                    Active Account
                </span>
            </div>

            <section className="profile-hero cn-card">
                <div className="profile-avatar">{initials}</div>
                <div className="profile-hero-info">
                    <span className="profile-overline">STUDENT ACCOUNT</span>
                    <h2>{user?.full_name || 'Student'}</h2>
                    <p>{user?.email}</p>
                </div>
                <div className="profile-verified">
                    <ShieldCheck size={19} />
                    Authenticated
                </div>
            </section>

            <div className="profile-grid">
                <section className="profile-section cn-card">
                    <div className="profile-section-heading">
                        <div className="profile-section-icon">
                            <UserRound size={20} />
                        </div>
                        <div>
                            <h3>Personal Information</h3>
                            <p>Your registered account details</p>
                        </div>
                    </div>

                    <div className="profile-details">
                        <div className="profile-detail">
                            <span>FULL NAME</span>
                            <strong>{user?.full_name || 'Not available'}</strong>
                        </div>
                        <div className="profile-detail">
                            <span>EMAIL ADDRESS</span>
                            <strong>{user?.email || 'Not available'}</strong>
                        </div>
                        <div className="profile-detail">
                            <span>ACCOUNT ID</span>
                            <strong className="profile-id">{user?.id || 'Not available'}</strong>
                        </div>
                    </div>
                </section>

                <section className="profile-section cn-card">
                    <div className="profile-section-heading">
                        <div className="profile-section-icon">
                            <Monitor size={20} />
                        </div>
                        <div>
                            <h3>Preferences</h3>
                            <p>Customize your workspace appearance</p>
                        </div>
                    </div>

                    <div className="profile-preferences">
                        <span className="profile-preference-label">THEME PREFERENCE</span>
                        <div className="profile-theme-options">
                            {[
                                { value: 'light', label: 'Light', icon: Sun },
                                { value: 'dark', label: 'Dark', icon: Moon },
                                { value: 'system', label: 'System', icon: Monitor }
                            ].map(({ value, label, icon: Icon }) => (
                                <button
                                    key={value}
                                    className={`profile-theme-option ${theme === value ? 'selected' : ''}`}
                                    onClick={() => setTheme(value)}
                                >
                                    <Icon size={17} />
                                    <span>{label}</span>
                                    {theme === value && <CheckCircle2 size={15} />}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="profile-section cn-card profile-security-card">
                    <div className="profile-section-heading">
                        <div className="profile-section-icon">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <h3>Account Security</h3>
                            <p>Your account authentication status</p>
                        </div>
                    </div>

                    <div className="profile-security-status">
                        <CheckCircle2 size={19} />
                        <div>
                            <strong>Account authenticated</strong>
                            <span>Your session is currently active.</span>
                        </div>
                    </div>
                </section>

                <section className="profile-section cn-card profile-logout-card">
                    <div className="profile-section-heading">
                        <div className="profile-section-icon">
                            <LogOut size={20} />
                        </div>
                        <div>
                            <h3>Sign Out</h3>
                            <p>End your current session</p>
                        </div>
                    </div>

                    <button className="profile-logout-button" onClick={logout}>
                        <LogOut size={17} />
                        Logout from Career Navigator
                    </button>
                </section>
            </div>
        </div>
    );
}
