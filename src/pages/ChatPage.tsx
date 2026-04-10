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

  const { connected, currentRoomId, messages, joinRoomWithPeer, sendMessage } =
    useChatSocket({ token, currentUser: user });

  useEffect(() => {
    fetchUsers().then((data) => {
      setPeers(data.filter((u) => u.id !== user.id));
    });
  }, [user.id]);

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

  const filteredPeers = peers.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.username.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="tg-root">
      {/* Сайдбар */}
      <div className="tg-sidebar">
        <div className="tg-sidebar-header">
          <div className="tg-logo">Messenger</div>
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
          <input
            placeholder="Поиск по нику или почте"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="tg-dialogs">
          {filteredPeers.map((peer) => (
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
                    {/* тут можно вывести превью последнего сообщения */}
                  </span>
                </div>
              </div>
            </div>
          ))}
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
                  : "Сначала выберите собеседника"
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