import { API, User } from "ynab";
import React, { createContext, useContext, useEffect, useState } from "react";

type Authentication =
  | {
      status: "authenticated";
      user: User;
      accessToken: string;
      selectedBudgetId: string | null;
    }
  | { status: "pending" }
  | { status: "unauthenticated" };

const useYnabAuth = () => {
  const [authState, setAuthState] = useState<Authentication>({ status: "pending" });

  useEffect(() => {
    const hash = window.location.hash;
    let token: string | null = null;
    if (hash) {
      token = hash.match(/access_token=([^&]+)/)?.[1] ?? null;
      window.location.hash = "";
    } else {
      token = localStorage.getItem("ynab_access_token");
    }
    if (token) {
      const fetchAndSetUser = async () => {
        const ynabApi = new API(token);
        try {
          const response = await ynabApi.user.getUser();
          const { user } = response.data;
          const selectedBudgetId = await (async () => {
            const persistedBudget = localStorage.getItem(`${user.id}-selected_budget_id`);
            if (persistedBudget) {
              return persistedBudget;
            }
            try {
              return (await ynabApi.budgets.getBudgetById("default")).data.budget.id;
            } catch (error) {
              console.error("Error fetching default budget", error);
              return null;
            }
          })();
          setAuthState({
            status: "authenticated",
            user,
            accessToken: token,
            selectedBudgetId,
          });
          localStorage.setItem("ynab_access_token", token);
        } catch (error) {
          console.error("Error fetching user data", error);
          setAuthState({ status: "unauthenticated" });
          localStorage.removeItem("ynab_access_token");
        }
      };
      fetchAndSetUser();
    } else {
      console.log("No token found");
      setAuthState({ status: "unauthenticated" });
    }
  }, []);

  const login = () => {
    const redirectUri = encodeURIComponent(window.location.href);
    const clientId = "3xITIQcKr563qgHhJWvzy8-arM2T-w1NfyDuChP7z9w";
    const authUrl = `https://app.ynab.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=`;
    window.location.href = authUrl;
  };

  const logout = () => {
    setAuthState({ status: "unauthenticated" });
    localStorage.removeItem("ynab_access_token");
    if (authState.status === "authenticated") {
      localStorage.removeItem(`${authState.user.id}-selected_budget_id`);
    }
  };

  return { authState, login, logout };
};
interface YnabAuthContextProps {
  authState: Authentication;
  login: () => void;
  logout: () => void;
}

const YnabAuthContext = createContext<YnabAuthContextProps | undefined>(undefined);

export const YnabAuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { authState, login, logout } = useYnabAuth();

  return (
    <YnabAuthContext.Provider value={{ authState, login, logout }}>
      {children}
    </YnabAuthContext.Provider>
  );
};

export const useYnabAuthContext = () => {
  const context = useContext(YnabAuthContext);
  if (!context) {
    throw new Error("useYnabAuthContext must be used within a YnabAuthProvider");
  }
  return context;
};
