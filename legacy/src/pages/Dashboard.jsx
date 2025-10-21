import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  FileText,
  Plus,
  TrendingUp,
  DollarSign,
  Users,
  Clock,
  AlertCircle,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [locale, setLocale] = useState('fr');

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

  const { data: projects = [] } = useQuery({
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

  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => base44.entities.Session.list('-start_datetime', 5)
  });

  const t = (fr, en) => locale === 'fr' ? fr : en;

  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'in_progress').length,
    approved: projects.filter(p => p.status === 'approved').length,
    draft: projects.filter(p => p.status === 'draft').length,
  };

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

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20">
      <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              {t(`Bonjour, ${user.full_name}`, `Hello, ${user.full_name}`)}
            </h1>
            <p className="text-gray-600 mt-1">
              {t(
                "Bienvenue sur votre tableau de bord CPE Connect",
                "Welcome to your CPE Connect dashboard"
              )}
            </p>
          </div>
          
          {(user.user_role === 'org_admin' || user.user_role === 'org_finance') && (
            <Link to={createPageUrl("ProjectIntake")}>
              <Button size="lg" className="bg-blue-900 hover:bg-blue-800 gap-2 shadow-lg">
                <Plus className="w-5 h-5" />
                {t("Nouveau projet", "New Project")}
              </Button>
            </Link>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {t("Total projets", "Total Projects")}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-50">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {t("En cours", "In Progress")}
                  </p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{stats.active}</p>
                </div>
                <div className="p-3 rounded-xl bg-purple-50">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {t("Approuvés", "Approved")}
                  </p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{stats.approved}</p>
                </div>
                <div className="p-3 rounded-xl bg-green-50">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {t("Brouillons", "Drafts")}
                  </p>
                  <p className="text-3xl font-bold text-gray-600 mt-2">{stats.draft}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50">
                  <AlertCircle className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Projects */}
        <Card className="border-none shadow-lg bg-white">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-bold">
                {t("Projets récents", "Recent Projects")}
              </CardTitle>
              <Link to={createPageUrl("Projects")}>
                <Button variant="ghost" size="sm" className="gap-2">
                  {t("Voir tout", "View All")}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {t(
                    "Aucun projet pour le moment. Créez votre premier projet!",
                    "No projects yet. Create your first project!"
                  )}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {projects.slice(0, 5).map((project) => (
                  <Link
                    key={project.id}
                    to={createPageUrl(`ProjectDetail?id=${project.id}`)}
                    className="block"
                  >
                    <div className="p-4 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate mb-1">
                            {project.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {t("Créé le", "Created on")}{" "}
                            {format(new Date(project.created_date), "d MMMM yyyy", {
                              locale: locale === 'fr' ? fr : enUS
                            })}
                          </p>
                        </div>
                        <Badge className={getStatusColor(project.status)}>
                          {getStatusLabel(project.status)}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Sessions */}
        <Card className="border-none shadow-lg bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Users className="w-5 h-5" />
              {t("Prochaines sessions", "Upcoming Sessions")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">
                  {t("Aucune session programmée", "No sessions scheduled")}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.slice(0, 3).map((session) => (
                  <div
                    key={session.id}
                    className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white shadow-sm">
                        <Clock className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{session.location || session.mode}</p>
                        <p className="text-sm text-gray-600">
                          {format(new Date(session.start_datetime), "d MMM yyyy, HH:mm", {
                            locale: locale === 'fr' ? fr : enUS
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}