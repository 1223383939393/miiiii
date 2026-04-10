import { useEffect, useState } from "react";
import type { User } from "../types";
import { fetchUsers } from "../api/auth";
import { useChatSocket } from "../hooks/useChatSocket";

type ChatPageProps = {
  user: User;
  token: string;
};

function ChatPage({ user, token }: ChatPageProps) {
  const [peers, setPeers] = useState<User[]>([]);
  const [selectedPeer, setSelectedPeer] = useState<User | null>(null);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const { connected, currentRoomId, messages, joinRoomWithPeer, sendMessage } =
    useChatSocket({ token, currentUser: user });

  // При старте НЕ грузим всех, peers остаётся пустым
  useEffect(() => {
    setPeers([]);
  }, [user.id]);

  const handleSearch = async () => {
    const q = search.trim();
    if (!q) {
      setSearchError("Введите ник или email для поиска");
      setPeers([]);
      return;
    }

    try {
      setSearchLoading(true);
      setSearchError(null);
      const all = await fetchUsers();
      const filtered = all
        .filter((u) => u.id !== user.id)
        .filter((p) => {
          const lower = q.toLowerCase();
          return (
            p.username.toLowerCase().includes(lower) ||
            p.email.toLowerCase().includes(lower)
          );
        });

      if (filtered.length === 0) {
        setSearchError("Пользователи не найдены");
      }
      setPeers(filtered);
      // выбранный собеседник сбрасывается, если его нет в новых результатах
      setSelectedPeer((prev) =>
        prev && filtered.find((p) => p.id === prev.id) ? prev : null
      );
    } catch (e: any) {
      setSearchError("Ошибка при поиске пользователей");
      setPeers([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectPeer = (peer: User) => {
    setSelectedPeer(peer);
    joinRoomWithPeer(peer.id);
  };

  const handleSend = () => {
    if (!selectedPeer) return;
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="tg-root">
      {/* Сайдбар */}
      <div className="tg-sidebar">
        <div className="tg-sidebar-header">
          <div className="tg-logo">QMessage</div>
        </div>

        <div className="tg-profile">
          <div className="tg-avatar">
            {user.username[0]?.toUpperCase()}
          </div>
          <div className="tg-profile-info">
            <div className="tg-username-input">
              {user.username}
            </div>
            <span className="tg-profile-status">
              {connected ? "online" : "offline"}
            </span>
          </div>
        </div>

        <div className="tg-search">
          <div style={{ display: "flex", gap: 8 }}>
            <input
              placeholder="Найти по нику или почте"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSearchError(null);
              }}
            />
            <button
              style={{
                padding: "6px 10px",
                borderRadius: 12,
                border: "none",
                background: "#3390ec",
                color: "#fff",
                fontSize: 13,
                cursor: "pointer",
              }}
              onClick={handleSearch}
              disabled={searchLoading}
            >
              {searchLoading ? "Поиск..." : "Найти"}
            </button>
          </div>
          {searchError && (
            <div
              style={{
                marginTop: 4,
                fontSize: 12,
                color: "#ff6b6b",
              }}
            >
              {searchError}
            </div>
          )}
        </div>

        <div className="tg-dialogs">
          {peers.map((peer) => (
            <div
              key={peer.id}
              className={
                "tg-dialog-item" +
                (selectedPeer?.id === peer.id ? " active" : "")
              }
              onClick={() => handleSelectPeer(peer)}
            >
              <div className="tg-dialog-avatar">
                {peer.username[0]?.toUpperCase()}
              </div>
              <div className="tg-dialog-content">
                <div className="tg-dialog-top">
                  <span className="tg-dialog-title">{peer.username}</span>
                </div>
                <div className="tg-dialog-bottom">
                  <span className="tg-dialog-last">
                    {peer.email}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {peers.length === 0 && !searchLoading && !searchError && (
            <div
              style={{
                padding: "8px 12px",
                fontSize: 13,
                color: "#9db0c1",
              }}
            >
              Найдите пользователя по нику или email, чтобы начать чат.
            </div>
          )}
        </div>
      </div>

      {/* Чат */}
      <div className="tg-chat">
        <div className="tg-chat-header">
          <div className="tg-chat-title-block">
            <div className="tg-chat-title">
              {selectedPeer ? selectedPeer.username : "Выберите собеседника"}
            </div>
            <div className="tg-chat-subtitle">
              {currentRoomId ? "Чат открыт" : "Нет активной комнаты"}
            </div>
          </div>
        </div>

        <div className="tg-chat-messages">
          {messages
            .filter((m) => m.roomId === (currentRoomId || ""))
            .map((msg) => (
              <div
                key={msg.id}
                className={
                  "tg-message-row " +
                  (msg.from.id === user.id ? "right" : "left")
                }
              >
                <div className="tg-message-bubble">
                  {msg.from.id !== user.id && (
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        marginBottom: 2,
                        color: "#9db0c1",
                      }}
                    >
                      {msg.from.username}
                    </div>
                  )}
                  <div className="tg-message-text">{msg.text}</div>
                  <div className="tg-message-meta">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}
        </div>

        <div className="tg-chat-input">
          <div className="tg-input-wrapper">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                selectedPeer
                  ? "Написать сообщение..."
                  : "Сначала найдите и выберите собеседника"
              }
              disabled={!selectedPeer}
            />
          </div>
          <button onClick={handleSend} disabled={!selectedPeer}>
            Отправить
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
