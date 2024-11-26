import React from "react";
import type * as ynab from "ynab";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

export default AccountTable;
