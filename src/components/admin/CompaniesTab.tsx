import { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Search, ChevronLeft, ChevronRight, ShieldCheck, ShieldX, KeyRound } from "lucide-react";

interface Company {
  id: string;
  companyName: string;
  email: string;
  industry: string | null;
  credits: number;
  subscriptionTier: string | null;
  subscriptionStatus: string | null;
  verificationStatus: string;
  verified: boolean;
  createdAt: string;
  user: { email: string; createdAt: string; name: string | null };
  _count: { unlocks: number; jobs: number; creditPurchases: number };
}

interface CompanyDetail extends Company {
  user: {
    id: string;
    email: string;
    createdAt: string;
    name: string | null;
    failedLoginAttempts: number;
    lockedUntil: string | null;
  };
}

const verificationColors: Record<string, string> = {
  VERIFIED: "text-green-700 border-green-200 bg-green-50",
  REJECTED: "text-red-700 border-red-200 bg-red-50",
  PENDING: "text-yellow-700 border-yellow-200 bg-yellow-50",
  UNVERIFIED: "text-slate-500 border-slate-200",
};

export function CompaniesTab() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<CompanyDetail | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [resetPw, setResetPw] = useState("");
  const [resetMsg, setResetMsg] = useState("");

  const fetchCompanies = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);
    if (verificationFilter !== "all") params.set("verificationStatus", verificationFilter);

    fetch(`/api/admin/companies?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setCompanies(d.data);
        setTotal(d.total);
        setTotalPages(d.totalPages);
      })
      .finally(() => setLoading(false));
  }, [page, search, verificationFilter]);

  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

  const openDetail = async (id: string) => {
    const r = await fetch(`/api/admin/companies/${id}`);
    const data = await r.json();
    setSelected(data);
    setDialogOpen(true);
    setResetPw("");
    setResetMsg("");
  };

  const patchCompany = async (id: string, body: Record<string, unknown>) => {
    setActionLoading(true);
    await fetch(`/api/admin/companies/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setActionLoading(false);
    fetchCompanies();
    // Refresh detail
    const r = await fetch(`/api/admin/companies/${id}`);
    setSelected(await r.json());
  };

  const resetPassword = async () => {
    if (!selected || resetPw.length < 8) {
      setResetMsg("Password must be at least 8 characters");
      return;
    }
    setActionLoading(true);
    const r = await fetch(`/api/admin/users/${selected.user.id}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword: resetPw }),
    });
    const data = await r.json();
    setActionLoading(false);
    setResetMsg(data.success ? "Password reset successfully" : data.error || "Failed");
    setResetPw("");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search companies..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <Select value={verificationFilter} onValueChange={(v) => { setVerificationFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Verification" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="VERIFIED">Verified</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
            <SelectItem value="UNVERIFIED">Unverified</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>User Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Credits</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>Jobs</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">Loading...</TableCell>
              </TableRow>
            ) : companies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">No companies found.</TableCell>
              </TableRow>
            ) : (
              companies.map((c) => (
                <TableRow
                  key={c.id}
                  className="cursor-pointer"
                  onClick={() => openDetail(c.id)}
                >
                  <TableCell className="font-medium">{c.companyName}</TableCell>
                  <TableCell className="text-slate-500">{c.user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={verificationColors[c.verificationStatus] || ""}>
                      {c.verificationStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>{c.credits}</TableCell>
                  <TableCell>
                    {c.subscriptionTier ? (
                      <Badge variant="outline" className="text-primary border-primary/30">
                        {c.subscriptionTier}
                      </Badge>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>{c._count.jobs}</TableCell>
                  <TableCell className="text-slate-500 text-xs">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>{total} companies total</span>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected?.companyName}</DialogTitle>
            <DialogDescription>{selected?.user.email}</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-500">Industry</span>
                  <p className="font-medium">{selected.industry || "—"}</p>
                </div>
                <div>
                  <span className="text-slate-500">Credits</span>
                  <p className="font-medium">{selected.credits}</p>
                </div>
                <div>
                  <span className="text-slate-500">Subscription</span>
                  <p className="font-medium">{selected.subscriptionTier || "None"}</p>
                </div>
                <div>
                  <span className="text-slate-500">Status</span>
                  <Badge variant="outline" className={verificationColors[selected.verificationStatus] || ""}>
                    {selected.verificationStatus}
                  </Badge>
                </div>
                <div>
                  <span className="text-slate-500">Unlocks</span>
                  <p className="font-medium">{selected._count.unlocks}</p>
                </div>
                <div>
                  <span className="text-slate-500">Purchases</span>
                  <p className="font-medium">{selected._count.creditPurchases}</p>
                </div>
              </div>

              {selected.user.lockedUntil && new Date(selected.user.lockedUntil) > new Date() && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-xs">
                  Account locked until {new Date(selected.user.lockedUntil).toLocaleString()}
                  ({selected.user.failedLoginAttempts} failed attempts)
                </div>
              )}

              <div className="flex gap-2">
                {selected.verificationStatus !== "VERIFIED" ? (
                  <Button
                    size="sm"
                    disabled={actionLoading}
                    onClick={() => patchCompany(selected.id, { verified: true, verificationStatus: "VERIFIED" })}
                  >
                    <ShieldCheck className="w-4 h-4 mr-1" /> Verify
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={actionLoading}
                    onClick={() => patchCompany(selected.id, { verified: false, verificationStatus: "REJECTED" })}
                  >
                    <ShieldX className="w-4 h-4 mr-1" /> Revoke
                  </Button>
                )}
              </div>

              <div className="border-t pt-3">
                <p className="text-slate-500 mb-2 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5" /> Reset Password
                </p>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    placeholder="New password (min 8 chars)"
                    value={resetPw}
                    onChange={(e) => setResetPw(e.target.value)}
                    className="flex-1"
                  />
                  <Button size="sm" variant="outline" disabled={actionLoading} onClick={resetPassword}>
                    Reset
                  </Button>
                </div>
                {resetMsg && (
                  <p className={`text-xs mt-1 ${resetMsg.includes("success") ? "text-green-600" : "text-red-600"}`}>
                    {resetMsg}
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
