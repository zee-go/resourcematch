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
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

interface VettingLayer {
  layer: string;
  score: number | null;
  passed: boolean;
}

interface Candidate {
  id: number;
  name: string;
  fullName: string | null;
  title: string;
  vertical: string;
  experience: number;
  availability: string;
  skills: string[];
  vettingScore: number | null;
  verified: boolean;
  email: string;
  phone: string | null;
  location: string | null;
  createdAt: string;
  vettingProfile: { status: string; overallScore: number | null } | null;
  vettingLayers: VettingLayer[];
  _count: { unlocks: number; jobApplications: number };
}

function getScoreColor(score: number | null) {
  if (score === null) return "text-slate-400";
  if (score >= 80) return "text-green-700";
  if (score >= 60) return "text-yellow-700";
  return "text-red-700";
}

export function CandidatesTab() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [vertical, setVertical] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchCandidates = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);
    if (vertical !== "all") params.set("vertical", vertical);

    fetch(`/api/admin/candidates?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setCandidates(d.data);
        setTotal(d.total);
        setTotalPages(d.totalPages);
      })
      .finally(() => setLoading(false));
  }, [page, search, vertical]);

  useEffect(() => { fetchCandidates(); }, [fetchCandidates]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search candidates..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <Select value={vertical} onValueChange={(v) => { setVertical(v); setPage(1); }}>
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
              <TableHead>Name</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Vertical</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Vetting Score</TableHead>
              <TableHead>Unlocks</TableHead>
              <TableHead>Applications</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">Loading...</TableCell>
              </TableRow>
            ) : candidates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">No candidates found.</TableCell>
              </TableRow>
            ) : (
              candidates.map((c) => (
                <TableRow
                  key={c.id}
                  className="cursor-pointer"
                  onClick={() => { setSelected(c); setDialogOpen(true); }}
                >
                  <TableCell className="font-medium">{c.fullName || c.name}</TableCell>
                  <TableCell className="text-slate-600">{c.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-primary border-primary/30">
                      {c.vertical.replace("_", " & ").replace("MANAGEMENT", "Mgmt").replace("FINANCE ACCOUNTING", "Finance")}
                    </Badge>
                  </TableCell>
                  <TableCell>{c.experience} yrs</TableCell>
                  <TableCell>
                    <span className={`font-semibold ${getScoreColor(c.vettingScore)}`}>
                      {c.vettingScore ?? "—"}
                    </span>
                  </TableCell>
                  <TableCell>{c._count.unlocks}</TableCell>
                  <TableCell>{c._count.jobApplications}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>{total} candidates total</span>
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
            <DialogTitle>{selected?.fullName || selected?.name}</DialogTitle>
            <DialogDescription>{selected?.title} — {selected?.email}</DialogDescription>
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
                  <span className="text-slate-500">Availability</span>
                  <p className="font-medium">{selected.availability}</p>
                </div>
                <div>
                  <span className="text-slate-500">Location</span>
                  <p className="font-medium">{selected.location || "—"}</p>
                </div>
                <div>
                  <span className="text-slate-500">Phone</span>
                  <p className="font-medium">{selected.phone || "—"}</p>
                </div>
                <div>
                  <span className="text-slate-500">Unlocks</span>
                  <p className="font-medium">{selected._count.unlocks}</p>
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

              <div>
                <span className="text-slate-500">Vetting Results</span>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Overall Score</span>
                    <span className={`font-bold text-lg ${getScoreColor(selected.vettingScore)}`}>
                      {selected.vettingScore ?? "Not vetted"}
                    </span>
                  </div>
                  {selected.vettingProfile && (
                    <Badge variant="outline" className="text-xs">
                      Status: {selected.vettingProfile.status}
                    </Badge>
                  )}
                  {selected.vettingLayers.length > 0 && (
                    <div className="space-y-1">
                      {selected.vettingLayers.map((layer) => (
                        <div key={layer.layer} className="flex items-center justify-between text-xs">
                          <span>{layer.layer.replace(/_/g, " ")}</span>
                          <div className="flex items-center gap-2">
                            <span className={getScoreColor(layer.score)}>
                              {layer.score ?? "—"}
                            </span>
                            <Badge
                              variant="outline"
                              className={layer.passed
                                ? "text-green-700 border-green-200 bg-green-50"
                                : "text-red-700 border-red-200 bg-red-50"
                              }
                            >
                              {layer.passed ? "Pass" : "Fail"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
