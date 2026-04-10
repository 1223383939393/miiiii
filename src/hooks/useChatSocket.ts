import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import type { ChatMessage, User } from "../types";

const SOCKET_URL = "https://messenger-sssss.onrender.com"; // твой сервер

type UseChatSocketParams = {
  token: string | null;
  currentUser: User | null;
};

export function useChatSocket({ token, currentUser }: UseChatSocketParams) {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token || !currentUser) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      console.log("Socket connected", socket.id);
    });

    socket.on("disconnect", () => {
      setConnected(false);
      console.log("Socket disconnected");
    });

    socket.on(
      "message",
      (payload: {
        from: { id: string; username: string; email?: string };
        toUserId: string;
        text: string;
        createdAt: string;
      }) => {
        const from: User = {
          id: payload.from.id,
          username: payload.from.username,
          email: payload.from.email || "",
        };

        // Сообщение считается "моим", если от меня
        const isMine = from.id === currentUser.id;

        // Собеседник — тот, кто не я
        const peerId = isMine ? payload.toUserId : from.id;

        setMessages((prev) => [
          ...prev,
          {
            id:
              payload.createdAt +
              "-" +
              payload.toUserId +
              "-" +
              Math.random(),
            peerId,
            text: payload.text,
            from,
            createdAt: payload.createdAt,
          },
        ]);
      }
    );

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, currentUser]);

  const sendMessage = (toUserId: string, text: string) => {
    if (!socketRef.current || !text.trim()) return;
    socketRef.current.emit("message", { toUserId, text });
  };

  return {
    connected,
    messages,
    sendMessage,
  };
}
