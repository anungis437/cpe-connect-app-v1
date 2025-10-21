
import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { can, ACTIONS } from "../components/permissions";
import MilestoneTracker from "../components/projects/MilestoneTracker";
import CommentThread from "../components/projects/CommentThread";
import AIComplianceCheck from "../components/projects/AIComplianceCheck";
import ClaimSubmissionDialog from "../components/projects/ClaimSubmissionDialog";
import { useToast } from "@/components/ui/use-toast";
import {
  ArrowLeft,
  FileText,
  DollarSign,
  Calendar,
  CheckCircle2,
  Download,
  Plus,
  Upload,
  Trash2,
  Save,
  MessageSquare,
  ClipboardList,
  Loader2,
  Send as SendIcon,
  ShieldCheck,
  AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";

const ProjectActionBar = ({ project, user, onStatusChange }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const locale = user.locale || 'fr';
  const t = (frText, enText) => locale === 'fr' ? frText : enText;

  const handleSubmitForReview = async () => {
    setIsSubmitting(true);
    try {
      await onStatusChange('submitted');
      toast({
        title: t("Projet soumis", "Project Submitted"),
        description: t("Votre projet a été soumis pour révision.", "Your project has been submitted for review."),
        variant: "success",
      });
    } catch (error) {
      toast({
        title: t("Erreur", "Error"),
        description: t(`Échec de la soumission du projet pour révision: ${error.message}`, `Failed to submit project for review: ${error.message}`),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleApprove = async () => {
    if (!can(user, ACTIONS.APPROVE_PROJECT, project)) return;
    try {
      await onStatusChange('approved');
      toast({ 
        title: t("Projet Approuvé", "Project Approved"), 
        description: t("Le projet a été marqué comme approuvé.", "The project has been marked as approved."),
        variant: "success" 
      });
    } catch (error) {
      toast({
        title: t("Erreur", "Error"),
        description: t(`Échec de l'approbation du projet: ${error.message}`, `Failed to approve project: ${error.message}`),
        variant: "destructive",
      });
    }
  }

  const handleRequestChanges = async () => {
    if (!can(user, ACTIONS.REQUEST_PROJECT_CHANGES, project)) return;
    try {
      await onStatusChange('draft');
      toast({ 
        title: t("Changements demandés", "Changes Requested"), 
        description: t("Le projet a été retourné à l'organisation pour modifications.", "The project has been returned to the organization for changes."), 
        variant: "info" 
      });
    } catch (error) {
      toast({
        title: t("Erreur", "Error"),
        description: t(`Échec de la demande de changements: ${error.message}`, `Failed to request changes: ${error.message}`),
        variant: "destructive",
      });
    }
  }

  if (user.user_role === 'officer') {
    return (
      <div className="flex gap-2">
        {can(user, ACTIONS.APPROVE_PROJECT, project) && (
          <>
            <Button onClick={handleRequestChanges} variant="outline" className="gap-2">
              <AlertTriangle className="w-4 h-4" />{t("Demander des changements", "Request Changes")}
            </Button>
            <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700 gap-2">
              <CheckCircle2 className="w-4 h-4" />{t("Approuver le projet", "Approve Project")}
            </Button>
          </>
        )}
      </div>
    );
  }

  if (can(user, ACTIONS.SUBMIT_PROJECT, project)) {
    return (
      <Button onClick={handleSubmitForReview} disabled={isSubmitting} className="bg-blue-900 hover:bg-blue-800 gap-2">
        {isSubmitting ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <SendIcon className="w-4 h-4 mr-2" />
        )}
        {t("Soumettre pour révision", "Submit for Review")}
      </Button>
    );
  }

  return null;
};

const DocumentItem = ({ doc, locale, t, projectId, user, canDelete }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const downloadMutation = useMutation({
    mutationFn: async () => {
      // Assuming file_url stored from UploadPrivateFile is actually file_uri
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: doc.file_url });
      return signed_url;
    },
    onSuccess: (signedUrl) => {
      window.open(signedUrl, '_blank');
      toast({
        title: t("Téléchargement lancé", "Download Initiated"),
        description: t("Le téléchargement du document a commencé.", "Document download has started."),
        variant: "success",
      });
    },
    onError: (error) => {
      toast({
        title: t("Erreur de téléchargement", "Download Error"),
        description: t(`Impossible de télécharger le fichier ${doc.file_name}: ${error.message}`, `Failed to download file ${doc.file_name}: ${error.message}`),
        variant: "destructive",
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (documentId) => {
      await base44.entities.Document.delete(documentId);
      if (user) {
        await base44.entities.AuditLog.create({
          actor_email: user.email,
          action: "document_deleted",
          object_type: "document",
          object_id: documentId,
          before_data: { fileName: doc.file_name, kind: doc.kind, projectId: projectId }
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', projectId] });
      toast({
        title: t("Document supprimé", "Document Deleted"),
        description: t("Le document a été supprimé avec succès.", "The document has been successfully deleted."),
        variant: "success",
      });
    },
    onError: (error) => {
      toast({
        title: t("Erreur de suppression", "Deletion Error"),
        description: t(`Impossible de supprimer le document ${doc.file_name}: ${error.message}`, `Failed to delete document ${doc.file_name}: ${error.message}`),
        variant: "destructive",
      });
    }
  });

  return (
    <div className="flex items-center justify-between p-2 rounded bg-gray-50 border border-gray-200">
      <span className="text-sm text-gray-700 truncate mr-2">{doc.file_name}</span>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => downloadMutation.mutate()}
          disabled={downloadMutation.isPending}
        >
          {downloadMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
        </Button>
        {canDelete && (
            <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteMutation.mutate(doc.id)}
            disabled={deleteMutation.isPending}
            className="text-red-500 hover:text-red-700"
            >
            {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Trash2 className="w-4 h-4" />
            )}
            </Button>
        )}
      </div>
    </div>
  );
};


export default function ProjectDetail() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [locale, setLocale] = useState('fr');
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('id');

  const [newCostLine, setNewCostLine] = useState({
    category: '',
    description: '',
    quantity: 1,
    unit_cost: 0
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false);

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
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les informations de l'utilisateur.",
        variant: "destructive",
      });
    }
  };

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const projects = await base44.entities.Project.filter({ id: projectId });
      return projects[0];
    },
    enabled: !!projectId
  });

  const { data: costLines = [] } = useQuery({
    queryKey: ['costLines', projectId],
    queryFn: () => base44.entities.CostLine.filter({ project_id: projectId }),
    enabled: !!projectId
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['documents', projectId],
    queryFn: () => base44.entities.Document.filter({ project_id: projectId }),
    enabled: !!projectId
  });

  const isProjectMutable = useMemo(() => {
    return can(user, ACTIONS.MANAGE_MILESTONES, project);
  }, [project, user]);

  const canManageCosts = useMemo(() => {
    return can(user, ACTIONS.MANAGE_COSTS, project);
  }, [project, user]);
  
  const canCreateClaim = useMemo(() => {
    return can(user, ACTIONS.CREATE_CLAIM, project);
  }, [project, user]);

  const t = (frText, enText) => locale === 'fr' ? frText : enText;

  const addCostLineMutation = useMutation({
    mutationFn: async (data) => {
      const total = data.quantity * data.unit_cost;
      const fundingRate = project.funding_rate || 0.5;
      const newCostLineData = {
        ...data,
        project_id: projectId,
        total,
        funding_rate: fundingRate,
        reimbursable: total * fundingRate
      };
      const createdLine = await base44.entities.CostLine.create(newCostLineData);

      if (user) {
        await base44.entities.AuditLog.create({
          actor_email: user.email,
          action: "cost_line_added",
          object_type: "cost_line",
          object_id: createdLine.id,
          after_data: createdLine
        });
      }
      return createdLine;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['costLines', projectId] });
      setNewCostLine({ category: '', description: '', quantity: 1, unit_cost: 0 });
      toast({
        title: t("Ligne de coût ajoutée", "Cost Line Added"),
        variant: "success",
      });
    },
    onError: (error) => {
      toast({
        title: t("Erreur", "Error"),
        description: t(`Impossible d'ajouter la ligne de coût: ${error.message}`, `Failed to add cost line: ${error.message}`),
        variant: "destructive",
      });
    }
  });

  const handleFileUpload = async (e, kind) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Use private upload for sensitive documents
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });

      const docPayload = {
        project_id: projectId,
        file_url: file_uri, // Store the private URI
        file_name: file.name,
        kind
      };

      const newDoc = await base44.entities.Document.create(docPayload);

      // Create audit log for document upload
      if (user) {
        await base44.entities.AuditLog.create({
          actor_email: user.email,
          action: "document_uploaded",
          object_type: "document",
          object_id: newDoc.id, // Use the new document's ID
          after_data: { fileName: file.name, kind: kind, projectId: projectId }
        });
      }


      queryClient.invalidateQueries({ queryKey: ['documents', projectId] });
      toast({
        title: t("Fichier téléversé", "File Uploaded"),
        description: `${file.name} ${t("a été ajouté au projet de manière sécurisée.", "has been securely added to the project.")}`,
        variant: "success",
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: t("Erreur de téléversement", "Upload Error"),
        description: t(`Impossible de téléverser le fichier ${file.name}: ${error.message}`, `Failed to upload file ${file.name}: ${error.message}`),
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const updateStatusMutation = useMutation({
    mutationFn: (newStatus) => 
      base44.entities.Project.update(projectId, { status: newStatus }),
    onSuccess: (updatedProject) => {
      queryClient.setQueryData(['project', projectId], updatedProject);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      
       // Create audit log for status change
      if (user) {
        base44.entities.AuditLog.create({
          actor_email: user.email,
          action: "status_changed",
          object_type: "project",
          object_id: projectId,
          before_data: { status: project.status },
          after_data: { status: updatedProject.status }
        });
      }

      toast({
        title: t("Statut mis à jour", "Status Updated"),
        description: t(`Le statut du projet est maintenant "${t(updatedProject.status, updatedProject.status)}".`, `Project status is now "${updatedProject.status}".`),
        variant: "success",
      });
    },
    onError: (error) => {
      toast({
        title: t("Erreur", "Error"),
        description: t(`Le statut du projet n'a pas pu être mis à jour: ${error.message}`, `Project status could not be updated: ${error.message}`),
        variant: "destructive",
      });
    }
  });

  if (isLoading || !project || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      draft: "bg-gray-100 text-gray-800",
      submitted: "bg-blue-100 text-blue-800",
      under_review: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      in_progress: "bg-purple-100 text-purple-800",
      completed: "bg-indigo-100 text-indigo-800"
    };
    return colors[status] || colors.draft;
  };

  const uncalimedCostLines = costLines.filter(line => !line.payment_claim_id);
  const claimedCostLines = costLines.filter(line => line.payment_claim_id);

  const totalCosts = costLines.reduce((sum, line) => sum + (line.total || 0), 0);
  const totalReimbursable = costLines.reduce((sum, line) => sum + (line.reimbursable || 0), 0);
  const totalClaimed = claimedCostLines.reduce((sum, line) => sum + (line.reimbursable || 0), 0);
  
  const adminFees = costLines
    .filter(line => line.category === 'administration')
    .reduce((sum, line) => sum + (line.total || 0), 0);
  const adminFeesPercent = totalCosts > 0 ? (adminFees / totalCosts) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(createPageUrl("Projects"))}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
                        <Badge className={getStatusColor(project.status)}>
                            {project.status}
                        </Badge>
                    </div>
                    <p className="text-gray-600">{project.description}</p>
                </div>
                <ProjectActionBar project={project} user={user} onStatusChange={updateStatusMutation.mutateAsync} />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-50">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">
                    {t("Budget total", "Total Budget")}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalCosts.toLocaleString()} CAD
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
                    {t("Remboursable", "Reimbursable")}
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {totalReimbursable.toLocaleString()} CAD
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-purple-50">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">
                    {t("Taux de financement", "Funding Rate")}
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {((project.funding_rate || 0.5) * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-orange-50">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">
                    {t("Date de création", "Created Date")}
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {project.created_date ? format(new Date(project.created_date), "d MMM yyyy", {
                      locale: locale === 'fr' ? fr : enUS
                    }) : '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="costs" className="space-y-6">
          <TabsList className="bg-white shadow-md">
            <TabsTrigger value="costs" className="gap-2"><DollarSign className="w-4 h-4" />{t("Coûts", "Costs")}</TabsTrigger>
            <TabsTrigger value="milestones" className="gap-2"><ClipboardList className="w-4 h-4" />{t("Jalons", "Milestones")}</TabsTrigger>
            <TabsTrigger value="comments" className="gap-2"><MessageSquare className="w-4 h-4" />{t("Commentaires", "Comments")}</TabsTrigger>
            <TabsTrigger value="documents" className="gap-2"><FileText className="w-4 h-4" />{t("Documents", "Documents")}</TabsTrigger>
            <TabsTrigger value="details" className="gap-2"><ShieldCheck className="w-4 h-4" />{t("Détails & Conformité", "Details & Conformité")}</TabsTrigger>
          </TabsList>

          {/* Costs Tab */}
          <TabsContent value="costs" className="space-y-6">
            {canCreateClaim && (
                <Card>
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <h4 className="font-semibold">{t("Demande de Remboursement", "Reimbursement Claim")}</h4>
                            <p className="text-sm text-gray-600">{t(`Vous avez ${uncalimedCostLines.length} ligne(s) de coût non réclamée(s) prête(s) à être soumise(s).`, `You have ${uncalimedCostLines.length} unclaimed cost line(s) ready for submission.`)}</p>
                        </div>
                        <Button onClick={() => setIsClaimDialogOpen(true)} disabled={uncalimedCostLines.length === 0} className="bg-green-600 hover:bg-green-700 gap-2">
                          <SendIcon className="w-4 h-4" />
                          {t("Faire une réclamation", "Make a Claim")}
                        </Button>
                    </CardContent>
                </Card>
            )}
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>{t("Lignes budgétaires", "Cost Lines")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add new cost line */}
                {canManageCosts && (
                  <div className="p-6 rounded-lg bg-blue-50 border border-blue-200 space-y-4">
                    <h4 className="font-semibold text-gray-900">
                      {t("Ajouter une ligne", "Add Cost Line")}
                    </h4>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>{t("Catégorie", "Category")}</Label>
                        <Select
                          value={newCostLine.category}
                          onValueChange={(value) => setNewCostLine({...newCostLine, category: value})}
                          disabled={!canManageCosts}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder={t("Sélectionner une catégorie", "Select a category")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="professional_fees">{t("Honoraires professionnels", "Professional Fees")}</SelectItem>
                            <SelectItem value="travel">{t("Déplacement", "Travel")}</SelectItem>
                            <SelectItem value="training">{t("Formation", "Training")}</SelectItem>
                            <SelectItem value="equipment">{t("Équipement", "Equipment")}</SelectItem>
                            <SelectItem value="room_rental">{t("Location de salle", "Room Rental")}</SelectItem>
                            <SelectItem value="administration">{t("Administration", "Administration")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>{t("Description", "Description")}</Label>
                        <Input
                          value={newCostLine.description}
                          onChange={(e) => setNewCostLine({...newCostLine, description: e.target.value})}
                          className="mt-2"
                          disabled={!canManageCosts}
                        />
                      </div>

                      <div>
                        <Label>{t("Quantité", "Quantity")}</Label>
                        <Input
                          type="number"
                          value={newCostLine.quantity}
                          onChange={(e) => setNewCostLine({...newCostLine, quantity: parseFloat(e.target.value)})}
                          className="mt-2"
                          disabled={!canManageCosts}
                        />
                      </div>

                      <div>
                        <Label>{t("Coût unitaire (CAD)", "Unit Cost (CAD)")}</Label>
                        <Input
                          type="number"
                          value={newCostLine.unit_cost}
                          onChange={(e) => setNewCostLine({...newCostLine, unit_cost: parseFloat(e.target.value)})}
                          className="mt-2"
                          disabled={!canManageCosts}
                        />
                      </div>
                    </div>

                    <Button
                      onClick={() => addCostLineMutation.mutate(newCostLine)}
                      disabled={!newCostLine.category || !newCostLine.description || addCostLineMutation.isPending || !canManageCosts}
                      className="bg-blue-900 hover:bg-blue-800"
                    >
                      {addCostLineMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4 mr-2" />
                      )}
                      {t("Ajouter", "Add")}
                    </Button>
                  </div>
                )}

                {/* Cost lines table */}
                <div className="rounded-lg border overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          {t("Catégorie", "Category")}
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          {t("Description", "Description")}
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                          {t("Qté", "Qty")}
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                          {t("Prix unit.", "Unit Price")}
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                          {t("Total", "Total")}
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                          {t("Remb.", "Reimb.")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {costLines.map(line => (
                        <tr key={line.id} className={`border-t hover:bg-gray-50 ${line.payment_claim_id ? 'bg-gray-100 text-gray-500' : ''}`}>
                          <td className="px-4 py-3 text-sm">{t(
                            {professional_fees: "Honoraires professionnels", travel: "Déplacement", training: "Formation", equipment: "Équipement", room_rental: "Location de salle", administration: "Administration"}[line.category] || line.category,
                            {professional_fees: "Professional Fees", travel: "Travel", training: "Training", equipment: "Equipment", room_rental: "Room Rental", administration: "Administration"}[line.category] || line.category
                          )}</td>
                          <td className="px-4 py-3 text-sm">{line.description}</td>
                          <td className="px-4 py-3 text-sm text-right">{line.quantity}</td>
                          <td className="px-4 py-3 text-sm text-right">
                            {line.unit_cost?.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-right">
                            {line.total?.toLocaleString()} CAD
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-green-600 text-right">
                            {line.reimbursable?.toLocaleString()} CAD
                            {line.payment_claim_id && <Badge variant="secondary" className="ml-2">{t("Réclamé", "Claimed")}</Badge>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t-2">
                      <tr>
                        <td colSpan="4" className="px-4 py-3 text-right font-semibold">
                          {t("Total", "Total")}
                        </td>
                        <td className="px-4 py-3 text-right font-bold">
                          {totalCosts.toLocaleString()} CAD
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-green-600">
                          {totalReimbursable.toLocaleString()} CAD
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {adminFeesPercent > 10 && (
                  <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-sm text-red-800">
                      ⚠️ {t(
                        `Attention: Les frais d'administration (${adminFeesPercent.toFixed(1)}%) dépassent la limite de 10%`,
                        `Warning: Administration fees (${adminFeesPercent.toFixed(1)}%) exceed the 10% limit`
                      )}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Milestones Tab */}
          <TabsContent value="milestones">
            <Card className="border-none shadow-lg">
                <CardHeader>
                    <CardTitle>{t("Jalons du projet", "Project Milestones")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <MilestoneTracker projectId={projectId} user={user} locale={locale} project={project} />
                </CardContent>
            </Card>
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments">
             <Card className="border-none shadow-lg">
                <CardHeader>
                    <CardTitle>{t("Communication du projet", "Project Communication")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <CommentThread projectId={projectId} user={user} locale={locale} />
                </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>{t("Documents du projet", "Project Documents")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {['proposal', 'budget', 'cv', 'receipt', 'report'].map(kind => (
                  <div key={kind} className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-base font-semibold">
                        {t(
                          {proposal: "Proposition", budget: "Budget", cv: "CV", receipt: "Reçus", report: "Rapports"}[kind],
                          {proposal: "Proposal", budget: "Budget", cv: "CVs", receipt: "Receipts", report: "Reports"}[kind]
                        )}
                      </Label>
                      {can(user, ACTIONS.UPLOAD_DOCUMENTS, project) && (
                        <label htmlFor={`file-upload-${kind}`} className="cursor-pointer">
                          <Button asChild className="gap-2" disabled={isUploading}>
                            <Input
                              id={`file-upload-${kind}`}
                              type="file"
                              onChange={(e) => handleFileUpload(e, kind)}
                              className="hidden"
                            />
                            {isUploading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Upload className="w-4 h-4" />
                            )}
                           {t("Téléverser", "Upload")}
                          </Button>
                        </label>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      {documents.filter(d => d.kind === kind).length > 0 ? (
                        documents.filter(d => d.kind === kind).map(doc => (
                          <DocumentItem 
                            key={doc.id} 
                            doc={doc} 
                            locale={locale} 
                            t={t} 
                            projectId={projectId} 
                            user={user} 
                            canDelete={can(user, ACTIONS.DELETE_DOCUMENTS, project)}
                          />
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 italic">{t("Aucun document téléversé", "No documents uploaded yet.")}</p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <AIComplianceCheck project={project} documents={documents} locale={locale} />
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>{t("Détails du projet", "Project Details")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm text-gray-500">{t("Type de projet", "Project Type")}</Label>
                    <p className="font-medium text-gray-900 mt-1">{project.stream}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm text-gray-500">{t("Score d'éligibilité", "Eligibility Score")}</Label>
                    <p className="font-medium text-gray-900 mt-1">
                      {project.eligibility_score}/100
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm text-gray-500">{t("Date de début", "Start Date")}</Label>
                    <p className="font-medium text-gray-900 mt-1">
                      {project.start_date ? format(new Date(project.start_date), "d MMMM yyyy", {
                        locale: locale === 'fr' ? fr : enUS
                      }) : '-'}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm text-gray-500">{t("Date de fin", "End Date")}</Label>
                    <p className="font-medium text-gray-900 mt-1">
                      {project.end_date ? format(new Date(project.end_date), "d MMMM yyyy", {
                        locale: locale === 'fr' ? fr : enUS
                      }) : '-'}
                    </p>
                  </div>
                </div>

                {project.objectives && (
                  <div>
                    <Label className="text-sm text-gray-500">{t("Objectifs", "Objectives")}</Label>
                    <p className="text-gray-900 mt-2">{project.objectives}</p>
                  </div>
                )}

                {project.notes && (
                  <div>
                    <Label className="text-sm text-gray-500">{t("Notes", "Notes")}</Label>
                    <p className="text-gray-900 mt-2">{project.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      {isClaimDialogOpen && (
        <ClaimSubmissionDialog
            isOpen={isClaimDialogOpen}
            onClose={() => setIsClaimDialogOpen(false)}
            project={project}
            user={user}
            uncalimedCostLines={uncalimedCostLines}
            locale={locale}
        />
      )}
    </div>
  );
}
