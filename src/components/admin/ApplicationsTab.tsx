import { useCallback, useEffect, useState } from "react";
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
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Download } from "lucide-react";

interface Application {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  linkedInUrl: string | null;
  vertical: string;
  experience: number;
  resumeText: string | null;
  resumeUrl: string | null;
  skills: string[];
  bio: string | null;
  status: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  PENDING: "text-yellow-700 border-yellow-200 bg-yellow-50",
  REVIEWING: "text-blue-700 border-blue-200 bg-blue-50",
  APPROVED: "text-green-700 border-green-200 bg-green-50",
  REJECTED: "text-red-700 border-red-200 bg-red-50",
};

export function ApplicationsTab() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Application | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [conversionResult, setConversionResult] = useState<{ converted: boolean; error?: string } | null>(null);

  const fetchApplications = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (statusFilter !== "all") params.set("status", statusFilter);

    fetch(`/api/admin/applications?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setApplications(d.data);
        setTotal(d.total);
        setTotalPages(d.totalPages);
      })
      .finally(() => setLoading(false));
  }, [page, statusFilter]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  const updateStatus = async (id: string, status: string) => {
    setActionLoading(true);
    setConversionResult(null);
    const res = await fetch(`/api/admin/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    setActionLoading(false);

    if (status === "APPROVED") {
      if (data.converted) {
        setConversionResult({ converted: true });
        setTimeout(() => { setDialogOpen(false); setConversionResult(null); }, 2000);
      } else if (data.conversionError) {
        setConversionResult({ converted: false, error: data.conversionError });
      } else {
        setDialogOpen(false);
      }
    } else {
      setDialogOpen(false);
    }
    fetchApplications();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="REVIEWING">Reviewing</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.open("/api/admin/export?type=applications", "_blank")}>
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      <div className="bg-white rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Vertical</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Applied</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">Loading...</TableCell>
              </TableRow>
            ) : applications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">No applications found.</TableCell>
              </TableRow>
            ) : (
              applications.map((app) => (
                <TableRow
                  key={app.id}
                  className="cursor-pointer"
                  onClick={() => { setSelected(app); setDialogOpen(true); }}
                >
                  <TableCell className="font-medium">{app.fullName}</TableCell>
                  <TableCell className="text-slate-500">{app.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-primary border-primary/30">
                      {app.vertical.replace("_", " & ")}
                    </Badge>
                  </TableCell>
                  <TableCell>{app.experience} yrs</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[app.status] || ""}>
                      {app.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-500 text-xs">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>{total} applications total</span>
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
            <DialogTitle>{selected?.fullName}</DialogTitle>
            <DialogDescription>{selected?.email}</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-500">Vertical</span>
                  <p className="font-medium">{selected.vertical}</p>
                </div>
                <div>
                  <span className="text-slate-500">Experience</span>
                  <p className="font-medium">{selected.experience} years</p>
                </div>
                <div>
                  <span className="text-slate-500">Phone</span>
                  <p className="font-medium">{selected.phone || "—"}</p>
                </div>
                <div>
                  <span className="text-slate-500">LinkedIn</span>
                  {selected.linkedInUrl ? (
                    <a href={selected.linkedInUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline block truncate">
                      {selected.linkedInUrl}
                    </a>
                  ) : (
                    <p className="font-medium">—</p>
                  )}
                </div>
              </div>

              {selected.skills.length > 0 && (
                <div>
                  <span className="text-slate-500">Skills</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selected.skills.map((s) => (
                      <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {selected.bio && (
                <div>
                  <span className="text-slate-500">Bio</span>
                  <p className="mt-1 text-slate-700 whitespace-pre-wrap">{selected.bio}</p>
                </div>
              )}

              {selected.resumeUrl && (
                <div>
                  <span className="text-slate-500">Resume</span>
                  <a
                    href={selected.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 text-primary underline text-sm block"
                  >
                    View Resume (PDF)
                  </a>
                </div>
              )}

              {!selected.resumeUrl && selected.resumeText && (
                <div>
                  <span className="text-slate-500">Resume (Text)</span>
                  <p className="mt-1 text-slate-700 whitespace-pre-wrap max-h-40 overflow-y-auto text-xs bg-slate-50 p-2 rounded">
                    {selected.resumeText}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between border-t pt-3">
                <Badge variant="outline" className={statusColors[selected.status] || ""}>
                  {selected.status}
                </Badge>
                <div className="flex gap-2">
                  {selected.status !== "APPROVED" && (
                    <Button
                      size="sm"
                      disabled={actionLoading}
                      onClick={() => updateStatus(selected.id, "APPROVED")}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                    </Button>
                  )}
                  {selected.status !== "REJECTED" && (
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={actionLoading}
                      onClick={() => updateStatus(selected.id, "REJECTED")}
                    >
                      <XCircle className="w-4 h-4 mr-1" /> Reject
                    </Button>
                  )}
                </div>
              </div>

              {conversionResult?.converted && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  Candidate account created successfully.
                </div>
              )}
              {conversionResult?.converted === false && conversionResult.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-center gap-2">
                  <XCircle className="w-4 h-4 flex-shrink-0" />
                  Conversion failed: {conversionResult.error}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
