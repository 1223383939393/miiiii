import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import "./App.css";

type Message = {
  id: number;
  text: string;
  mine: boolean;
  time: string;
};

type Dialog = {
  id: string;
  title: string;
  lastMessage: string;
  unread: number;
};

const socket: Socket = io("https://messenger-sssss.onrender.com"); // <-- твой Radmin IP

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [dialogs, setDialogs] = useState<Dialog[]>([
    {
      id: "global",
      title: "Общий чат",
      lastMessage: "Добро пожаловать!",
      unread: 0,
    },
  ]);
  const [activeDialogId, setActiveDialogId] = useState<string>("global");
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected:", socket.id);
    });

    socket.on("message", (msg: { text: string; sender: string }) => {
      const mine = msg.sender === socket.id;
      const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          text: msg.text,
          mine,
          time,
        },
      ]);

      setDialogs((prev) =>
        prev.map((d) =>
          d.id === "global"
            ? {
                ...d,
                lastMessage: msg.text,
                unread: mine || activeDialogId === "global" ? d.unread : d.unread + 1,
              }
            : d
        )
      );
    });

    return () => {
      socket.off("message");
    };
  }, [activeDialogId]);

  const sendMessage = () => {
    if (!input.trim()) return;
    socket.emit("message", input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const handleDialogClick = (id: string) => {
    setActiveDialogId(id);
    setDialogs((prev) =>
      prev.map((d) => (d.id === id ? { ...d, unread: 0 } : d))
    );
  };

  return (
    <div className="tg-root">
      {/* Левый сайдбар */}
      <div className="tg-sidebar">
        <div className="tg-sidebar-header">
          <div className="tg-logo">Messenger</div>
        </div>

        <div className="tg-profile">
          <div className="tg-avatar">
            {username ? username[0]?.toUpperCase() : "U"}
          </div>
          <div className="tg-profile-info">
            <input
              className="tg-username-input"
              placeholder="Ваш никнейм"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <span className="tg-profile-status">online</span>
          </div>
        </div>

        <div className="tg-search">
          <input placeholder="Поиск" />
        </div>

        <div className="tg-dialogs">
          {dialogs.map((dialog) => (
            <div
              key={dialog.id}
              className={
                "tg-dialog-item" +
                (dialog.id === activeDialogId ? " active" : "")
              }
              onClick={() => handleDialogClick(dialog.id)}
            >
              <div className="tg-dialog-avatar">
                {dialog.title[0].toUpperCase()}
              </div>
              <div className="tg-dialog-content">
                <div className="tg-dialog-top">
                  <span className="tg-dialog-title">{dialog.title}</span>
                  <span className="tg-dialog-time">
                    {/* можно тут время последнего сообщения хранить */}
                  </span>
                </div>
                <div className="tg-dialog-bottom">
                  <span className="tg-dialog-last">{dialog.lastMessage}</span>
                  {dialog.unread > 0 && (
                    <span className="tg-dialog-unread">{dialog.unread}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Правая часть — чат */}
      <div className="tg-chat">
        <div className="tg-chat-header">
          <div className="tg-chat-title-block">
            <div className="tg-chat-title">
              {
                dialogs.find((d) => d.id === activeDialogId)?.title ??
                "Чат"
              }
            </div>
            <div className="tg-chat-subtitle">Radmin VPN • online</div>
          </div>
        </div>

        <div className="tg-chat-messages">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={
                "tg-message-row " + (msg.mine ? "right" : "left")
              }
            >
              <div className="tg-message-bubble">
                <div className="tg-message-text">{msg.text}</div>
                <div className="tg-message-meta">
                  <span>{msg.time}</span>
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
              placeholder="Написать сообщение..."
            />
          </div>
          <button onClick={sendMessage}>Отправить</button>
        </div>
      </div>
    </div>
  );
}

export default App;