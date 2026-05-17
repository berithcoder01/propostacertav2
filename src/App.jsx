import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './shared/context/AuthContext';
import { UpgradeProvider } from './shared/context/UpgradeContext';
import Layout from './shared/Layout';
import ProtectedRoute from './shared/components/ProtectedRoute';
import { ToastProvider } from './shared/context/ToastContext';

// Lazy-loaded routes — code splitting automático
const Login = lazy(() => import('./features/auth/Login'));
const Dashboard = lazy(() => import('./features/dashboard/Dashboard'));
const ProposalsList = lazy(() => import('./features/proposal/ProposalsList'));
const ClientsList = lazy(() => import('./features/clients/ClientsList'));
const SelectProposalType = lazy(() => import('./features/proposal/SelectProposalType'));
const ProposalWizard = lazy(() => import('./features/proposal/components/ProposalWizard'));
const QuickProposal = lazy(() => import('./features/proposal/QuickProposal'));
const ProposalFromAi = lazy(() => import('./features/proposal/components/ProposalFromAi'));
const Onboarding = lazy(() => import('./features/onboarding/Onboarding'));
const Company = lazy(() => import('./features/company/Company'));
const PublicProposal = lazy(() => import('./features/proposal/PublicProposal'));
const PlansPage = lazy(() => import('./features/billing/PlansPage'));
const ProspectionDashboard = lazy(() => import('./features/leads/ProspectionDashboard'));
const ProductsPage = lazy(() => import('./features/products/ProductsPage'));
const GrowthPage = lazy(() => import('./features/growth/GrowthPage'));

// Loading fallback
const PageLoading = () => (
  <div className="min-h-screen bg-[#050505] flex items-center justify-center">
    <div className="text-center space-y-3">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="text-sm text-muted">Carregando...</p>
    </div>
  </div>
);

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <UpgradeProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoading />}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/p/:token" element={<PublicProposal />} />

                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="propostas" element={<ProposalsList />} />
                    <Route path="propostas/nova" element={<SelectProposalType />} />
                    <Route path="propostas/nova/geral" element={<ProposalWizard />} />
                    <Route path="propostas/nova/rapida" element={<QuickProposal />} />
                    <Route path="propostas/nova/ai" element={<ProposalFromAi />} />
                    <Route path="propostas/editar/geral/:id" element={<ProposalWizard />} />
                    <Route path="clientes" element={<ClientsList />} />
                    <Route path="configuracoes" element={<Company />} />
                    <Route path="plans" element={<PlansPage />} />
                     <Route path="prospeccao" element={<ProspectionDashboard />} />
                     <Route path="produtos" element={<ProductsPage />} />
                     <Route path="meu-negocio" element={<GrowthPage />} />
                  </Route>
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </UpgradeProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;