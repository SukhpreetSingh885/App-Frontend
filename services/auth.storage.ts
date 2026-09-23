import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "auth.accessToken";
const USER_KEY = "auth.user";

export type StoredUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  [key: string]: unknown;
};

export async function saveToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
}

export function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export function removeToken(): Promise<void> {
  return SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
}

export async function saveUser(user: StoredUser): Promise<void> {
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
}

export async function getUser(): Promise<StoredUser | null> {
  const value = await SecureStore.getItemAsync(USER_KEY);

  if (!value) return null;

  try {
    return JSON.parse(value) as StoredUser;
  } catch {
    await SecureStore.deleteItemAsync(USER_KEY);
    return null;
  }
}

export function removeUser(): Promise<void> {
  return SecureStore.deleteItemAsync(USER_KEY);
}
