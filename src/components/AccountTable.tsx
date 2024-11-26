import React from "react";
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
  accounts: { id: string; name: string; balance: number; edited?: boolean }[];
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
            <TableCell>
              {account.name}
              {account.edited ? (
                <>
                  &nbsp;<span className="font-bold">(Updated)</span>
                </>
              ) : null}
            </TableCell>
            <TableCell>
              <Input
                type="number"
                step="0.01"
                value={isNaN(account.balance) ? "" : account.balance}
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
