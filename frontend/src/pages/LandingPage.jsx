import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  DollarSign,
  Users,
  Shield,
  ArrowRight,
  Zap,
  CheckCircle,
  Sun,
  Moon
} from 'lucide-react';

export const LandingPage = ({ onLogin, onRegister }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('dayflow_theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('dayflow_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--bg-main)',
      fontFamily: 'var(--font-heading)',
      transition: 'background-color 0.2s, color 0.2s'
    }}>
      
      {/* Premium Navbar */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-color)',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        transition: 'background-color 0.2s, border-color 0.2s'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{ backgroundColor: '#2D4A3E', color: '#FFFFFF', padding: '0.4rem 0.6rem', borderRadius: '8px', fontWeight: '700', fontSize: '1.25rem', letterSpacing: '-0.03em' }}>
            D
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
            Dayflow<span style={{ color: '#2D4A3E', fontWeight: '500' }}>.</span>
          </span>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <a href="#features" style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}>Features</a>
          <a href="#stats" style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}>Enterprise</a>
        </nav>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {/* Dark Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              padding: '0.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginRight: '0.5rem'
            }}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          <button onClick={onLogin} className="btn-secondary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>
            Log In
          </button>
          <button onClick={onRegister} className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            Get Started <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        padding: '6rem 2rem 5rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem',
        position: 'relative'
      }}>
        {/* Decorative Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: '#EBF2EE',
          color: '#2D4A3E',
          padding: '0.35rem 0.875rem',
          borderRadius: '20px',
          fontSize: '0.75rem',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          <Zap size={12} /> Next-Gen Workforce Intelligence
        </div>

        <h1 style={{
          fontSize: '3.75rem',
          fontWeight: '800',
          color: 'var(--text-primary)',
          lineHeight: '1.15',
          letterSpacing: '-0.04em',
          maxWidth: '850px',
          margin: 0
        }}>
          Where time tracking meets <span style={{ background: 'linear-gradient(120deg, #2D4A3E 0%, #1A2D24 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>automated payroll.</span>
        </h1>

        <p style={{
          fontSize: '1.125rem',
          color: 'var(--text-secondary)',
          maxWidth: '620px',
          lineHeight: '1.6',
          margin: '0 auto'
        }}>
          Dayflow simplifies clock-ins, coordinates leave calendars, guarantees self-approval blocks, and manages compensation in one clean interface. Built for modern local teams.
        </p>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button onClick={onRegister} className="btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(45, 74, 62, 0.15)' }}>
            Start For Free <ArrowRight size={18} />
          </button>
          <button onClick={onLogin} className="btn-secondary" style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>
            Book a Demo
          </button>
        </div>

        {/* Dynamic Graphic Placeholder / Stats Grid */}
        <div style={{
          marginTop: '3.5rem',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          textAlign: 'left'
        }}>
          <div className="dashboard-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ backgroundColor: '#EBF2EE', color: '#2D4A3E', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={20} />
            </div>
            <h4 style={{ fontWeight: '700', fontSize: '1.125rem', color: 'var(--text-primary)', margin: 0 }}>Smart Clocking</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>Auto-flag late entries after 09:30 AM and calculate total worked session hours instantly on check-out.</p>
          </div>

          <div className="dashboard-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ backgroundColor: '#FDF2F8', color: '#DB2777', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={20} />
            </div>
            <h4 style={{ fontWeight: '700', fontSize: '1.125rem', color: 'var(--text-primary)', margin: 0 }}>Self-Approval Blocks</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>Automatic HR audit safety checks prevent Admins from approving their own leave applications.</p>
          </div>

          <div className="dashboard-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ backgroundColor: '#F0F9FF', color: '#0284C7', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={20} />
            </div>
            <h4 style={{ fontWeight: '700', fontSize: '1.125rem', color: 'var(--text-primary)', margin: 0 }}>Printable Payslips</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>Direct client-side generation of beautiful monthly payroll paystubs, ready to print or save as PDF.</p>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" style={{ backgroundColor: 'var(--bg-subtle)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '5rem 2rem', transition: 'background-color 0.2s, border-color 0.2s' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.03em', margin: 0 }}>Full-suite capabilities for remote and local teams</h2>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>Stop jumping between spreadsheets. Dayflow brings your directory, calendar, payroll, and logs together.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
            {/* feature 1 */}
            <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '2rem', display: 'flex', gap: '1.25rem', transition: 'background-color 0.2s, border-color 0.2s' }}>
              <CheckCircle size={22} color="#2D4A3E" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>Workforce Directory</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>Dynamic Grid and List switchers display departments, job titles, and active statuses with colored visual rings.</p>
              </div>
            </div>

            {/* feature 2 */}
            <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '2rem', display: 'flex', gap: '1.25rem', transition: 'background-color 0.2s, border-color 0.2s' }}>
              <CheckCircle size={22} color="#2D4A3E" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>Broadcaster Announcements</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>Broadcasters allow HR admins to broadcast corporate news alerts directly into employee portal dashboards in real-time.</p>
              </div>
            </div>

            {/* feature 3 */}
            <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '2rem', display: 'flex', gap: '1.25rem', transition: 'background-color 0.2s, border-color 0.2s' }}>
              <CheckCircle size={22} color="#2D4A3E" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>Weekly Attendance views</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>Admins and employees can filter logs dynamically by Daily checks or Weekly range calculations.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section id="stats" style={{ padding: '5rem 2rem', maxWidth: '1200px', margin: '0 auto', width: '100%', textAlign: 'center' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
          <div>
            <div style={{ fontSize: '3rem', fontWeight: '800', color: '#2D4A3E', letterSpacing: '-0.04em' }}>99.8%</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: '600', marginTop: '0.25rem', textTransform: 'uppercase' }}>Clock-in Reliability</div>
          </div>
          <div>
            <div style={{ fontSize: '3rem', fontWeight: '800', color: '#2D4A3E', letterSpacing: '-0.04em' }}>15 mins</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: '600', marginTop: '0.25rem', textTransform: 'uppercase' }}>Monthly Payroll Processing</div>
          </div>
          <div>
            <div style={{ fontSize: '3rem', fontWeight: '800', color: '#2D4A3E', letterSpacing: '-0.04em' }}>0 leaks</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: '600', marginTop: '0.25rem', textTransform: 'uppercase' }}>Self-approval Audited Logs</div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section style={{
        margin: '2rem 2rem 5rem 2rem',
        padding: '4rem 2rem',
        borderRadius: '24px',
        background: 'linear-gradient(135deg, #2D4A3E 0%, #1A2B24 100%)',
        color: '#FFFFFF',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem',
        boxShadow: 'var(--shadow-md)'
      }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#FFFFFF', margin: 0, letterSpacing: '-0.03em' }}>Ready to streamline your team's workflow?</h2>
        <p style={{ fontSize: '1.0625rem', color: 'rgba(255, 255, 255, 0.75)', maxWidth: '550px', margin: 0 }}>Register a new workspace or log in with your credentials to explore Dayflow HRMS.</p>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
          <button onClick={onRegister} className="btn-primary" style={{ backgroundColor: '#FFFFFF', color: '#2D4A3E', border: '1px solid #FFFFFF', padding: '0.75rem 2rem' }}>
            Sign Up Now
          </button>
          <button onClick={onLogin} className="btn-secondary" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.2)', padding: '0.75rem 2rem' }}>
            Access Portal
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border-color)',
        padding: '2rem',
        textAlign: 'center',
        fontSize: '0.8125rem',
        color: 'var(--text-muted)',
        backgroundColor: 'var(--bg-subtle)',
        transition: 'background-color 0.2s, border-color 0.2s'
      }}>
        <p style={{ margin: 0 }}>© {new Date().getFullYear()} Dayflow HRMS. All rights reserved. Designed for local enterprise compliance.</p>
      </footer>

    </div>
  );
};
