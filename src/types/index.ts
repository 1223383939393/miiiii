export type User = {
  id: string;
  username: string;
  email: string;
  plainPassword?: string; // только для отображения профиля (учебно)
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type ChatMessage = {
  id: string;
  peerId: string; // с кем диалог
  text: string;
  from: User;
  createdAt: string;
};