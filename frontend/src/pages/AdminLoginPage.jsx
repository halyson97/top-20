import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function AdminLoginPage() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const resetMessages = () => setError("");

  const switchMode = (next) => {
    setMode(next);
    setError("");
    setPassword("");
    setPasswordConfirm("");
  };

  const onLogin = async (e) => {
    e.preventDefault();
    resetMessages();
    setSubmitting(true);
    try {
      const { data } = await api.post("/login", { email, password });
      localStorage.setItem("top20_token", data.token);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Falha no login.");
    } finally {
      setSubmitting(false);
    }
  };

  const onRegister = async (e) => {
    e.preventDefault();
    resetMessages();
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== passwordConfirm) {
      setError("As senhas não coincidem.");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post("/register", { email, password });
      localStorage.setItem("top20_token", data.token);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Não foi possível concluir o cadastro.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login__brand">
        <div className="admin-login__brand-inner">
          <span className="admin-login__badge">Top 20</span>
          <h1 className="admin-login__headline">Painel administrativo</h1>
          <p className="admin-login__lede">
            Gerencie votações, acompanhe resultados e compartilhe o link público com sua turma.
          </p>
          <ul className="admin-login__bullets" aria-hidden>
            <li>Cadastro com email e senha</li>
            <li>Cada conta vê apenas as próprias votações</li>
            <li>Relatório com ranking e votos</li>
          </ul>
        </div>
      </div>

      <div className="admin-login__panel">
        <div className="admin-login__card">
          <div className="admin-login__tabs" role="tablist" aria-label="Acesso ao painel">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "login"}
              className={`admin-login__tab ${mode === "login" ? "is-active" : ""}`}
              onClick={() => switchMode("login")}
            >
              Entrar
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "register"}
              className={`admin-login__tab ${mode === "register" ? "is-active" : ""}`}
              onClick={() => switchMode("register")}
            >
              Cadastrar
            </button>
          </div>

          <div className="admin-login__card-head">
            <div className="admin-login__icon" aria-hidden>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <h2 className="admin-login__title">{mode === "login" ? "Entrar" : "Criar conta"}</h2>
              <p className="admin-login__subtitle">
                {mode === "login"
                  ? "Use o email e a senha da sua conta."
                  : "Cadastre-se para criar e gerenciar suas votações."}
              </p>
            </div>
          </div>

          {mode === "login" ? (
            <form className="admin-login__form" onSubmit={onLogin}>
              <label className="admin-login__field">
                <span>Email</span>
                <input
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  disabled={submitting}
                />
              </label>
              <label className="admin-login__field">
                <span>Senha</span>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={submitting}
                />
              </label>

              {error ? (
                <div className="admin-login__error" role="alert">
                  {error}
                </div>
              ) : null}

              <button type="submit" className="admin-login__submit" disabled={submitting}>
                {submitting ? "Entrando…" : "Entrar no painel"}
              </button>
            </form>
          ) : (
            <form className="admin-login__form" onSubmit={onRegister}>
              <label className="admin-login__field">
                <span>Email</span>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  disabled={submitting}
                />
              </label>
              <label className="admin-login__field">
                <span>Senha</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                  disabled={submitting}
                />
              </label>
              <label className="admin-login__field">
                <span>Confirmar senha</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="Repita a senha"
                  required
                  disabled={submitting}
                />
              </label>

              {error ? (
                <div className="admin-login__error" role="alert">
                  {error}
                </div>
              ) : null}

              <button type="submit" className="admin-login__submit" disabled={submitting}>
                {submitting ? "Cadastrando…" : "Criar conta e entrar"}
              </button>
            </form>
          )}
        </div>
        <p className="admin-login__footnote">Área restrita · sessão segura com JWT</p>
      </div>
    </div>
  );
}
