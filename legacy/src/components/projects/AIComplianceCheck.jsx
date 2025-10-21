import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { BrainCircuit, Loader2, FileWarning, Sparkles, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AIComplianceCheck({ project, documents, locale }) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const t = (frText, enText) => locale === 'fr' ? frText : enText;

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(project.ai_compliance_report || null);

    const getDocumentLinks = useMutation({
        mutationFn: async (docs) => {
            const urls = await Promise.all(docs.map(doc => 
                base44.integrations.Core.CreateFileSignedUrl({ file_uri: doc.file_url })
            ));
            return urls.map(res => res.signed_url);
        }
    });

    const analyzeComplianceMutation = useMutation({
        mutationFn: async (fileUrls) => {
            const prompt = `En tant qu'analyste de conformité expert pour le programme "Concertation pour l'emploi", analyse les documents fournis pour le projet "${project.title}".
            
Contexte du projet:
- Type: ${project.stream}
- Budget total: ${project.total_budget} CAD
- Objectifs: ${project.objectives}

Documents fournis: ${documents.map(d => `${d.kind}: ${d.file_name}`).join(', ')}

Ta mission est de :
1. Vérifier si les documents essentiels (proposition, budget) sont présents.
2. Analyser le contenu pour détecter des risques, des incohérences ou des non-conformités. Points à vérifier :
    - Le budget détaillé est-il cohérent avec le budget total du projet ?
    - Les activités décrites dans la proposition correspondent-elles au type de projet (stream) ?
    - Y a-t-il des postes de dépenses inhabituels ou excessifs (ex: frais administratifs > 15%) ?
    - Les CV des consultants (si fournis) semblent-ils pertinents pour le projet ?
3. Attribuer un score de risque global de 0 (faible) à 100 (élevé).
4. Fournir un résumé concis de ton analyse.
5. Lister les problèmes spécifiques ou les points de vigilance que l'agent de programme devrait examiner de plus près.

Réponds uniquement en JSON.`;

            return await base44.integrations.Core.InvokeLLM({
                prompt: prompt,
                file_urls: fileUrls,
                response_json_schema: {
                    type: "object",
                    properties: {
                        risk_score: { type: "number", description: "Score de risque de 0 à 100" },
                        summary_fr: { type: "string", description: "Résumé en français" },
                        summary_en: { type: "string", description: "Résumé en anglais" },
                        issues: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    severity: { type: "string", enum: ["low", "medium", "high"] },
                                    description_fr: { type: "string" },
                                    description_en: { type: "string" }
                                }
                            }
                        }
                    }
                }
            });
        },
        onSuccess: (data) => {
            setAnalysisResult(data);
            queryClient.setQueryData(['project', project.id], (oldData) => ({...oldData, ai_compliance_report: data}));
            base44.entities.Project.update(project.id, { ai_compliance_report: data });
            toast({ title: t("Analyse terminée", "Analysis Complete"), variant: "success" });
        },
        onError: (error) => {
            toast({ title: t("Erreur d'analyse", "Analysis Error"), description: error.message, variant: "destructive" });
        },
        onSettled: () => {
            setIsAnalyzing(false);
        }
    });

    const handleRunAnalysis = async () => {
        setIsAnalyzing(true);
        if (documents.length === 0) {
            toast({ title: t("Aucun document", "No Documents"), description: t("Veuillez téléverser des documents avant de lancer l'analyse.", "Please upload documents before running the analysis."), variant: "warning"});
            setIsAnalyzing(false);
            return;
        }
        try {
            const fileUrls = await getDocumentLinks.mutateAsync(documents);
            await analyzeComplianceMutation.mutateAsync(fileUrls);
        } catch (error) {
            toast({ title: t("Erreur de préparation", "Preparation Error"), description: t("Impossible d'accéder aux fichiers pour l'analyse.", "Could not access files for analysis."), variant: "destructive" });
            setIsAnalyzing(false);
        }
    };

    const getRiskBadge = (score) => {
        if (score > 75) return <Badge variant="destructive">{t("Élevé", "High")}</Badge>;
        if (score > 40) return <Badge variant="secondary" className="bg-yellow-400 text-yellow-900">{t("Moyen", "Medium")}</Badge>;
        return <Badge variant="secondary" className="bg-green-400 text-green-900">{t("Faible", "Low")}</Badge>;
    };

    return (
        <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-3"><BrainCircuit className="w-6 h-6 text-blue-800"/>{t("Analyse de Conformité par IA", "AI Compliance Analysis")}</CardTitle>
                <Button onClick={handleRunAnalysis} disabled={isAnalyzing || getDocumentLinks.isPending}>
                    {isAnalyzing || getDocumentLinks.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Sparkles className="w-4 h-4 mr-2"/>}
                    {t(analysisResult ? "Relancer l'analyse" : "Lancer l'analyse", analysisResult ? "Rerun Analysis" : "Run Analysis")}
                </Button>
            </CardHeader>
            <CardContent>
                {!analysisResult ? (
                    <div className="text-center py-8 text-gray-500">
                        <p>{t("Cliquez sur 'Lancer l'analyse' pour que l'IA examine les documents du projet.", "Click 'Run Analysis' to have the AI review the project's documents.")}</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center gap-6">
                            <div className="text-center">
                                <p className="text-sm font-medium text-gray-600">{t("Score de Risque", "Risk Score")}</p>
                                <p className="text-5xl font-bold text-blue-900">{analysisResult.risk_score}</p>
                                {getRiskBadge(analysisResult.risk_score)}
                            </div>
                            <div className="flex-1">
                                <Progress value={analysisResult.risk_score} className="h-3" />
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">{t("Résumé de l'IA", "AI Summary")}</h4>
                            <p className="text-gray-700 text-sm p-4 bg-white/50 rounded-md border">{locale === 'fr' ? analysisResult.summary_fr : analysisResult.summary_en}</p>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">{t("Points de vigilance détectés", "Detected Issues")}</h4>
                            {analysisResult.issues && analysisResult.issues.length > 0 ? (
                                <div className="space-y-3">
                                    {analysisResult.issues.map((issue, index) => (
                                        <Alert key={index} variant={issue.severity === 'high' ? 'destructive' : 'default'} className={issue.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' : ''}>
                                            <FileWarning className="h-4 w-4" />
                                            <AlertTitle className="font-semibold">
                                                {t("Risque", "Risk")}: {t({low: "Faible", medium: "Moyen", high: "Élevé"}[issue.severity], {low: "Low", medium: "Medium", high: "High"}[issue.severity])}
                                            </AlertTitle>
                                            <AlertDescription>
                                                {locale === 'fr' ? issue.description_fr : issue.description_en}
                                            </AlertDescription>
                                        </Alert>
                                    ))}
                                </div>
                            ) : (
                                <Alert className="bg-green-50 border-green-200">
                                    <CheckCircle className="h-4 w-4 text-green-700"/>
                                    <AlertDescription className="text-green-800">
                                        {t("Aucun problème majeur de conformité détecté par l'IA.", "No major compliance issues detected by the AI.")}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}