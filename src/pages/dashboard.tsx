import { useState } from "react";
import { SEO } from "@/components/SEO";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { AIBanner } from "@/components/dashboard/AIBanner";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { SearchFilters } from "@/components/dashboard/SearchFilters";
import { CandidateResults } from "@/components/dashboard/CandidateResults";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("all");
  const [availability, setAvailability] = useState("all");
  const [hourlyRate, setHourlyRate] = useState("all");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  // Mock candidates data
  const allCandidates = [
    {
      id: 1,
      name: "Maria Santos",
      title: "Senior Full-Stack Developer",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
      experience: "7 years",
      availability: "Full-time",
      hourlyRate: 25,
      skills: ["React", "Node.js", "TypeScript", "PostgreSQL"],
      location: "Manila, Philippines",
      rating: 4.9,
      completedProjects: 47,
    },
    {
      id: 2,
      name: "Juan Dela Cruz",
      title: "UI/UX Designer",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
      experience: "5 years",
      availability: "Part-time",
      hourlyRate: 20,
      skills: ["Figma", "Adobe XD", "Prototyping", "User Research"],
      location: "Cebu, Philippines",
      rating: 4.8,
      completedProjects: 32,
    },
    {
      id: 3,
      name: "Ana Reyes",
      title: "Digital Marketing Specialist",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
      experience: "4 years",
      availability: "Full-time",
      hourlyRate: 18,
      skills: ["SEO", "Google Ads", "Content Marketing", "Analytics"],
      location: "Davao, Philippines",
      rating: 4.7,
      completedProjects: 28,
    },
    {
      id: 4,
      name: "Carlos Rodriguez",
      title: "DevOps Engineer",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
      experience: "6 years",
      availability: "Full-time",
      hourlyRate: 28,
      skills: ["AWS", "Docker", "Kubernetes", "CI/CD"],
      location: "Quezon City, Philippines",
      rating: 4.9,
      completedProjects: 41,
    },
    {
      id: 5,
      name: "Sofia Mendoza",
      title: "Content Writer & Editor",
      avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400",
      experience: "3 years",
      availability: "Part-time",
      hourlyRate: 15,
      skills: ["Copywriting", "SEO Writing", "Editing", "Research"],
      location: "Iloilo, Philippines",
      rating: 4.6,
      completedProjects: 22,
    },
    {
      id: 6,
      name: "Miguel Torres",
      title: "Mobile App Developer",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
      experience: "5 years",
      availability: "Full-time",
      hourlyRate: 24,
      skills: ["React Native", "Flutter", "iOS", "Android"],
      location: "Makati, Philippines",
      rating: 4.8,
      completedProjects: 35,
    },
    {
      id: 7,
      name: "Isabella Garcia",
      title: "Project Manager",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
      experience: "8 years",
      availability: "Full-time",
      hourlyRate: 30,
      skills: ["Agile", "Scrum", "Jira", "Team Leadership"],
      location: "Pasig, Philippines",
      rating: 4.9,
      completedProjects: 52,
    },
    {
      id: 8,
      name: "Roberto Cruz",
      title: "Data Analyst",
      avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400",
      experience: "4 years",
      availability: "Part-time",
      hourlyRate: 22,
      skills: ["Python", "SQL", "Tableau", "Power BI"],
      location: "Taguig, Philippines",
      rating: 4.7,
      completedProjects: 29,
    },
    {
      id: 9,
      name: "Jasmine Flores",
      title: "Customer Success Manager",
      avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400",
      experience: "5 years",
      availability: "Full-time",
      hourlyRate: 19,
      skills: ["Support", "CRM", "Client Relations", "Training"],
      location: "Bacolod, Philippines",
      rating: 4.8,
      completedProjects: 38,
    },
    {
      id: 10,
      name: "Daniel Santos",
      title: "Backend Developer",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
      experience: "6 years",
      availability: "Full-time",
      hourlyRate: 26,
      skills: ["Python", "Django", "PostgreSQL", "Redis"],
      location: "Manila, Philippines",
      rating: 4.9,
      completedProjects: 44,
    },
    {
      id: 11,
      name: "Elena Martinez",
      title: "Graphic Designer",
      avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400",
      experience: "4 years",
      availability: "Part-time",
      hourlyRate: 17,
      skills: ["Photoshop", "Illustrator", "Branding", "Print Design"],
      location: "Cagayan de Oro, Philippines",
      rating: 4.7,
      completedProjects: 31,
    },
    {
      id: 12,
      name: "Rafael Bautista",
      title: "QA Engineer",
      avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400",
      experience: "5 years",
      availability: "Full-time",
      hourlyRate: 21,
      skills: ["Selenium", "Jest", "Cypress", "API Testing"],
      location: "Quezon City, Philippines",
      rating: 4.8,
      completedProjects: 36,
    },
  ];

  // Filter candidates based on search and filters
  const filteredCandidates = allCandidates.filter((candidate) => {
    const matchesSearch =
      searchQuery === "" ||
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.skills.some((skill) =>
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesExperience =
      experienceLevel === "all" ||
      (experienceLevel === "entry" && parseInt(candidate.experience) <= 2) ||
      (experienceLevel === "mid" &&
        parseInt(candidate.experience) >= 3 &&
        parseInt(candidate.experience) <= 5) ||
      (experienceLevel === "senior" && parseInt(candidate.experience) >= 6);

    const matchesAvailability =
      availability === "all" || candidate.availability.toLowerCase().includes(availability);

    const matchesRate =
      hourlyRate === "all" ||
      (hourlyRate === "8-15" && candidate.hourlyRate >= 8 && candidate.hourlyRate <= 15) ||
      (hourlyRate === "15-20" && candidate.hourlyRate > 15 && candidate.hourlyRate <= 20) ||
      (hourlyRate === "20-25" && candidate.hourlyRate > 20 && candidate.hourlyRate <= 25) ||
      (hourlyRate === "25-30" && candidate.hourlyRate > 25 && candidate.hourlyRate <= 30);

    const matchesSkills =
      selectedSkills.length === 0 ||
      selectedSkills.every((skill) =>
        candidate.skills.some((candidateSkill) =>
          candidateSkill.toLowerCase().includes(skill.toLowerCase())
        )
      );

    return (
      matchesSearch &&
      matchesExperience &&
      matchesAvailability &&
      matchesRate &&
      matchesSkills
    );
  });

  return (
    <>
      <SEO
        title="Dashboard - ResourceMatch"
        description="Find and connect with pre-vetted Filipino talent"
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/30">
        <DashboardHeader />
        <AIBanner />

        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <StatsCards />

          <div className="mt-8 space-y-6">
            <SearchFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              experienceLevel={experienceLevel}
              setExperienceLevel={setExperienceLevel}
              availability={availability}
              setAvailability={setAvailability}
              hourlyRate={hourlyRate}
              setHourlyRate={setHourlyRate}
              selectedSkills={selectedSkills}
              setSelectedSkills={setSelectedSkills}
            />

            <CandidateResults
              candidates={filteredCandidates}
              totalCount={filteredCandidates.length}
            />
          </div>
        </main>
      </div>
    </>
  );
}