
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate('/perfil');
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: name.split(' ')[0],
              last_name: name.split(' ').slice(1).join(' '),
              name: name,
            }
          }
        });
        if (error) throw error;
        if (data.session) {
          navigate('/perfil');
        } else {
          setError('Verifique seu email para confirmar o cadastro.');
          setLoading(false);
          return;
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message === 'Invalid login credentials' ? 'Credenciais inválidas.' : err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-20">
      <div className="w-full max-w-xl">
        <div className="text-center mb-16">
          <span className="text-accent text-[11px] font-black uppercase tracking-[0.6em] mb-4 block">Acesso ao Terminal</span>
          <h1 className="font-serif text-4xl md:text-7xl font-black text-primary uppercase leading-tight tracking-tighter">
            {isLogin ? 'Login' : 'Cadastro'} <br /> <span className="text-accent italic">Estratégico</span>
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-lightGray p-10 md:p-16 rounded-[2.5rem] md:rounded-[4rem] shadow-sm border border-gray-50 space-y-8">
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Nome Completo</label>
              <input
                required
                type="text"
                placeholder="Ex: Ricardo Montenegro"
                className="w-full bg-white border-b-2 border-primary/5 px-4 py-4 focus:outline-none focus:border-accent transition-all font-bold text-primary"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">E-mail Corporativo</label>
            <input
              required
              type="email"
              placeholder="seu@email.com.br"
              className="w-full bg-white border-b-2 border-primary/5 px-4 py-4 focus:outline-none focus:border-accent transition-all font-bold text-primary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Senha</label>
            <input
              required
              type="password"
              placeholder="••••••••"
              className="w-full bg-white border-b-2 border-primary/5 px-4 py-4 focus:outline-none focus:border-accent transition-all font-bold text-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-accent text-[11px] font-black uppercase tracking-wider text-center bg-accent/5 py-3 rounded-xl border border-accent/10">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-black uppercase tracking-[0.4em] py-6 rounded-2xl text-[12px] hover:bg-accent hover:scale-[1.01] active:scale-95 transition-all shadow-xl shadow-primary/10"
          >
            {loading ? 'Processando Autenticação...' : (isLogin ? 'Entrar no Acervo' : 'Criar Credencial')}
          </button>
        </form>

        <div className="mt-12 text-center">
          <p className="text-secondary text-sm font-medium italic opacity-60 mb-4">
            {isLogin ? 'Ainda não possui credenciais?' : 'Já possui acesso premium?'}
          </p>
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-[11px] font-black uppercase tracking-[0.4em] text-accent hover:text-primary transition-colors border-b-2 border-accent/20 hover:border-primary pb-1"
          >
            {isLogin ? 'Solicitar Cadastro' : 'Fazer Login no Sistema'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
