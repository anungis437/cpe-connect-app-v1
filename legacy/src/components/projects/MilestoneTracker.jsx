
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { can, ACTIONS } from "../permissions";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Check, X, Trash2, CheckCircle, Clock, AlertTriangle, ThumbsUp } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const MilestoneItem = ({ milestone, locale, t, onUpdate, onDelete, isOfficer, canOrgUpdate }) => {

    const getStatusProps = (status) => {
        switch (status) {
            case "approved":
                return { icon: <ThumbsUp className="w-4 h-4" />, color: "bg-green-100 text-green-800", label: t("Approuvé", "Approved") };
            case "completed":
                return { icon: <CheckCircle className="w-4 h-4" />, color: "bg-blue-100 text-blue-800", label: t("Complété", "Completed") };
            case "rejected":
                return { icon: <X className="w-4 h-4" />, color: "bg-red-100 text-red-800", label: t("Rejeté", "Rejected") };
            case "pending":
            default:
                return { icon: <Clock className="w-4 h-4" />, color: "bg-gray-100 text-gray-800", label: t("En attente", "Pending") };
        }
    };

    const { icon, color, label } = getStatusProps(milestone.status);

    return (
        <div className="p-4 rounded-lg border bg-white hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900">{locale === 'fr' ? milestone.name_fr : milestone.name_en}</h4>
                        <Badge className={`${color} gap-1.5`}><span className="hidden md:inline">{icon}</span>{label}</Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                        {t("Échéance:", "Due:")} {format(new Date(milestone.due_date), "d MMMM yyyy", { locale: locale === 'fr' ? fr : enUS })}
                    </p>
                    {milestone.notes && <p className="text-sm text-gray-600 mt-2 italic">"{milestone.notes}"</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    {!isOfficer && milestone.status === 'pending' && canOrgUpdate && (
                        <Button size="sm" variant="outline" onClick={() => onUpdate(milestone.id, { status: 'completed' })}>
                            <Check className="w-4 h-4 mr-2" />
                            {t("Marquer comme complété", "Mark as Complete")}
                        </Button>
                    )}
                    {isOfficer && milestone.status === 'completed' && (
                        <>
                            <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => onUpdate(milestone.id, { status: 'rejected' })}>
                                <X className="w-4 h-4 mr-2" />
                                {t("Rejeter", "Reject")}
                            </Button>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => onUpdate(milestone.id, { status: 'approved' })}>
                                <ThumbsUp className="w-4 h-4 mr-2" />
                                {t("Approuver", "Approve")}
                            </Button>
                        </>
                    )}
                     {canOrgUpdate && (
                        <Button size="icon" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => onDelete(milestone.id)}>
                            <Trash2 className="w-4 h-4"/>
                        </Button>
                     )}
                </div>
            </div>
        </div>
    );
}

export default function MilestoneTracker({ projectId, user, locale, project }) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const t = (frText, enText) => locale === 'fr' ? frText : enText;

    const [newMilestone, setNewMilestone] = useState({ name_fr: '', name_en: '', due_date: '', notes: '' });

    const { data: milestones = [], isLoading } = useQuery({
        queryKey: ['milestones', projectId],
        queryFn: () => base44.entities.ProjectMilestone.filter({ project_id: projectId }, 'due_date'),
    });

    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['milestones', projectId] });
        },
        onError: (error) => {
            toast({ title: t("Erreur", "Error"), description: error.message, variant: "destructive" });
        },
    };

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.ProjectMilestone.create({ ...data, project_id: projectId }),
        ...mutationOptions,
        onSuccess: () => {
            mutationOptions.onSuccess();
            setNewMilestone({ name_fr: '', name_en: '', due_date: '', notes: '' });
            toast({ title: t("Jalon créé", "Milestone Created"), variant: "success" });
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.ProjectMilestone.update(id, data),
        ...mutationOptions,
        onSuccess: () => {
            mutationOptions.onSuccess();
            toast({ title: t("Jalon mis à jour", "Milestone Updated"), variant: "success" });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.ProjectMilestone.delete(id),
        ...mutationOptions,
        onSuccess: () => {
            mutationOptions.onSuccess();
            toast({ title: t("Jalon supprimé", "Milestone Deleted"), variant: "success" });
        }
    });

    const canManageMilestones = can(user, ACTIONS.MANAGE_MILESTONES, project);

    if (isLoading) {
        return <div>{t("Chargement des jalons...", "Loading milestones...")}</div>;
    }

    return (
        <div className="space-y-6">
            {canManageMilestones && user.user_role !== 'officer' && (
                 <Card className="bg-blue-50 border-blue-200">
                    <CardHeader>
                        <CardTitle className="text-lg">{t("Ajouter un jalon", "Add a Milestone")}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <Input placeholder={t("Nom (FR)", "Name (FR)")} value={newMilestone.name_fr} onChange={e => setNewMilestone({...newMilestone, name_fr: e.target.value})} />
                            <Input placeholder={t("Nom (EN)", "Name (EN)")} value={newMilestone.name_en} onChange={e => setNewMilestone({...newMilestone, name_en: e.target.value})} />
                        </div>
                        <Input type="date" value={newMilestone.due_date} onChange={e => setNewMilestone({...newMilestone, due_date: e.target.value})} />
                        <Textarea placeholder={t("Notes (optionnel)", "Notes (optional)")} value={newMilestone.notes} onChange={e => setNewMilestone({...newMilestone, notes: e.target.value})} />
                        <Button onClick={() => createMutation.mutate(newMilestone)} disabled={createMutation.isPending || !newMilestone.name_fr || !newMilestone.due_date}>
                            <Plus className="w-4 h-4 mr-2" />
                            {t("Ajouter le jalon", "Add Milestone")}
                        </Button>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-4">
                {milestones.length > 0 ? milestones.map(m => (
                    <MilestoneItem 
                        key={m.id} 
                        milestone={m} 
                        locale={locale} 
                        t={t}
                        onUpdate={(id, data) => updateMutation.mutate({ id, data })}
                        onDelete={(id) => deleteMutation.mutate(id)}
                        isOfficer={user.user_role === 'officer'}
                        canOrgUpdate={canManageMilestones}
                    />
                )) : (
                     <div className="text-center py-10 text-gray-500 border-2 border-dashed rounded-lg">
                        <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                        <p>{t("Aucun jalon défini pour ce projet.", "No milestones defined for this project.")}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
