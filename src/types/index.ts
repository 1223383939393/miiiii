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
  roomId: string;
  text: string;
  from: User;
  createdAt: string;
};

export type Peer = User;    