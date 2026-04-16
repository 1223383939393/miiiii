import { useEffect, useState } from "react";
import type { User, AuthResponse } from "./types";
import ChatPage from "./pages/ChatPage";
// импортируй сюда свои Login/Register компоненты
import AuthPage from "./pages/AuthPage";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  }, []);

  const handleAuthSuccess = (data: AuthResponse) => {
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  if (!user || !token) {
    return <AuthPage onSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="tg-root">
      <ChatPage
        user={user}
        token={token}
        onLogout={logout}
      />
    </div>
  );
}

export default App;