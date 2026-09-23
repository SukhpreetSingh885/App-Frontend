import {
  getToken,
  removeToken,
  removeUser,
  saveToken,
  saveUser,
  type StoredUser,
} from "@/services/auth.storage";
import { ApiError, apiRequest } from "@/services/api";
import {
  useCallback,
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Session = {
  accessToken: string;
  user: StoredUser;
};

type AuthContextValue = {
  isLoading: boolean;
  isAuthenticated: boolean;
  sessionValidationError: boolean;
  user: StoredUser | null;
  setSession: (session: Session) => Promise<void>;
  logout: () => Promise<void>;
  retrySessionValidation: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [hasToken, setHasToken] = useState(false);
  const [sessionValidationError, setSessionValidationError] = useState(false);

  const clearSession = useCallback(async () => {
    try {
      await Promise.all([removeToken(), removeUser()]);
    } finally {
      setUser(null);
      setHasToken(false);
    }
  }, []);

  const validateSession = useCallback(async () => {
    setIsLoading(true);
    setSessionValidationError(false);

    try {
      const token = await getToken();

      if (!token) {
        setUser(null);
        setHasToken(false);
        return;
      }

      const currentUser = await apiRequest<StoredUser>("/users/me");
      await saveUser(currentUser);
      setUser(currentUser);
      setHasToken(true);
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 404)) {
        await clearSession();
      } else {
        setUser(null);
        setHasToken(false);
        setSessionValidationError(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [clearSession]);

  useEffect(() => {
    void validateSession();
  }, [validateSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoading,
      isAuthenticated: hasToken,
      sessionValidationError,
      user,
      setSession: async ({ accessToken, user: sessionUser }) => {
        await saveUser(sessionUser);
        await saveToken(accessToken);
        setUser(sessionUser);
        setHasToken(true);
      },
      logout: async () => {
        setSessionValidationError(false);
        await clearSession();
      },
      retrySessionValidation: validateSession,
    }),
    [clearSession, hasToken, isLoading, sessionValidationError, user, validateSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
