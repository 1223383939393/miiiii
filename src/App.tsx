import { useEffect, useState } from "react";
import AuthPage from "./pages/AuthPage";
import ChatPage from "./pages/ChatPage";
import type { User } from "./types";
import "./App.css";

function App() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleAuthSuccess = (data: { token: string; user: User }) => {
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
  };

  if (!token || !user) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  return <ChatPage user={user} token={token} />;
}

export default App;