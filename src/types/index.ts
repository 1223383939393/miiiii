export type User = {
  id: string;
  username: string;
  email: string;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type ChatMessage = {
  id: string;
  peerId: string;       // с кем это диалог (для фильтрации)
  text: string;
  from: User;
  createdAt: string;
};


export type Peer = User;    