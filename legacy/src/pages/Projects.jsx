import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";

export default function Projects() {
  const [user, setUser] = useState(null);
  const [locale, setLocale] = useState('fr');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setLocale(currentUser.locale || 'fr');
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects', user?.organization_id],
    queryFn: () => {
      if (user?.user_role === 'officer') {
        return base44.entities.Project.list('-created_date');
      }
      return base44.entities.Project.filter(
        { organization_id: user?.organization_id },
        '-created_date'
      );
    },
    enabled: !!user
  });

  const t = (fr, en) => locale === 'fr' ? fr : en;

  const getStatusColor = (status) => {
    const colors = {
      draft: "bg-gray-100 text-gray-800",
      submitted: "bg-blue-100 text-blue-800",
      under_review: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      in_progress: "bg-purple-100 text-purple-800",
      completed: "bg-indigo-100 text-indigo-800",
      closed: "bg-gray-100 text-gray-600"
    };
    return colors[status] || colors.draft;
  };

  const getStatusLabel = (status) => {
    const labels = {
      draft: t("Brouillon", "Draft"),
      submitted: t("Soumis", "Submitted"),
      under_review: t("En révision", "Under Review"),
      approved: t("Approuvé", "Approved"),
      in_progress: t("En cours", "In Progress"),
      completed: t("Complété", "Completed"),
      closed: t("Fermé", "Closed")
    };
    return labels[status] || status;
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t("Mes projets", "My Projects")}
            </h1>
            <p className="text-gray-600 mt-1">
              {t("Gérez vos demandes de financement", "Manage your funding applications")}
            </p>
          </div>
          
          {(user.user_role === 'org_admin' || user.user_role === 'org_finance') && (
            <Link to={createPageUrl("ProjectIntake")}>
              <Button size="lg" className="bg-blue-900 hover:bg-blue-800 gap-2">
                <Plus className="w-5 h-5" />
                {t("Nouveau projet", "New Project")}
              </Button>
            </Link>
          )}
        </div>

        {/* Filters */}
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder={t("Rechercher un projet...", "Search project...")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("Tous les statuts", "All Statuses")}</SelectItem>
                  <SelectItem value="draft">{t("Brouillon", "Draft")}</SelectItem>
                  <SelectItem value="submitted">{t("Soumis", "Submitted")}</SelectItem>
                  <SelectItem value="under_review">{t("En révision", "Under Review")}</SelectItem>
                  <SelectItem value="approved">{t("Approuvé", "Approved")}</SelectItem>
                  <SelectItem value="in_progress">{t("En cours", "In Progress")}</SelectItem>
                  <SelectItem value="completed">{t("Complété", "Completed")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="border-none shadow-md animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-gray-200 rounded mb-4" />
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <Card className="border-none shadow-md">
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t("Aucun projet trouvé", "No projects found")}
              </h3>
              <p className="text-gray-600">
                {t(
                  "Commencez par créer votre premier projet",
                  "Start by creating your first project"
                )}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map(project => (
              <Card
                key={project.id}
                className="border-none shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group"
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-xl bg-blue-50 group-hover:bg-blue-100 transition-colors">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <Badge className={getStatusColor(project.status)}>
                      {getStatusLabel(project.status)}
                    </Badge>
                  </div>

                  <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                    {project.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {project.description}
                  </p>

                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <div className="flex justify-between">
                      <span>{t("Créé le", "Created on")}</span>
                      <span className="font-medium">
                        {format(new Date(project.created_date), "d MMM yyyy", {
                          locale: locale === 'fr' ? fr : enUS
                        })}
                      </span>
                    </div>
                    {project.total_budget && (
                      <div className="flex justify-between">
                        <span>{t("Budget", "Budget")}</span>
                        <span className="font-medium">
                          {project.total_budget.toLocaleString()} CAD
                        </span>
                      </div>
                    )}
                  </div>

                  <Link to={createPageUrl(`ProjectDetail?id=${project.id}`)}>
                    <Button className="w-full bg-blue-900 hover:bg-blue-800 gap-2">
                      <Eye className="w-4 h-4" />
                      {t("Voir détails", "View Details")}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}