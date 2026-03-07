import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminStatsCard } from "./AdminStatsCard";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, DollarSign, CreditCard, Coins } from "lucide-react";

interface Purchase {
  id: string;
  type: string;
  credits: number;
  amountCents: number;
  stripeSessionId: string | null;
  createdAt: string;
  company: { companyName: string; email: string } | null;
}

interface Summary {
  totalRevenueCents: number;
  totalCreditsSold: number;
  activeSubscriptions: number;
}

export function RevenueTab() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [typeFilter, setTypeFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<Summary>({ totalRevenueCents: 0, totalCreditsSold: 0, activeSubscriptions: 0 });

  const formatCurrency = (cents: number) =>
    `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0 })}`;

  const fetchRevenue = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (typeFilter !== "all") params.set("type", typeFilter);

    fetch(`/api/admin/revenue?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setPurchases(d.data);
        setTotal(d.total);
        setTotalPages(d.totalPages);
        setSummary(d.summary);
      })
      .finally(() => setLoading(false));
  }, [page, typeFilter]);

  useEffect(() => { fetchRevenue(); }, [fetchRevenue]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AdminStatsCard
          label="Total Revenue"
          value={formatCurrency(summary.totalRevenueCents)}
          icon={DollarSign}
        />
        <AdminStatsCard
          label="Credits Sold"
          value={summary.totalCreditsSold}
          icon={Coins}
        />
        <AdminStatsCard
          label="Active Subscriptions"
          value={summary.activeSubscriptions}
          icon={CreditCard}
        />
      </div>

      <div className="flex items-center gap-3">
        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="CREDIT_PACK">Credit Packs</SelectItem>
            <SelectItem value="SUBSCRIPTION">Subscriptions</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Credits</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">Loading...</TableCell>
              </TableRow>
            ) : purchases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">No purchases found.</TableCell>
              </TableRow>
            ) : (
              purchases.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div>
                      <span className="font-medium">{p.company?.companyName || "—"}</span>
                      {p.company?.email && (
                        <span className="text-slate-500 text-xs block">{p.company.email}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      p.type === "SUBSCRIPTION"
                        ? "text-primary border-primary/30"
                        : "text-secondary border-secondary/30"
                    }>
                      {p.type === "CREDIT_PACK" ? "Credit Pack" : "Subscription"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{p.credits}</TableCell>
                  <TableCell className="font-semibold">{formatCurrency(p.amountCents)}</TableCell>
                  <TableCell className="text-slate-500 text-xs">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>{total} purchases total</span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span>Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
