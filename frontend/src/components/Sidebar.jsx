
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ClipboardList,
  BrainCircuit,
  ChartNoAxesCombined,
  History,
  UserRound,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Monitor,
  Menu,
  X,
  Compass,
  LogOut
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const navigation = [
  {
    section: 'WORKSPACE',
    items: [
      { label: 'Overview', icon: LayoutDashboard },
      { label: 'Career Assessment', icon: ClipboardList },
      { label: 'Predictions', icon: BrainCircuit },
      { label: 'Career Insights', icon: ChartNoAxesCombined },
      { label: 'History', icon: History }
    ]
  },
  {
    section: 'PREFERENCES',
    items: [
      { label: 'Profile', icon: UserRound }
    ]
  }
];

export default function Sidebar({ activeItem, onNavigate }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  const initials = (user?.full_name || 'Student')
    .split(' ')
    .map(name => name[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleNavigate = (label) => {
    onNavigate(label);
    setMobileOpen(false);
  };

  return (
    <>
      <button
        className="mobile-menu-button"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle navigation"
      >
        {mobileOpen ? <X size={21} /> : <Menu size={21} />}
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''} ${mobileOpen ? 'sidebar-mobile-open' : ''}`}
        animate={{ width: collapsed ? 84 : 260 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
      >
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">
              <Compass size={23} />
            </div>
            {!collapsed && (
              <div className="sidebar-brand-name">
                Career Navigator<span>.</span>
              </div>
            )}
          </div>

          <button
            className="sidebar-collapse-button"
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Collapse sidebar"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <div className="sidebar-profile">
          <div className="sidebar-avatar">{initials}</div>
          {!collapsed && (
            <div className="sidebar-user-info">
              <strong>{user?.full_name || 'Student'}</strong>
              <span>{user?.email || 'Student Account'}</span>
            </div>
          )}
        </div>

        <nav className="sidebar-navigation">
          {navigation.map((group) => (
            <div className="sidebar-group" key={group.section}>
              {!collapsed && (
                <p className="sidebar-section-label">{group.section}</p>
              )}

              {group.items.map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  className={`sidebar-nav-item ${activeItem === label ? 'active' : ''}`}
                  onClick={() => handleNavigate(label)}
                  title={collapsed ? label : undefined}
                >
                  <Icon size={19} strokeWidth={1.9} />
                  {!collapsed && <span>{label}</span>}
                  {activeItem === label && (
                    <span className="sidebar-active-dot" />
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          {!collapsed && <p className="sidebar-section-label">APPEARANCE</p>}

          <div className="sidebar-theme-controls">
            {[
              { value: 'light', icon: Sun, label: 'Light' },
              { value: 'dark', icon: Moon, label: 'Dark' },
              { value: 'system', icon: Monitor, label: 'System' }
            ].map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                className={`sidebar-theme-button ${theme === value ? 'selected' : ''}`}
                onClick={() => setTheme(value)}
                title={collapsed ? label : undefined}
              >
                <Icon size={17} />
                {!collapsed && <span>{label}</span>}
              </button>
            ))}
          </div>

          <button
            className="sidebar-nav-item sidebar-logout-button"
            onClick={logout}
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut size={19} />
            {!collapsed && <span>Logout</span>}
          </button>

          <div className="sidebar-version">
            {!collapsed && <span>CAREER NAVIGATOR · V1.0</span>}
          </div>
        </div>
      </motion.aside>
    </>
  );
}
