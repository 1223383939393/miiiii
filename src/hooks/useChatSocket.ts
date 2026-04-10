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
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
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
        roomId: string;
        text: string;
        from: { id: string; username: string; email?: string };
        createdAt: string;
      }) => {
        setMessages((prev) => [
          ...prev,
          {
            id: `${payload.roomId}-${payload.createdAt}-${Math.random()}`,
            roomId: payload.roomId,
            text: payload.text,
            from: {
              id: payload.from.id,
              username: payload.from.username,
              email: payload.from.email || "",
            },
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

  const joinRoomWithPeer = (peerId: string) => {
    if (!socketRef.current) return;
    setMessages([]); // очищаем чат при смене собеседника
    socketRef.current.emit("join", { peerId });
    socketRef.current.once("joined", ({ roomId }: { roomId: string }) => {
      setCurrentRoomId(roomId);
    });
  };

  const sendMessage = (text: string) => {
    if (!socketRef.current || !currentRoomId || !text.trim()) return;
    socketRef.current.emit("message", { roomId: currentRoomId, text });
  };

  return {
    connected,
    currentRoomId,
    messages,
    joinRoomWithPeer,
    sendMessage,
  };
}