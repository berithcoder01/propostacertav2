import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, Settings, LogOut, Plus, ImageIcon, MapPin, Package, TrendingUp } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { FeatureFlagsProvider, useFeatureFlags } from './context/FeatureFlagsContext';

const Layout = () => {
  const { signOut, user, company, subscription } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const companyName = company?.name || 'PropostaCerta';
  const companyInitial = companyName.charAt(0).toUpperCase();

  // White Label: cor primária da empresa
  const primaryColor = theme?.primary || '#10B981';

  // Gerar iniciais do logo quando não houver logoUrl
  const getInitialsLogo = () => {
    if (company?.logoUrl && company.logoType !== 'generated') {
      return <img src={company.logoUrl} alt={companyName} className="w-10 h-10 rounded-sm object-contain" />;
    }
    return (
      <div
        className="flex-shrink-0 w-10 h-10 rounded-sm flex items-center justify-center shadow-glow"
        style={{ background: `linear-gradient(135deg, ${primaryColor}, ${theme?.secondary || '#050505'})` }}
      >
        <span className="text-black font-display font-black text-lg">{companyInitial}</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-bg text-text-primary font-body overflow-hidden selection:bg-accent/30"
         style={{ '--brand-primary': primaryColor }}>

      {/* Ambient Glow com cor da marca */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--brand-primary)]/20 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[300px] bg-ambient-glow opacity-50 pointer-events-none" />

      {/* Sidebar Desktop - Floating Dock */}
      <aside className="hidden md:flex w-20 hover:w-60 group flex-col bg-card/40 backdrop-blur-3xl border-r border-border transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] z-50"
             style={{ '--accent-nav': primaryColor }}>
        <div className="flex flex-col h-full py-8 px-4">

          {/* Logo com White Label */}
          <div className="flex items-center gap-4 mb-12 px-2 overflow-hidden">
            {getInitialsLogo()}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              <div className="font-display font-black text-sm uppercase tracking-tighter"
                   style={{ color: primaryColor }}>
                {companyName}
              </div>
              <div className="text-[9px]" style={{ color: primaryColor, opacity: 0.7 }}>
                {subscription?.plan?.name
                  ? `${subscription.plan.name} ${subscription.status === 'TRIALING' ? '(Trial)' : ''}`
                  : 'V2.5 Premium'}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 flex flex-col gap-2">
            <SideNavLink to="/"          icon={<LayoutDashboard size={20}/>} label="Dashboard" />
            <SideNavLink to="/propostas" icon={<FileText size={20}/>}        label="Propostas" />
            <SideNavLink to="/clientes"  icon={<Users size={20}/>}           label="Clientes" />
            <SideNavLink to="/produtos"  icon={<Package size={20}/>}         label="Catálogo" />
            <SideNavLink to="/crescimento" icon={<TrendingUp size={20}/>}      label="Crescimento" />
            {subscription?.plan?.hasAi ? (
              <SideNavLink to="/prospeccao" icon={<MapPin size={20}/>} label="Prospecção" />
            ) : (
              <div className="flex items-center gap-4 px-3 py-3 rounded-sm text-muted/40 cursor-not-allowed overflow-hidden" title="Disponível no plano PRO ou ENTERPRISE">
                <MapPin size={20} className="flex-shrink-0" />
                <span className="opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                  Prospecção <span className="text-[9px] bg-muted/20 px-1.5 py-0.5 rounded-full">PRO</span>
                </span>
              </div>
            )}
          </nav>

          {/* Bottom Actions */}
          <div className="mt-auto flex flex-col">
            <div className="flex flex-col gap-2 pt-6 border-t border-border">
              <SideNavLink to="/configuracoes" icon={<Settings size={20}/>} label="Configurações" />
              <button
                onClick={signOut}
                className="flex items-center gap-4 px-3 py-3 rounded-sm transition-all
                text-muted hover:text-danger hover:bg-danger/10 overflow-hidden">
                <LogOut size={20} className="flex-shrink-0" />
                <span className="opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold text-sm">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main UI */}
      <div className="flex-1 flex flex-col overflow-hidden relative">

        {/* Mobile Header */}
        <header className="flex md:hidden items-center justify-between px-6 py-4 bg-bg border-b border-border z-30">
          <div className="flex items-center gap-3">
            {getInitialsLogo()}
            <span className="font-display font-black text-xs uppercase tracking-tighter">
              {companyName}
            </span>
          </div>
          <button
            onClick={() => navigate('/propostas/nova')}
            className="w-10 h-10 rounded-sm flex items-center justify-center active:scale-95 transition-transform shadow-glow"
            style={{ background: primaryColor }}>
            <Plus size={20} className="text-black" />
          </button>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto custom-scrollbar">
          <div className="max-w-6xl mx-auto p-6 md:p-12 pb-32 md:pb-12">
            <Outlet context={{ company }} />
          </div>
        </main>

{/* Mobile Bottom Bar */}
<nav className="flex md:hidden fixed bottom-6 left-6 right-6 z-40 bg-card/80 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl h-16 px-2">
  <div className="flex items-center justify-around w-full relative">
    <BottomNavLink to="/"          icon={<LayoutDashboard size={20}/>} />
    <BottomNavLink to="/propostas" icon={<FileText size={20}/>}        />
    
    <button
      onClick={() => navigate('/propostas/nova')}
      className="relative -top-6 w-14 h-14 rounded-2xl flex items-center justify-center active:scale-90 transition-all border-4 border-bg"
      style={{ background: primaryColor, boxShadow: `0 0 30px ${primaryColor}40` }}>
      <Plus size={28} className="text-black" />
    </button>
    
    <BottomNavLink to="/clientes"   icon={<Users size={20}/>} />
    {subscription?.plan?.hasAi
      ? <BottomNavLink to="/prospeccao" icon={<MapPin size={20}/>} />
      : <div className="flex items-center justify-center w-12 h-12 rounded-lg text-muted/30 cursor-not-allowed" title="Disponível no plano PRO">
          <MapPin size={20} />
        </div>
    }
  </div>
</nav>
      </div>
    </div>
  );
};

const SideNavLink = ({ to, icon, label }) => (
  <NavLink
    to={to}
    end={to === '/'}
    className={({ isActive }) =>
      `flex items-center gap-4 px-3 py-3 rounded-sm transition-all duration-300 group/nav
       ${isActive
          ? 'bg-accent/10 text-accent border-l-2 border-accent shadow-[inset_4px_0_12px_rgba(16,185,129,0.05)]'
          : 'text-muted hover:text-text-primary hover:bg-white/5'
       }`
    }>
    <div className="flex-shrink-0">{icon}</div>
    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap font-bold text-sm uppercase tracking-widest">
      {label}
    </span>
  </NavLink>
);

const BottomNavLink = ({ to, icon }) => (
  <NavLink
    to={to}
    end={to === '/'}
    className={({ isActive }) =>
      `flex items-center justify-center w-12 h-12 rounded-lg transition-all
       ${isActive ? 'text-accent bg-accent/10 scale-110' : 'text-muted'}`
    }>
    {icon}
  </NavLink>
);

export default Layout;