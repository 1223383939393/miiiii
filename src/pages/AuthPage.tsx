import { useState } from "react";
import type { AuthResponse } from "../types";
import { login, register } from "../api/auth";




type AuthPageProps = {
  onSuccess: (data: AuthResponse) => void;
};
const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidPassword = (password: string) => password.length >= 6;

const isValidUsername = (name: string) =>
  name.trim().length >= 3 && !/\s/.test(name);

function AuthPage({ onSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    emailOrUsername?: string;
  }>({});

  const clearFields = () => {
    setUsername("");
    setEmail("");
    setEmailOrUsername("");
    setPassword("");
    setFieldErrors({});
    setError(null);
  };

  const switchMode = (nextMode: "login" | "register") => {
    setMode(nextMode);
    clearFields();
  };

  const handleLogin = async () => {
    const errs: typeof fieldErrors = {};
    if (!emailOrUsername.trim()) {
      errs.emailOrUsername = "Введите email или ник";
    }
    if (!isValidPassword(password)) {
      errs.password = "Пароль не короче 6 символов";
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setFieldErrors({});
      const res = await login(emailOrUsername, password);
      onSuccess(res);
    } catch (e: any) {
      setError(e.message || "Login error");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    const errs: typeof fieldErrors = {};

    if (!isValidUsername(username)) {
      errs.username = "Ник ≥ 3 символов, без пробелов";
    }
    if (!isValidEmail(email)) {
      errs.email = "Некорректный email";
    }
    if (!isValidPassword(password)) {
      errs.password = "Пароль не короче 6 символов";
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setFieldErrors({});
      const res = await register(username, email, password);
      onSuccess(res);
    } catch (e: any) {
      setError(e.message || "Register error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <div className="auth-panel">
        <h1>QMessage</h1>
        <div className="auth-tabs">
          <button
            className={mode === "login" ? "active" : ""}
            onClick={() => switchMode("login")}
          >
            Вход
          </button>
          <button
            className={mode === "register" ? "active" : ""}
            onClick={() => switchMode("register")}
          >
            Регистрация
          </button>
        </div>

        {mode === "login" ? (
          <>
            <div className="auth-field">
              <input
                className={
                  fieldErrors.emailOrUsername ? "auth-input error" : "auth-input"
                }
                placeholder="Email или ник"
                value={emailOrUsername}
                onChange={(e) => {
                  setEmailOrUsername(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, emailOrUsername: undefined }));
                }}
              />
              {fieldErrors.emailOrUsername && (
                <div className="auth-field-error">{fieldErrors.emailOrUsername}</div>
              )}
            </div>

            <div className="auth-field">
              <input
                className={fieldErrors.password ? "auth-input error" : "auth-input"}
                placeholder="Пароль"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }}
              />
              {fieldErrors.password && (
                <div className="auth-field-error">{fieldErrors.password}</div>
              )}
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button disabled={loading} onClick={handleLogin}>
              {loading ? "Входим..." : "Войти"}
            </button>
          </>
        ) : (
          <>
            <div className="auth-field">
              <input
                className={fieldErrors.username ? "auth-input error" : "auth-input"}
                placeholder="Никнейм"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, username: undefined }));
                }}
              />
              {fieldErrors.username && (
                <div className="auth-field-error">{fieldErrors.username}</div>
              )}
            </div>

            <div className="auth-field">
              <input
                className={fieldErrors.email ? "auth-input error" : "auth-input"}
                placeholder="Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }}
              />
              {fieldErrors.email && (
                <div className="auth-field-error">{fieldErrors.email}</div>
              )}
            </div>

            <div className="auth-field">
              <input
                className={fieldErrors.password ? "auth-input error" : "auth-input"}
                placeholder="Пароль"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }}
              />
              <small style={{ color: "#9db0c1", fontSize: 12 }}>
                Минимум 6 символов, без пробелов.
              </small>
              {fieldErrors.password && (
                <div className="auth-field-error">{fieldErrors.password}</div>
              )}
            </div>

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