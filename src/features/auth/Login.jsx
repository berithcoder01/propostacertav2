import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import { useThemeMode } from '../../shared/context/ThemeContext';
import { Lock, Mail, Eye, EyeOff, Building2, User, ArrowRight } from 'lucide-react';

const Login = () => {
  const { setLight } = useThemeMode();
  const [isLogin, setIsLogin]       = useState(true);
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [name, setName]             = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]           = useState('');
  const [isLoading, setIsLoading]   = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { setLight(); }, [setLight]);

  const companyName    = localStorage.getItem('@narogestor:companyName') || 'NaroGestor';
  const companySlogan  = localStorage.getItem('@narogestor:companySlogan') || 'Propostas Comerciais';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
        navigate('/');
      } else {
        await signUp(name, email, password);
        // Redireciona direto para o onboarding após criar a conta
        navigate('/onboarding');
      }
    } catch (err) {
      setError(err.message || (isLogin ? 'Erro ao fazer login' : 'Erro ao criar conta'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4 relative overflow-hidden">

      {/* Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[300px] bg-ambient-glow opacity-30 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm relative z-10">

        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow">
              <Building2 size={20} className="text-white" />
            </div>
            <span className="font-display font-bold text-lg text-text-primary tracking-tight">
              {companyName}
            </span>
          </div>

          <h1 className="font-display text-3xl font-bold text-text-primary leading-tight mb-2">
            {isLogin ? 'Bem-vindo de volta' : 'Criar conta'}
          </h1>
          <p className="text-text-secondary text-sm">
            {isLogin ? 'Entre para acessar suas propostas' : 'Preencha os dados para começar'}
          </p>
        </div>

        {/* Card do formulário */}
        <div className="card p-7 space-y-4">

          {/* Mensagem de erro */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-danger text-xs font-medium text-center
                bg-danger/8 border border-danger/20 rounded-xl px-4 py-2.5">
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Nome (apenas cadastro) */}
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Nome completo
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Seu nome"
                      required={!isLogin}
                      className="input-base pl-10"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Email
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="input-base pl-10"
                />
              </div>
            </div>

            {/* Senha */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Senha
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input-base pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-text-primary transition-colors">
                  {showPassword ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>

            {/* Botão submit */}
            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>{isLogin ? 'Entrar' : 'Criar Conta'} <ArrowRight size={16}/></>
              )}
            </button>
          </form>
        </div>

        {/* Toggle login / cadastro */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted">
            {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}{' '}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-accent font-semibold hover:text-accent-hover transition-colors">
              {isLogin ? 'Criar conta' : 'Entrar'}
            </button>
          </p>
          <p className="text-center text-xs text-muted mt-4">
            Desenvolvido por{' '}
            <span className="text-text-secondary font-semibold">BerithCode</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;