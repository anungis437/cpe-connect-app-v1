
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { can, ACTIONS } from "../components/permissions";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Upload,
  FileText,
  Loader2,
  Trash2,
  Save
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";

export default function ProjectIntake() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('id');

  const [user, setUser] = useState(null);
  const [locale, setLocale] = useState('fr');
  const [organization, setOrganization] = useState(null);
  
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false); // General processing state for save/eligibility
  
  const [formData, setFormData] = useState({
    title: "",
    stream: "",
    description: "",
    objectives: "",
    start_date: "",
    end_date: "",
    estimated_budget: "",
  });

  const [documents, setDocuments] = useState([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [hasNavigated, setHasNavigated] = useState(false);

  // Fetch existing project data if an ID is present
  const { data: existingProject, isLoading: isLoadingProject } = useQuery({
    queryKey: ['projectIntake', projectId],
    queryFn: async () => {
        const project = await base44.entities.Project.get(projectId);
        const docs = await base44.entities.Document.filter({ project_id: projectId });
        return { ...project, documents: docs };
    },
    enabled: !!projectId, // Only run query if projectId exists
    refetchOnWindowFocus: false, // Prevent refetching on window focus for forms
  });

  useEffect(() => {
    loadUserAndOrg();
  }, []);

  // Populate form with existing data once fetched
  useEffect(() => {
    if (existingProject) {
      if (!can(user, ACTIONS.EDIT_PROJECT, existingProject)) {
        toast({
          title: t("Projet non modifiable", "Project Not Editable"),
          description: t("Ce projet n'est plus en mode brouillon et ne peut plus être modifié via ce formulaire.", "This project is no longer a draft and cannot be edited through this form."),
          variant: 'warning'
        });
        navigate(createPageUrl(`ProjectDetail?id=${existingProject.id}`));
        return;
      }

      setFormData({
        title: existingProject.title || "",
        stream: existingProject.stream || "",
        description: existingProject.description || "",
        objectives: existingProject.objectives || "",
        start_date: existingProject.start_date || "",
        end_date: existingProject.end_date || "",
        estimated_budget: existingProject.total_budget || "", // existingProject.total_budget is a number
      });
      // Restore step if eligibility was already checked
      if (existingProject.eligibility_score) {
        setStep(2);
      }
      // Load existing documents
      if (existingProject.documents) {
        setDocuments(existingProject.documents);
      }
    }
  }, [existingProject, user, navigate]);

  // New effect to run eligibility check *after* navigation to a new project ID
  useEffect(() => {
    // This effect triggers when projectId updates (e.g., after new project creation and navigation)
    // and hasNavigated flag is true, indicating we need to run eligibility for the new projectId.
    if (projectId && hasNavigated && organization) {
      checkEligibility(projectId);
      setHasNavigated(false); // Reset flag
    }
  }, [projectId, hasNavigated, organization]);

  const loadUserAndOrg = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setLocale(currentUser.locale || 'fr');
      
      if (currentUser.organization_id) {
        const orgs = await base44.entities.Organization.filter({ id: currentUser.organization_id });
        if (orgs.length > 0) {
          setOrganization(orgs[0]);
        }
      }
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const t = (fr, en) => locale === 'fr' ? fr : en;

  const streams = [
    { value: "coaching_leadership", label: t("Coaching - Développement des habiletés de gestion", "Coaching - Management Skills Development") },
    { value: "hrm_diagnostic", label: t("Diagnostic GRH & Plan d'action", "HRM Diagnostic & Action Plan") },
    { value: "digital_productivity", label: t("Productivité par transformation numérique", "Digital Productivity Transformation") },
    { value: "artt", label: t("Aménagement et réduction du temps de travail", "Work Time Arrangement & Reduction") },
    { value: "seasonal_stabilization", label: t("Stabilisation de l'emploi saisonnier", "Seasonal Employment Stabilization") },
    { value: "experienced_workers", label: t("Travailleurs expérimentés", "Experienced Workers") },
    { value: "partnership", label: t("Partenariat", "Partnership") },
    { value: "sectoral", label: t("Sectoriel", "Sectoral") }
  ];

  const updateProjectMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Project.update(id, data),
    onSuccess: (updatedProject) => {
      queryClient.invalidateQueries(['projectIntake', updatedProject.id]);
      queryClient.invalidateQueries(['projects']);
      toast({ title: t("Progrès sauvegardé", "Progress Saved"), variant: 'success' });
    },
    onError: (error) => {
      console.error("Update project error:", error);
      toast({ title: t("Erreur de sauvegarde", "Save Error"), description: error.message, variant: 'destructive' });
    }
  });

  const checkEligibility = async (targetProjectId) => {
    setIsProcessing(true);
    try {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Évalue l'éligibilité d'un projet pour le programme Concertation pour l'emploi.
Informations organisation:
- Taille: ${organization?.size_band || 'inconnue'}
- Secteur: ${organization?.sector || 'inconnu'}
Informations projet:
- Type: ${formData.stream}
- Description: ${formData.description}
- Objectifs: ${formData.objectives}
- Budget estimé: ${formData.estimated_budget} CAD
Critères d'éligibilité:
- Priorité aux PME de 6 à 99 employés
- Activités de gestion des ressources humaines
- Bonification à 75% pour transformation numérique, travailleurs expérimentés
- Score de 0 à 100
Retourne un score et une explication détaillée.`,
          response_json_schema: {
            type: "object",
            properties: {
              score: { type: "number" },
              eligible: { type: "boolean" },
              explanation_fr: { type: "string" },
              explanation_en: { type: "string" },
              funding_rate: { type: "number" },
              recommendations_fr: { type: "array", items: { type: "string" } },
              recommendations_en: { type: "array", items: { type: "string" } }
            }
          }
        });

        await updateProjectMutation.mutateAsync({
          id: targetProjectId,
          data: {
            eligibility_score: result.score,
            eligibility_details: result,
            funding_rate: result.funding_rate
          }
        });
        setStep(2);
    } catch (error) {
        console.error("Error during eligibility check:", error);
        toast({ title: t("Erreur d'éligibilité", "Eligibility Error"), description: error.message, variant: "destructive" });
    } finally {
        setIsProcessing(false);
    }
  };
  
  const handleSaveAndContinue = async () => {
    setIsProcessing(true);

    try {
      // 1. Validate form data
      if (!formData.title || !formData.stream || !formData.description || !formData.objectives || !formData.estimated_budget) {
        toast({ title: t("Données manquantes", "Missing data"), description: t("Veuillez remplir tous les champs obligatoires.", "Please fill in all required fields."), variant: "destructive" });
        setIsProcessing(false);
        return;
      }

      // 2. Prepare data
      const projectDataToSave = {
        ...formData,
        total_budget: parseFloat(formData.estimated_budget) || 0,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
      };

      if (!projectId) {
        // --- CREATION FLOW ---
        const newProject = await base44.entities.Project.create({
          ...projectDataToSave,
          organization_id: user.organization_id,
          status: 'draft',
        });
        toast({ title: t("Brouillon créé", "Draft Created"), variant: 'success' });
        
        // Set a flag and navigate. The useEffect will handle the eligibility check.
        setHasNavigated(true);
        navigate(createPageUrl(`ProjectIntake?id=${newProject.id}`), { replace: true });
        // Stop execution here. The eligibility check will be picked up by the useEffect
        // when projectId updates from the URL change.
        return;

      } else {
        // --- UPDATE FLOW ---
        await updateProjectMutation.mutateAsync({
          id: projectId,
          data: projectDataToSave
        });
        // Now, run the eligibility check directly as projectId is already established.
        await checkEligibility(projectId);
      }

    } catch (error) {
      console.error("Error during save:", error);
      toast({ title: t("Erreur", "Error"), description: error.message, variant: "destructive" });
      setIsProcessing(false); // Only set to false if an error occurred before eligibility check
    }
    // Note: If execution reaches here in the "update flow", setIsProcessing will have been
    // managed by the checkEligibility function's finally block.
  };
  
  const handleFileUpload = async (e, kind) => {
    const file = e.target.files[0];
    if (!file || !projectId) {
      toast({ title: t("Erreur", "Error"), description: t("Veuillez d'abord sauvegarder les informations du projet.", "Please save project information first."), variant: "destructive" });
      return;
    }

    setUploadingDoc(true);
    try {
      // Use private upload for sensitive documents
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      const createdDocument = await base44.entities.Document.create({
        project_id: projectId, // Use the projectId from the URL
        file_url: file_uri,
        file_name: file.name,
        kind
      });
      setDocuments([...documents, createdDocument]); // Add the fully created document with its ID
      toast({ title: t("Document téléversé", "Document uploaded"), variant: 'success' });
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({ title: t("Erreur de téléversement", "Upload Error"), description: error.message, variant: "destructive" });
    } finally {
      setUploadingDoc(false);
      // Clear the file input after upload
      if (e.target) e.target.value = '';
    }
  };

  const handleDeleteDocument = async (docId) => {
    try {
      await base44.entities.Document.delete(docId);
      setDocuments(documents.filter(doc => doc.id !== docId));
      toast({ title: t("Document supprimé", "Document deleted"), variant: 'success' });
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({ title: t("Erreur de suppression", "Deletion Error"), description: error.message, variant: "destructive" });
    }
  };
  
  const handleSubmitProject = async () => {
    if (!can(user, ACTIONS.SUBMIT_PROJECT, existingProject)) {
       toast({ title: t("Action non autorisée", "Action Not Allowed"), variant: 'destructive' });
       return;
    }
    setIsProcessing(true);
    try {
      const updatedProject = await base44.entities.Project.update(projectId, { status: 'submitted' });
      queryClient.invalidateQueries(['projects']);
      navigate(createPageUrl(`ProjectDetail?id=${updatedProject.id}`));
      toast({ title: t("Projet soumis!", "Project Submitted!"), description: t("Votre projet a été soumis pour révision.", "Your project has been submitted for review."), variant: 'success' });
    } catch (error) {
      console.error("Submit project error:", error);
      toast({ title: t("Erreur de soumission", "Submission Error"), description: error.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoadingProject && projectId || !user || !organization) { // Show loader only when fetching an existing project or user/org is not loaded
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }
  
  const progress = (step / 3) * 100;
  const eligibilityResult = existingProject?.eligibility_details;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(createPageUrl("Projects"))}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t("Nouveau projet", "New Project")}
            </h1>
            <p className="text-gray-600 mt-1">
              {projectId ? t("Modification du brouillon", "Editing Draft") : t("Démarrez votre demande de financement", "Start your funding application")}
            </p>
          </div>
        </div>

        {/* Progress */}
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>{t("Étape", "Step")} {step}/3</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Step 1: Project Information */}
        {step === 1 && (
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">
                {t("Informations du projet", "Project Information")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="title">
                  {t("Titre du projet", "Project Title")} *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder={t("Ex: Transformation numérique de nos processus RH", "Ex: Digital transformation of our HR processes")}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="stream">
                  {t("Type de projet", "Project Type")} *
                </Label>
                <Select
                  value={formData.stream}
                  onValueChange={(value) => setFormData({...formData, stream: value})}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder={t("Sélectionner un type", "Select a type")} />
                  </SelectTrigger>
                  <SelectContent>
                    {streams.map(s => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">
                  {t("Description du projet", "Project Description")} *
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder={t("Décrivez votre projet et les défis RH que vous souhaitez adresser", "Describe your project and the HR challenges you want to address")}
                  className="mt-2 h-32"
                />
              </div>

              <div>
                <Label htmlFor="objectives">
                  {t("Objectifs", "Objectives")} *
                </Label>
                <Textarea
                  id="objectives"
                  value={formData.objectives}
                  onChange={(e) => setFormData({...formData, objectives: e.target.value})}
                  placeholder={t("Quels sont vos objectifs mesurables?", "What are your measurable objectives?")}
                  className="mt-2 h-24"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="start_date">
                    {t("Date de début", "Start Date")}
                  </Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">
                    {t("Date de fin", "End Date")}
                  </Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="budget">
                  {t("Budget estimé (CAD)", "Estimated Budget (CAD)")} *
                </Label>
                <Input
                  id="budget"
                  type="number"
                  value={formData.estimated_budget}
                  onChange={(e) => setFormData({...formData, estimated_budget: e.target.value})}
                  placeholder="50000"
                  className="mt-2"
                />
              </div>

              <Button
                onClick={handleSaveAndContinue}
                disabled={!can(user, ACTIONS.EDIT_PROJECT, existingProject) || !formData.title || !formData.stream || !formData.description || !formData.objectives || !formData.estimated_budget || isProcessing}
                className="w-full bg-blue-900 hover:bg-blue-800"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {t("Traitement...", "Processing...")}
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    {t("Sauvegarder et vérifier l'éligibilité", "Save and Check Eligibility")}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Eligibility Results */}
        {step === 2 && eligibilityResult && (
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-3">
                {eligibilityResult.eligible ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                )}
                {t("Résultat d'éligibilité", "Eligibility Result")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {t("Score d'éligibilité", "Eligibility Score")}
                  </span>
                  <span className="text-2xl font-bold text-blue-900">
                    {eligibilityResult.score}/100
                  </span>
                </div>
                <Progress value={eligibilityResult.score} className="h-3" />
              </div>

              <Alert className={eligibilityResult.eligible ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"}>
                <AlertDescription>
                  {locale === 'fr' ? eligibilityResult.explanation_fr : eligibilityResult.explanation_en}
                </AlertDescription>
              </Alert>

              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-sm font-medium text-blue-900 mb-2">
                  {t("Taux de financement estimé", "Estimated Funding Rate")}
                </p>
                <p className="text-3xl font-bold text-blue-900">
                  {(eligibilityResult.funding_rate * 100).toFixed(0)}%
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  {t(
                    `Financement estimé: ${(parseFloat(formData.estimated_budget) * eligibilityResult.funding_rate).toFixed(2)} CAD`,
                    `Estimated funding: ${(parseFloat(formData.estimated_budget) * eligibilityResult.funding_rate).toFixed(2)} CAD`
                  )}
                </p>
              </div>

              {(locale === 'fr' ? eligibilityResult.recommendations_fr : eligibilityResult.recommendations_en)?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    {t("Recommandations", "Recommendations")}
                  </h4>
                  <ul className="space-y-2">
                    {(locale === 'fr' ? eligibilityResult.recommendations_fr : eligibilityResult.recommendations_en).map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  {t("Retour", "Back")}
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-blue-900 hover:bg-blue-800"
                >
                  {t("Continuer", "Continue")}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Documents */}
        {step === 3 && (
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">
                {t("Documents requis", "Required Documents")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-600">
                {t(
                  "Téléversez les documents nécessaires pour votre demande",
                  "Upload the necessary documents for your application"
                )}
              </p>

              {['proposal', 'budget', 'cv'].map(kind => (
                <div key={kind} className="p-4 border-2 border-dashed rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <Label className="font-semibold text-gray-800">
                      {t(
                        {proposal: "Proposition de projet", budget: "Budget détaillé", cv: "CV des consultants"}[kind],
                        {proposal: "Project Proposal", budget: "Detailed Budget", cv: "Consultant CVs"}[kind]
                      )}
                    </Label>
                    {documents.some(d => d.kind === kind) && (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  {documents.filter(d => d.kind === kind).map(doc => (
                    <div key={doc.id} className="flex items-center justify-between mt-2 p-2 bg-gray-50 rounded-md border border-gray-200">
                      <span className="flex items-center text-sm text-gray-700">
                        <FileText className="w-4 h-4 mr-2 text-blue-600" />
                        {doc.file_name}
                      </span>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteDocument(doc.id)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {!documents.some(d => d.kind === kind) && ( // Only show upload if no doc of this kind
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileUpload(e, kind)}
                      disabled={uploadingDoc}
                      className="mt-2"
                    />
                  )}
                  {uploadingDoc && !documents.some(d => d.kind === kind) && ( // Show loader only if trying to upload for this specific kind and not already uploaded
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t("Téléversement en cours...", "Uploading...")}
                    </div>
                  )}
                </div>
              ))}

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex-1"
                >
                  {t("Retour", "Back")}
                </Button>
                <Button
                  onClick={handleSubmitProject}
                  disabled={isProcessing || !can(user, ACTIONS.SUBMIT_PROJECT, existingProject) || documents.length === 0}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {t("Soumission...", "Submitting...")}
                    </>
                  ) : (
                    t("Soumettre pour révision", "Submit for Review")
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
