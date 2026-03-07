import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverviewTab } from "@/components/admin/OverviewTab";
import { CompaniesTab } from "@/components/admin/CompaniesTab";
import { CandidatesTab } from "@/components/admin/CandidatesTab";
import { ApplicationsTab } from "@/components/admin/ApplicationsTab";
import { RevenueTab } from "@/components/admin/RevenueTab";
import { JobsTab } from "@/components/admin/JobsTab";
import { requireAdmin } from "@/server/utils/admin-ssr";
import {
  LayoutDashboard, Building2, UserCheck, FileText, DollarSign, Briefcase,
} from "lucide-react";

const VALID_TABS = ["overview", "companies", "candidates", "applications", "revenue", "jobs"] as const;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return requireAdmin(ctx);
};

export default function AdminDashboard() {
  const router = useRouter();
  const rawTab = typeof router.query.tab === "string" ? router.query.tab : "overview";
  const activeTab = VALID_TABS.includes(rawTab as typeof VALID_TABS[number]) ? rawTab : "overview";

  const handleTabChange = (value: string) => {
    router.push({ pathname: "/admin", query: value === "overview" ? {} : { tab: value } }, undefined, { shallow: true });
  };

  return (
    <>
      <SEO title="Admin Dashboard — ResourceMatch" />
      <AdminLayout>
        <div className="mb-6">
          <h1 className="text-2xl font-heading font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your platform</p>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="bg-white border">
            <TabsTrigger value="overview" className="gap-1.5">
              <LayoutDashboard className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="companies" className="gap-1.5">
              <Building2 className="w-4 h-4" />
              Companies
            </TabsTrigger>
            <TabsTrigger value="candidates" className="gap-1.5">
              <UserCheck className="w-4 h-4" />
              Candidates
            </TabsTrigger>
            <TabsTrigger value="applications" className="gap-1.5">
              <FileText className="w-4 h-4" />
              Applications
            </TabsTrigger>
            <TabsTrigger value="revenue" className="gap-1.5">
              <DollarSign className="w-4 h-4" />
              Revenue
            </TabsTrigger>
            <TabsTrigger value="jobs" className="gap-1.5">
              <Briefcase className="w-4 h-4" />
              Jobs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview"><OverviewTab /></TabsContent>
          <TabsContent value="companies"><CompaniesTab /></TabsContent>
          <TabsContent value="candidates"><CandidatesTab /></TabsContent>
          <TabsContent value="applications"><ApplicationsTab /></TabsContent>
          <TabsContent value="revenue"><RevenueTab /></TabsContent>
          <TabsContent value="jobs"><JobsTab /></TabsContent>
        </Tabs>
      </AdminLayout>
    </>
  );
}
