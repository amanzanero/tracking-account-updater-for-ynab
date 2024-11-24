import React from "react";
import type * as ynab from "ynab";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

const queryClient = new QueryClient();

const AccountTable: React.FC<{
  accounts: ynab.Account[];
  onAccountBalanceUpdate?: (id: string, balance: string) => void;
}> = ({ accounts, onAccountBalanceUpdate: onChange }) => {
  if (accounts.length === 0) {
    return <div>No tracking accounts for selected budget.</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Account Name</TableHead>
          <TableHead>Balance</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {accounts.map((account) => (
          <TableRow key={account.id}>
            <TableCell>{account.name}</TableCell>
            <TableCell>
              <Input
                type="number"
                step="0.01"
                defaultValue={account.balance / 1000}
                onChange={(e) => onChange?.(account.id, e.target.value)}
                placeholder="Enter balance"
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <InnerApp />
    </QueryClientProvider>
  );
}

function InnerApp() {
  const [ynabApiToken, setYnabApiToken] = React.useState<string | null>(null);
  const [editingYnabApiToken, setEditingYnabApiToken] =
    React.useState<string>("");
  const [selectedBudgetId, setSelectedBudgetId] = React.useState<string | null>(
    null
  );
  const [accountBalanceUpdates, setAccountBalanceUpdates] = React.useState<{
    [key: string]: number;
  }>({});
  const onUpdateAccountBalance = (id: string, balance: string) => {
    const balanceInt = parseFloat(balance);
    if (!isNaN(balanceInt)) {
      setAccountBalanceUpdates((prev) => ({ ...prev, [id]: balanceInt }));
    }
  };

  const budgetsQuery = useYnabBudgets(ynabApiToken);
  const accountsQuery = useYnabAccounts(ynabApiToken, selectedBudgetId);
  const newTransactionsMutation = useUpdateYnabTrackingAccounts(
    ynabApiToken,
    selectedBudgetId
  );

  const trackingAccounts = React.useMemo(() => {
    return (
      accountsQuery.data?.data.accounts.filter(
        (account) => account.type === "otherAsset"
      ) ?? null
    );
  }, [accountsQuery.data]);

  const accountBalanceUpdatesArray = React.useMemo(() => {
    return Object.entries(accountBalanceUpdates).reduce(
      (acc, [id, balance]) => {
        // make sure to only submit updates if balances are different from the original
        const originalBalance = trackingAccounts?.find(
          (account) => account.id === id
        )?.balance;
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

  const onUpdateToken: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    setYnabApiToken(editingYnabApiToken);
  };

  // function that replaces characters with asterisks except the last 5
  const maskString = (str: string) => {
    const masked = str.slice(0, -5).replace(/./g, "*");
    return masked + str.slice(-5);
  };

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    console.log("submitting");

    console.log("updates", accountBalanceUpdatesArray);
    newTransactionsMutation.mutate(accountBalanceUpdatesArray);
  };

  return (
    <div className="min-h-screen w-full flex justify-center p-2">
      <form className="w-full max-w-screen-lg" onSubmit={onSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Brokerage Accounts Updater</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span>
                {ynabApiToken
                  ? `Using token ${maskString(ynabApiToken)}`
                  : "Please set a token"}
              </span>
            </div>
            <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:space-x-4 sm:items-end">
              <div className="w-full">
                <label
                  htmlFor="token"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Personal Access Token
                </label>
                <Input
                  id="token"
                  type="password"
                  value={editingYnabApiToken}
                  onChange={(e) => setEditingYnabApiToken(e.target.value)}
                  placeholder="Enter your personal access token"
                />
              </div>
              <Button onClick={onUpdateToken}>Update Token</Button>
            </div>
            {budgetsQuery.isSuccess && budgetsQuery.data !== null ? (
              <Select onValueChange={setSelectedBudgetId}>
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
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={
                accountBalanceUpdatesArray.length === 0 ||
                newTransactionsMutation.isPending
              }
            >
              Submit
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

export default App;
