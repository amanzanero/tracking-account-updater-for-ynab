import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useUpdateYnabTrackingAccounts,
  useYnabAccounts,
  useYnabBudgets,
} from "@/lib/ynab-apiclient";
import { createFileRoute } from "@tanstack/react-router";
import AccountTable from "@/components/AccountTable";
import { useYnabAuthContext, YnabAuthProvider } from "@/lib/auth";

const queryClient = new QueryClient();

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YnabAuthProvider>
        <InnerApp />
      </YnabAuthProvider>
    </QueryClientProvider>
  );
}

function InnerApp() {
  const { authState, login, logout } = useYnabAuthContext();
  const [selectedBudgetId, setSelectedBudgetId] = React.useState<string | null>(null);

  useEffect(() => {
    if (authState.status === "authenticated" && authState.selectedBudgetId !== null) {
      setSelectedBudgetId(authState.selectedBudgetId);
    }
  }, [authState]);

  const [accountBalanceUpdates, setAccountBalanceUpdates] = React.useState<{
    [key: string]: number;
  }>({});
  const onUpdateAccountBalance = (id: string, balance: string) => {
    const balanceInt = parseFloat(balance);
    if (!isNaN(balanceInt)) {
      setAccountBalanceUpdates((prev) => ({ ...prev, [id]: balanceInt }));
    }
  };

  const budgetsQuery = useYnabBudgets();
  const accountsQuery = useYnabAccounts(selectedBudgetId);
  const newTransactionsMutation = useUpdateYnabTrackingAccounts(selectedBudgetId);

  const trackingAccounts = React.useMemo(() => {
    return (
      accountsQuery.data?.data.accounts.filter((account) => account.type === "otherAsset") ?? null
    );
  }, [accountsQuery.data]);

  const accountBalanceUpdatesArray = React.useMemo(() => {
    return Object.entries(accountBalanceUpdates).reduce(
      (acc, [id, balance]) => {
        // make sure to only submit updates if balances are different from the original
        const originalBalance = trackingAccounts?.find((account) => account.id === id)?.balance;
        if (originalBalance !== balance * 1000) {
          acc.push({
            id,
            // the balance is the difference between the original and the new balance
            amount: balance * 1000 - (originalBalance ?? 0),
          });
        }
        return acc;
      },
      [] as { id: string; amount: number }[]
    );
  }, [accountBalanceUpdates, trackingAccounts]);

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    newTransactionsMutation.mutate(accountBalanceUpdatesArray);
  };

  const LoginButton = () => {
    switch (authState.status) {
      case "pending":
        return (
          <Button onClick={login} disabled>
            Login
          </Button>
        );
      case "unauthenticated":
        return <Button onClick={login}>Login</Button>;
      case "authenticated":
        return null;
    }
  };

  return (
    <form className="w-full max-w-screen-md" onSubmit={onSubmit}>
      <div className="space-y-4 pb-4">
        <div className="flex justify-between">
          <h1 className="text-xl font-bold">Tracking Account Updater for YNAB</h1>
          {authState.status === "authenticated" && <Button onClick={logout}>Logout</Button>}
        </div>
        <LoginButton />
        {budgetsQuery.isSuccess && budgetsQuery.data !== null ? (
          <Select onValueChange={setSelectedBudgetId} value={selectedBudgetId ?? undefined}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a budget" />
            </SelectTrigger>
            <SelectContent>
              {budgetsQuery.data.data.budgets.map((budget) => (
                <SelectItem key={budget.id} value={budget.id}>
                  {budget.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
        {trackingAccounts && (
          <AccountTable
            accounts={trackingAccounts}
            onAccountBalanceUpdate={onUpdateAccountBalance}
          />
        )}
        {trackingAccounts && trackingAccounts.length > 0 && (
          <Button
            type="submit"
            className="w-full"
            disabled={accountBalanceUpdatesArray.length === 0 || newTransactionsMutation.isPending}
          >
            Submit
          </Button>
        )}
      </div>
    </form>
  );
}

export default App;
