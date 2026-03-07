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
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

interface Job {
  id: string;
  title: string;
  vertical: string;
  status: string;
  availability: string;
  salaryMin: number | null;
  salaryMax: number | null;
  location: string | null;
  publishedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  company: { companyName: string; email: string };
  _count: { applications: number };
}

const statusColors: Record<string, string> = {
  OPEN: "text-green-700 border-green-200 bg-green-50",
  CLOSED: "text-red-700 border-red-200 bg-red-50",
  DRAFT: "text-slate-500 border-slate-200 bg-slate-50",
};

export function JobsTab() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [verticalFilter, setVerticalFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchJobs = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (verticalFilter !== "all") params.set("vertical", verticalFilter);

    fetch(`/api/admin/jobs?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setJobs(d.data);
        setTotal(d.total);
        setTotalPages(d.totalPages);
      })
      .finally(() => setLoading(false));
  }, [page, search, statusFilter, verticalFilter]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const toggleJobStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "OPEN" ? "CLOSED" : "OPEN";
    setActionLoading(id);
    await fetch(`/api/admin/jobs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setActionLoading(null);
    fetchJobs();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="OPEN">Open</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
          </SelectContent>
        </Select>
        <Select value={verticalFilter} onValueChange={(v) => { setVerticalFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Vertical" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Verticals</SelectItem>
            <SelectItem value="FINANCE_ACCOUNTING">Finance & Accounting</SelectItem>
            <SelectItem value="OPERATIONS_MANAGEMENT">Operations Management</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Vertical</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Applications</TableHead>
              <TableHead>Posted</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">Loading...</TableCell>
              </TableRow>
            ) : jobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">No jobs found.</TableCell>
              </TableRow>
            ) : (
              jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.title}</TableCell>
                  <TableCell className="text-slate-600">{job.company.companyName}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-primary border-primary/30">
                      {job.vertical.replace("_", " & ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[job.status] || ""}>
                      {job.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{job._count.applications}</TableCell>
                  <TableCell className="text-slate-500 text-xs">
                    {job.publishedAt
                      ? new Date(job.publishedAt).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {job.status !== "DRAFT" && (
                      <Button
                        size="sm"
                        variant={job.status === "OPEN" ? "destructive" : "default"}
                        disabled={actionLoading === job.id}
                        onClick={() => toggleJobStatus(job.id, job.status)}
                      >
                        {job.status === "OPEN" ? "Close" : "Reopen"}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>{total} jobs total</span>
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
