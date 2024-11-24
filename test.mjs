import path from "path";
import fs from "fs";
import * as ynab from "ynab";

// parse .env file using fs

const envPath = path.resolve(".env");
const env = fs.readFileSync(envPath, "utf-8");
const envLines = env.split("\n");
const envObj = envLines.reduce((acc, line) => {
  const [key, value] = line.split("=");
  acc[key] = value;
  return acc;
}, {});

const api = new ynab.API(envObj.YNAB_TOKEN);
const budgetId = envObj.BUDGET_ID;

const accounts = await api.accounts.getAccounts(budgetId);
const firstAccountTransactions =
  await api.transactions.getTransactionsByAccount(
    budgetId,
    accounts.data.accounts.filter((a) => a.type === "otherAsset")[0].id
  );
console.log(
  JSON.stringify(firstAccountTransactions.data.transactions, null, 2)
);

const payees = await api.payees.getPayees(budgetId);
console.log(
  JSON.stringify(
    {
      payees: payees.data.payees.filter(
        (p) => p.name === "Reconciliation Balance Adjustment"
      ),
    },
    null,
    2
  )
);
