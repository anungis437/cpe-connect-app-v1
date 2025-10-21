import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Filter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";

export default function ReviewProjects() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [locale, setLocale] = useState('fr');
  const [statusFilter, setStatusFilter] = useState('submitted');

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
    queryKey: ['projects-review', statusFilter],
    queryFn: () => {
      if (statusFilter === 'all') {
        return base44.entities.Project.list('-created_date');
      }
      return base44.entities.Project.filter({ status: statusFilter }, '-created_date');
    },
    enabled: !!user && user.user_role === 'officer'
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ projectId, newStatus, notes }) =>
      base44.entities.Project.update(projectId, { status: newStatus, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries(['projects-review']);
    }
  });

  const t = (fr, en) => locale === 'fr' ? fr : en;

  if (!user || user.user_role !== 'officer') {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">
          {t("Accès réservé aux agents", "Access reserved for officers")}
        </p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      submitted: "bg-blue-100 text-blue-800",
      under_review: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      in_progress: "bg-purple-100 text-purple-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t("Révision des projets", "Project Review")}
          </h1>
          <p className="text-gray-600 mt-1">
            {t("Évaluez et approuvez les demandes de financement", "Evaluate and approve funding applications")}
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-50">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">
                    {t("En attente", "Pending")}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {projects.filter(p => p.status === 'submitted').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-yellow-50">
                  <FileText className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">
                    {t("En révision", "Under Review")}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {projects.filter(p => p.status === 'under_review').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-green-50">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">
                    {t("Approuvés", "Approved")}
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {projects.filter(p => p.status === 'approved').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gray-50">
                  <FileText className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">
                    {t("Total", "Total")}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {projects.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Filter className="w-5 h-5 text-gray-400" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("Tous", "All")}</SelectItem>
                  <SelectItem value="submitted">{t("Soumis", "Submitted")}</SelectItem>
                  <SelectItem value="under_review">{t("En révision", "Under Review")}</SelectItem>
                  <SelectItem value="approved">{t("Approuvés", "Approved")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Projects List */}
        <div className="space-y-4">
          {projects.map(project => (
            <Card key={project.id} className="border-none shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{project.title}</h3>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                    </div>

                    <p className="text-gray-600 mb-4">{project.description}</p>

                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">{t("Type:", "Type:")}</span>
                        <span className="ml-2 font-medium">{project.stream}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">{t("Budget:", "Budget:")}</span>
                        <span className="ml-2 font-medium">
                          {project.total_budget?.toLocaleString()} CAD
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">{t("Score:", "Score:")}</span>
                        <span className="ml-2 font-medium">{project.eligibility_score}/100</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Link to={createPageUrl(`ProjectDetail?id=${project.id}`)}>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Eye className="w-4 h-4" />
                        {t("Voir", "View")}
                      </Button>
                    </Link>

                    {project.status === 'submitted' && (
                      <Button
                        size="sm"
                        onClick={() => updateStatusMutation.mutate({
                          projectId: project.id,
                          newStatus: 'under_review'
                        })}
                        variant="outline"
                        className="gap-2"
                      >
                        <Clock className="w-4 h-4" />
                        {t("Réviser", "Review")}
                      </Button>
                    )}

                    {project.status === 'under_review' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateStatusMutation.mutate({
                            projectId: project.id,
                            newStatus: 'approved'
                          })}
                          className="bg-green-600 hover:bg-green-700 gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          {t("Approuver", "Approve")}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}