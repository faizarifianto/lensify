import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import useAuthStore from '../store/authStore';
import useLoadingStore from '../store/loadingStore';
import toast from 'react-hot-toast';

export default function Auth() {
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', phone: '' });
  
  const { login, register, isLoading } = useAuthStore();
  const { showLoader, hideLoader } = useLoadingStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [isRegister, setIsRegister] = useState(location.pathname === '/register');

  useEffect(() => {
    setIsRegister(location.pathname === '/register');
  }, [location.pathname]);

  const handleLoginChange = e => setLoginForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleRegisterChange = e => setRegisterForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleToggle = e => {
    setIsRegister(e.target.checked);
    navigate(e.target.checked ? '/register' : '/login', { replace: true });
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    showLoader('Verifikasi Akun...');
    const result = await login(loginForm);
    hideLoader();
    if (result.success) {
      toast.success(`Selamat datang, ${result.user.name}!`);
      navigate(result.user.role === 'ADMIN' ? '/admin' : '/dashboard');
    } else {
      toast.error(result.message);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (registerForm.password.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }
    showLoader('Membuat Akun...');
    const result = await register(registerForm);
    hideLoader();
    if (result.success) {
      toast.success('Akun berhasil dibuat! Selamat datang 🎉');
      navigate('/dashboard');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-background items-center justify-center">
      {/* ─── Left Panel (Hidden on Mobile) ─── */}
      <div className="hidden md:flex md:w-1/2 relative flex-col overflow-hidden bg-primary flex-shrink-0 h-screen">
        <div className="absolute inset-0">
          <img
            alt=""
            className="w-full h-full object-cover mix-blend-overlay opacity-30"
            src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=1200&q=80"
          />
        </div>
        <div className="relative z-10 p-10 lg:p-16">
          <Link to="/" className="text-3xl font-extrabold tracking-tighter text-white lowercase">
            lensify.co
          </Link>
        </div>
        <div className="relative z-10 px-10 lg:px-16 pb-16 mt-auto">
          <h1 className="font-extrabold text-5xl xl:text-6xl leading-none uppercase tracking-tight text-white mb-6">
            CAPTURE THE <span className="text-white/80">FUTURE.</span>
          </h1>
          <p className="text-white/80 text-lg leading-relaxed max-w-md">
            Experience the evolution of photography management with Lensify's precision-engineered platform.
          </p>
        </div>
      </div>

      {/* ─── Right Panel: Flip Card Auth ─── */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 h-screen overflow-y-auto">
        <div className="flex flex-col items-center max-w-[480px] w-full">
          <StyledWrapper>
            <div className="wrapper">
              <div className="card-switch">
                <label className="switch">
                  <input type="checkbox" className="toggle" checked={isRegister} onChange={handleToggle} />
                  <span className="slider" />
                  <span className="card-side" />
                </label>
                <div className={`flip-card__inner ${isRegister ? 'is-flipped' : ''}`}>
                  <div className="flip-card__front">
                    <div className="title">Masuk</div>
                    <form className="flip-card__form" onSubmit={handleLoginSubmit}>
                      <input className="flip-card__input" name="email" value={loginForm.email} onChange={handleLoginChange} placeholder="Email" type="email" required />
                      <input className="flip-card__input" name="password" value={loginForm.password} onChange={handleLoginChange} placeholder="Password" type="password" required />
                      <button className="flip-card__btn" type="submit" disabled={isLoading}>Mulai!</button>
                    </form>
                    
                    <div className="w-full mt-2">
                       <div className="flex items-center gap-4 mb-4">
                        <div className="flex-1 border-t border-[var(--main-color)] opacity-20" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/60">ATAU</span>
                        <div className="flex-1 border-t border-[var(--main-color)] opacity-20" />
                      </div>
                      
                      <button
                        type="button"
                        className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border-2 border-[var(--main-color)] bg-white hover:bg-surface-container-low transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none shadow-[2px_2px_var(--main-color)] text-sm font-semibold text-on-surface"
                      >
                        <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Masuk dengan Google
                      </button>
                    </div>
                  </div>
                  <div className="flip-card__back">
                    <div className="title">Daftar</div>
                    <form className="flip-card__form" onSubmit={handleRegisterSubmit}>
                      <input className="flip-card__input" name="name" value={registerForm.name} onChange={handleRegisterChange} placeholder="Nama Lengkap" type="text" required />
                      <input className="flip-card__input" name="email" value={registerForm.email} onChange={handleRegisterChange} placeholder="Email" type="email" required />
                      <input className="flip-card__input" name="phone" value={registerForm.phone} onChange={handleRegisterChange} placeholder="Telp (Opsional)" type="tel" />
                      <input className="flip-card__input" name="password" value={registerForm.password} onChange={handleRegisterChange} placeholder="Password" type="password" required />
                      <button className="flip-card__btn" type="submit" disabled={isLoading}>Konfirmasi</button>
                    </form>
                  </div>
                </div>
              </div>   
            </div>
          </StyledWrapper>
          
          <div className="mt-8 text-center text-sm w-full max-w-[340px]">
            <Link to="/" className="text-secondary hover:text-primary transition-colors font-semibold underline underline-offset-4">
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const StyledWrapper = styled.div`
  .wrapper {
    --input-focus: #ff6a00;
    --font-color: #323232;
    --font-color-sub: #666;
    --bg-color: #fff;
    --bg-color-alt: #666;
    --main-color: #ff6a00;
  }
  
  .card-switch {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 30px;
  }
  
  /* switch card */
  .switch {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 60px;
    height: 24px;
    margin-bottom: 20px;
  }

  .card-side::before {
    position: absolute;
    content: 'Masuk';
    left: -70px;
    top: 0;
    width: 100px;
    text-decoration: underline;
    color: var(--font-color);
    font-weight: 600;
    font-size: 14px;
  }

  .card-side::after {
    position: absolute;
    content: 'Daftar';
    left: 70px;
    top: 0;
    width: 100px;
    text-decoration: none;
    color: var(--font-color);
    font-weight: 600;
    font-size: 14px;
  }

  .toggle {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    box-sizing: border-box;
    border-radius: 5px;
    border: 2px solid var(--main-color);
    box-shadow: 4px 4px var(--main-color);
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--bg-color);
    transition: 0.3s;
  }

  .slider:before {
    box-sizing: border-box;
    position: absolute;
    content: "";
    height: 24px;
    width: 24px;
    border: 2px solid var(--main-color);
    border-radius: 5px;
    left: -2px;
    bottom: -2px;
    background-color: var(--bg-color);
    box-shadow: 0 3px 0 var(--main-color);
    transition: 0.3s;
  }

  .toggle:checked + .slider {
    background-color: var(--input-focus);
  }

  .toggle:checked + .slider:before {
    transform: translateX(36px);
  }

  .toggle:checked ~ .card-side:before {
    text-decoration: none;
  }

  .toggle:checked ~ .card-side:after {
    text-decoration: underline;
  }

  /* card */ 

  .flip-card__inner {
    width: 320px;
    height: 580px;
    position: relative;
    background-color: transparent;
    perspective: 1000px;
    text-align: center;
    transition: transform 0.8s;
    transform-style: preserve-3d;
  }

  .flip-card__inner.is-flipped {
    transform: rotateY(180deg);
  }

  .flip-card__inner.is-flipped .flip-card__front {
    box-shadow: none;
  }

  .flip-card__front, .flip-card__back {
    padding: 30px;
    position: absolute;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    background: #ffffff;
    gap: 16px;
    border-radius: 12px;
    border: 2px solid var(--main-color);
    box-shadow: 6px 6px var(--main-color);
    width: 100%;
    height: 100%;
  }

  .flip-card__back {
    transform: rotateY(180deg);
  }

  .flip-card__form {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    width: 100%;
  }

  .title {
    margin: 5px 0 15px 0;
    font-size: 28px;
    font-weight: 900;
    text-align: center;
    color: var(--main-color);
  }

  .flip-card__input {
    width: 100%;
    height: 48px;
    border-radius: 8px;
    border: 2px solid var(--main-color);
    background-color: var(--bg-color);
    box-shadow: 4px 4px var(--main-color);
    font-size: 15px;
    font-weight: 600;
    color: var(--font-color);
    padding: 10px 14px;
    outline: none;
    transition: all 0.2s;
  }

  .flip-card__input::placeholder {
    color: var(--font-color-sub);
    opacity: 0.8;
  }

  .flip-card__input:focus {
    transform: translate(2px, 2px);
    box-shadow: 2px 2px var(--main-color);
  }

  .flip-card__btn {
    margin: 20px 0;
    width: 100%;
    height: 48px;
    border-radius: 8px;
    border: 2px solid var(--main-color);
    background-color: var(--main-color);
    box-shadow: 4px 4px #cc5500;
    font-size: 16px;
    font-weight: 700;
    color: white;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .flip-card__btn:hover {
    background-color: #ff7f26;
  }

  .flip-card__btn:active, .button-confirm:active {
    box-shadow: 0px 0px #cc5500;
    transform: translate(4px, 4px);
  }
`;
