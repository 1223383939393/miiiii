import { useState } from "react";
import type { AuthResponse } from "../types";
import { login, register } from "../api/auth";

type AuthPageProps = {
  onAuthSuccess: (data: AuthResponse) => void;
};

function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await login(emailOrUsername, password);
      onAuthSuccess(res);
    } catch (e: any) {
      setError(e.message || "Login error");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await register(username, email, password);
      onAuthSuccess(res);
    } catch (e: any) {
      setError(e.message || "Register error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <div className="auth-panel">
        <h1>Messenger</h1>
        <div className="auth-tabs">
          <button
            className={mode === "login" ? "active" : ""}
            onClick={() => setMode("login")}
          >
            Вход
          </button>
          <button
            className={mode === "register" ? "active" : ""}
            onClick={() => setMode("register")}
          >
            Регистрация
          </button>
        </div>

        {mode === "login" ? (
          <>
            <input
              placeholder="Email или ник"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
            />
            <input
              placeholder="Пароль"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <div className="auth-error">{error}</div>}
            <button disabled={loading} onClick={handleLogin}>
              {loading ? "Входим..." : "Войти"}
            </button>
          </>
        ) : (
          <>
            <input
              placeholder="Никнейм"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              placeholder="Пароль"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <div className="auth-error">{error}</div>}
            <button disabled={loading} onClick={handleRegister}>
              {loading ? "Регистрируем..." : "Зарегистрироваться"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default AuthPage;