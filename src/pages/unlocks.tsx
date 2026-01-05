import { useState } from "react";
import { SEO } from "@/components/SEO";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Download,
  Mail,
  Phone,
  Eye,
  CheckCircle2,
  Clock,
  FileText,
  TrendingUp,
  Users,
  UserCheck,
  Percent,
  Unlock,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

interface UnlockedCandidate {
  id: string;
  name: string;
  title: string;
  avatar: string;
  email: string;
  phone: string;
  unlockedAt: string;
  contacted: boolean;
}

export default function MyUnlocks() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "contacted" | "not-contacted">("all");

  // Mock unlocked candidates (in real app, this would come from backend/context)
  const [unlockedCandidates] = useState<UnlockedCandidate[]>([
    {
      id: "1",
      name: "Maria Christina Santos",
      title: "Senior Full-Stack Developer",
      avatar: "MC",
      email: "maria.santos@example.com",
      phone: "+63 917 123 4567",
      unlockedAt: "2025-01-05",
      contacted: true,
    },
    {
      id: "2",
      name: "Jose Rodriguez",
      title: "UI/UX Designer",
      avatar: "JR",
      email: "jose.rodriguez@example.com",
      phone: "+63 918 234 5678",
      unlockedAt: "2025-01-04",
      contacted: false,
    },
    {
      id: "3",
      name: "Anna Sophia Cruz",
      title: "DevOps Engineer",
      avatar: "AS",
      email: "anna.cruz@example.com",
      phone: "+63 919 345 6789",
      unlockedAt: "2025-01-03",
      contacted: true,
    },
  ]);

  const [contactedStatus, setContactedStatus] = useState<Record<string, boolean>>(
    unlockedCandidates.reduce((acc, c) => ({ ...acc, [c.id]: c.contacted }), {})
  );

  const filteredCandidates = unlockedCandidates.filter((candidate) => {
    const matchesSearch =
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "contacted" && contactedStatus[candidate.id]) ||
      (filterStatus === "not-contacted" && !contactedStatus[candidate.id]);

    return matchesSearch && matchesFilter;
  });

  const stats = {
    totalUnlocked: unlockedCandidates.length,
    contacted: Object.values(contactedStatus).filter(Boolean).length,
    responseRate: 72, // Placeholder percentage
  };

  const handleExportCSV = () => {
    const csvContent = [
      ["Name", "Title", "Email", "Phone", "Unlocked Date", "Contacted"],
      ...filteredCandidates.map((c) => [
        c.name,
        c.title,
        c.email,
        c.phone,
        c.unlockedAt,
        contactedStatus[c.id] ? "Yes" : "No",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "unlocked-candidates.csv";
    a.click();
  };

  const toggleContacted = (candidateId: string) => {
    setContactedStatus((prev) => ({
      ...prev,
      [candidateId]: !prev[candidateId],
    }));
  };

  return (
    <>
      <SEO
        title="My Unlocked Profiles - ResourceMatch"
        description="Manage your unlocked candidate profiles and contact information"
      />

      <div className="min-h-screen bg-slate-50">
        <DashboardHeader />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">My Unlocked Profiles</h1>
            <p className="text-slate-600">
              Manage and track all candidates you've unlocked
            </p>
          </div>

          {unlockedCandidates.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-xl border-2 border-dashed border-slate-300 p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Unlock className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                No profiles unlocked yet
              </h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                Browse our talent pool and unlock candidate profiles to access their full
                contact information and resume.
              </p>
              <Link href="/dashboard">
                <Button className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white">
                  Browse Candidates
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Total Unlocked</span>
                    <Users className="w-5 h-5 text-teal-600" />
                  </div>
                  <p className="text-3xl font-bold text-slate-900">{stats.totalUnlocked}</p>
                  <p className="text-xs text-slate-500 mt-1">Active profiles</p>
                </div>

                <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Contacted</span>
                    <UserCheck className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-3xl font-bold text-slate-900">{stats.contacted}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {stats.totalUnlocked - stats.contacted} pending
                  </p>
                </div>

                <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Response Rate</span>
                    <Percent className="w-5 h-5 text-orange-600" />
                  </div>
                  <p className="text-3xl font-bold text-slate-900">{stats.responseRate}%</p>
                  <p className="text-xs text-slate-500 mt-1">Last 30 days</p>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search by name, title, or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select
                    value={filterStatus}
                    onValueChange={(value: any) => setFilterStatus(value)}
                  >
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Profiles</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="not-contacted">Not Contacted</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline" onClick={handleExportCSV}>
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </div>

              {/* Candidates Table */}
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Contact Info</TableHead>
                      <TableHead>Unlocked Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCandidates.map((candidate) => (
                      <TableRow key={candidate.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-semibold text-sm">
                              {candidate.avatar}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">
                                {candidate.name}
                              </p>
                              <p className="text-sm text-slate-600">{candidate.title}</p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-700">{candidate.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-700">{candidate.phone}</span>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Clock className="w-4 h-4" />
                            {new Date(candidate.unlockedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </div>
                        </TableCell>

                        <TableCell>
                          {contactedStatus[candidate.id] ? (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Contacted
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <Clock className="w-3 h-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/profile/${candidate.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </Link>
                            <Button variant="outline" size="sm">
                              <FileText className="w-4 h-4 mr-1" />
                              Resume
                            </Button>
                            <Button
                              variant={contactedStatus[candidate.id] ? "secondary" : "default"}
                              size="sm"
                              onClick={() => toggleContacted(candidate.id)}
                              className={
                                !contactedStatus[candidate.id]
                                  ? "bg-teal-600 hover:bg-teal-700"
                                  : ""
                              }
                            >
                              {contactedStatus[candidate.id] ? "Unmark" : "Mark Contacted"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredCandidates.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-slate-600">No candidates match your filters</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}