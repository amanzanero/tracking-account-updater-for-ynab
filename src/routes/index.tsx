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
import { useUpdateYnabTrackingAccounts, useYnabAccounts, useYnabBudgets } from "@/lib/ynab-data";
import { createFileRoute } from "@tanstack/react-router";
import AccountTable from "@/components/AccountTable";
import { Authentication, useYnabAuthContext, YnabAuthProvider } from "@/lib/auth";

export const Route = createFileRoute("/")({
  component: App,
});

const queryClient = new QueryClient();

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
  const { authState, logout } = useYnabAuthContext();

  return (
    <div className="w-full max-w-screen-md">
      <div className="h-4" />
      {authState.status === "authenticated" ? (
        <LoggedIn authState={authState} logout={logout} />
      ) : (
        <LoggedOut authState={authState} />
      )}
    </div>
  );
}

const LoggedIn: React.FC<{
  authState: Authentication & { status: "authenticated" };
  logout: () => void;
}> = ({ authState, logout }) => {
  const [selectedBudgetId, setSelectedBudgetId] = React.useState<string | null>(null);

  useEffect(() => {
    if (authState.selectedBudgetId !== null) {
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

  const onReset: React.MouseEventHandler = (e) => {
    e.preventDefault();
    setAccountBalanceUpdates({});
    accountsQuery.refetch();
  };

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

  return (
    <>
      <h1 className="font-extrabold text-4xl sm:text-5xl">Tracking Account Updater for YNAB</h1>
      <div className="h-6" />
      <div className="w-full flex sm:justify-end">
        <Button size="lg" className="w-full sm:w-auto" onClick={logout}>
          Logout
        </Button>
      </div>
      <div className="h-4" />
      <form className="space-y-4" onSubmit={onSubmit}>
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
          <>
            <Button onClick={onReset}>Reset balances to YNAB values</Button>
            <AccountTable
              accounts={trackingAccounts}
              onAccountBalanceUpdate={onUpdateAccountBalance}
            />
          </>
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
      </form>
    </>
  );
};

const LoggedOut: React.FC<{
  authState: Authentication & { status: "unauthenticated" | "pending" };
}> = ({ authState }) => {
  const { login } = useYnabAuthContext();
  return (
    <div className="w-full">
      <div className="bg-neutral-100 dark:bg-neutral-800 py-16 px-8 rounded-lg">
        <div className="mx-auto text-center">
          <h1 className="font-extrabold text-4xl sm:text-5xl">Tracking Account Updater for YNAB</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Easily update the balances on all your tracking accounts in bulk. No need to go and
            reconcile each account one by one.
          </p>
          <div className="mt-6">
            <Button onClick={login} size="lg" disabled={authState.status === "pending"}>
              Get started
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
