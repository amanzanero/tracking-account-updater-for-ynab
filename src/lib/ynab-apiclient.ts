import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import * as ynab from "ynab";

export const useYnabBudgets = (ynabToken: string | null) => {
  const ynabApi = React.useMemo(
    () => (ynabToken ? new ynab.API(ynabToken) : null),
    [ynabToken]
  );
  return useQuery({
    queryKey: ["ynab-budgets", ynabToken],
    queryFn: async () => {
      if (!ynabApi) return null;
      return await ynabApi.budgets.getBudgets();
    },
  });
};

export const useYnabAccounts = (
  ynabToken: string | null,
  budgetId: string | null
) => {
  const ynabApi = React.useMemo(
    () => (ynabToken ? new ynab.API(ynabToken) : null),
    [ynabToken]
  );
  return useQuery({
    queryKey: ["ynab-accounts", ynabToken, budgetId],
    queryFn: async () => {
      if (!ynabApi) return null;
      if (!budgetId) return null;
      return await ynabApi.accounts.getAccounts(budgetId);
    },
  });
};

export const useUpdateYnabTrackingAccounts = (
  ynabToken: string | null,
  budgetId: string | null
) => {
  const ynabApi = React.useMemo(
    () => (ynabToken ? new ynab.API(ynabToken) : null),
    [ynabToken]
  );
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      trackingAccountUpdates: { id: string; amount: number }[]
    ) => {
      if (!budgetId) return;
      if (!ynabApi) return;

      const payeeId = (
        await ynabApi.payees.getPayees(budgetId)
      ).data.payees.find((p) => p.name === "Reconciliation Balance Adjustment");

      if (!payeeId)
        throw new Error("Could not find payee to use for adjustment");

      await ynabApi.transactions.createTransactions(budgetId, {
        transactions: trackingAccountUpdates.map((update) => ({
          account_id: update.id,
          date: new Date().toISOString().split("T")[0], // today
          amount: update.amount,
          payee_id: payeeId.id,
          cleared: "reconciled",
          memo: "Manually entered by ynab-tracking-updater",
        })),
      });
    },
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: ["ynab-accounts", ynabToken, budgetId],
      });
    },
  });
};
