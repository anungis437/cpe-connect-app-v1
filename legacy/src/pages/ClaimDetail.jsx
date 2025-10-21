
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { can, ACTIONS } from "../components/permissions";
import { ArrowLeft, CheckCircle2, XCircle, DollarSign, Loader2, FileText, Download, Wallet, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { fr, enUS } from 'date-fns/locale';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import RejectionDialog from "../components/shared/RejectionDialog";

export default function ClaimDetail() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [user, setUser] = useState(null);
    const [locale, setLocale] = useState('fr');
    const urlParams = new URLSearchParams(window.location.search);
    const claimId = urlParams.get('id');

    const [isRejectionDialogOpen, setIsRejectionDialogOpen] = useState(false);
    const [isPaidDialogOpen, setIsPaidDialogOpen] = useState(false);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const currentUser = await base44.auth.me();
                setUser(currentUser);
                setLocale(currentUser.locale || 'fr');
            } catch (error) { console.error(error); }
        };
        loadUser();
    }, []);

    const t = (frText, enText) => locale === 'fr' ? frText : enText;

    const { data: claim, isLoading: isLoadingClaim } = useQuery({
        queryKey: ['claimDetail', claimId],
        queryFn: async () => {
            const claims = await base44.entities.PaymentClaim.filter({ id: claimId });
            if (claims.length === 0) throw new Error("Claim not found");
            const claimData = claims[0];
            
            const projects = await base44.entities.Project.filter({ id: claimData.project_id });
            claimData.project_title = projects[0]?.title || "Projet Inconnu";

            return claimData;
        },
        enabled: !!claimId,
    });

    const { data: costLines = [], isLoading: isLoadingCostLines } = useQuery({
        queryKey: ['claimCostLines', claimId],
        queryFn: () => base44.entities.CostLine.filter({ payment_claim_id: claimId }),
        enabled: !!claimId,
    });

    const updateClaimStatusMutation = useMutation({
        mutationFn: async ({ status, reason }) => {
            if (!can(user, status === 'approved' ? ACTIONS.APPROVE_CLAIM : ACTIONS.REJECT_CLAIM, claim)) {
                throw new Error("Action not allowed.");
            }
            const payload = { status };
            if (status === 'approved') payload.approved_date = new Date().toISOString();
            
            if (status === 'rejected') {
                payload.rejection_reason = reason;
                // Reset cost lines so they can be re-claimed
                const lineIds = costLines.map(line => line.id);
                for (const id of lineIds) {
                    await base44.entities.CostLine.update(id, { payment_claim_id: null });
                }
            }
            const updatedClaim = await base44.entities.PaymentClaim.update(claimId, payload);
            
            // Notification
            if (user) {
              const projects = await base44.entities.Project.filter({id: updatedClaim.project_id});
              if(projects.length > 0) {
                 await base44.entities.Notification.create({
                    user_email: projects[0].created_by,
                    message_fr: `Votre demande de paiement pour le projet "${projects[0].title}" a été ${status === 'approved' ? 'approuvée' : 'rejetée'}.`,
                    message_en: `Your payment claim for project "${projects[0].title}" has been ${status === 'approved' ? 'approved' : 'rejected'}.`,
                    link_url: createPageUrl(`ProjectDetail?id=${projects[0].id}`),
                    icon: status === 'approved' ? 'CheckCircle2' : 'AlertCircle'
                });
              }
            }

            return updatedClaim;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['claimDetail', claimId]);
            queryClient.invalidateQueries(['paymentClaims']);
            toast({
                title: t("Statut de la demande mis à jour", "Claim Status Updated"),
                description: t(`La demande a été marquée comme ${data.status}.`, `The claim has been marked as ${data.status}.`),
                variant: "success",
            });
            navigate(createPageUrl('PaymentRequests'));
        },
        onError: (error) => {
            toast({ title: t("Erreur", "Error"), description: error.message, variant: "destructive" });
        }
    });
    
    const markAsPaidMutation = useMutation({
        mutationFn: async ({ notes }) => {
            if (!can(user, ACTIONS.MARK_CLAIM_PAID, claim)) {
                throw new Error("Action not allowed.");
            }
            return await base44.entities.PaymentClaim.update(claimId, {
                status: 'paid',
                paid_date: new Date().toISOString(),
                payment_notes: notes
            });
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['claimDetail', claimId]);
            queryClient.invalidateQueries(['paymentClaims']);
            toast({
                title: t("Demande payée", "Claim Paid"),
                description: t("La demande a été marquée comme payée.", "The claim has been marked as paid."),
                variant: "success",
            });
        },
        onError: (error) => {
            toast({ title: t("Erreur", "Error"), description: error.message, variant: "destructive" });
        }
    });

    const handleReject = (reason) => {
        updateClaimStatusMutation.mutate({ status: 'rejected', reason });
        setIsRejectionDialogOpen(false);
    };

    const handleMarkAsPaid = (notes) => {
        markAsPaidMutation.mutate({ notes });
        setIsPaidDialogOpen(false);
    }

    const downloadReceipt = async (fileUrl) => {
        try {
            const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: fileUrl });
            window.open(signed_url, '_blank');
        } catch (error) {
            toast({ title: t("Erreur de téléchargement", "Download Error"), description: error.message, variant: "destructive" });
        }
    };

    if (isLoadingClaim || isLoadingCostLines || !user) {
        return <div className="flex items-center justify-center h-screen"><Loader2 className="w-12 h-12 animate-spin text-blue-600" /></div>;
    }

    if (!claim) {
        return <div className="text-center py-20">{t("Demande non trouvée", "Claim not found")}</div>
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex justify-between items-start">
                    <div>
                        <Button variant="ghost" onClick={() => navigate(createPageUrl("PaymentRequests"))} className="mb-4 -ml-4">
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            {t("Retour aux demandes", "Back to Claims")}
                        </Button>
                        <h1 className="text-3xl font-bold text-gray-900">{t("Détail de la Réclamation", "Claim Details")}</h1>
                        <p className="text-gray-600">{t("Projet:", "Project:")} {claim.project_title}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {can(user, ACTIONS.APPROVE_CLAIM, claim) && (
                            <>
                                <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => setIsRejectionDialogOpen(true)}>
                                    <XCircle className="w-4 h-4 mr-2" />
                                    {t("Rejeter", "Reject")}
                                </Button>
                                <Button className="bg-green-600 hover:bg-green-700" onClick={() => updateClaimStatusMutation.mutate({ status: 'approved' })}>
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    {t("Approuver", "Approve")}
                                </Button>
                            </>
                        )}
                        {can(user, ACTIONS.MARK_CLAIM_PAID, claim) && (
                             <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsPaidDialogOpen(true)}>
                                <Wallet className="w-4 h-4 mr-2" />
                                {t("Marquer comme Payé", "Mark as Paid")}
                            </Button>
                        )}
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{t("Résumé de la demande", "Claim Summary")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <dt className="text-gray-500">{t("Statut", "Status")}</dt>
                                <dd className="font-semibold text-lg">{claim.status}</dd>
                            </div>
                             <div className="p-4 bg-gray-50 rounded-lg">
                                <dt className="text-gray-500">{t("Montant Réclamé", "Claimed Amount")}</dt>
                                <dd className="font-semibold text-lg text-green-600">{claim.total_amount?.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</dd>
                            </div>
                             <div className="p-4 bg-gray-50 rounded-lg">
                                <dt className="text-gray-500">{t("Date de soumission", "Submission Date")}</dt>
                                <dd className="font-semibold">{claim.submitted_date ? format(new Date(claim.submitted_date), 'PPP', { locale: locale === 'fr' ? fr : enUS }) : 'N/A'}</dd>
                            </div>
                        </div>
                        {claim.rejection_reason && (
                             <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-200">
                                <h4 className="font-semibold text-red-800">{t("Raison du rejet", "Rejection Reason")}</h4>
                                <p className="text-sm text-red-700 mt-1">{claim.rejection_reason}</p>
                            </div>
                        )}
                        {claim.status === 'paid' && claim.payment_notes && (
                             <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
                                <h4 className="font-semibold text-blue-800">{t("Notes de paiement", "Payment Notes")}</h4>
                                <p className="text-sm text-blue-700 mt-1">{claim.payment_notes}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>{t("Lignes de Coût Incluses", "Included Cost Lines")}</CardTitle></CardHeader>
                    <CardContent>
                        <div className="rounded-lg border overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t("Description", "Description")}</th>
                                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">{t("Coût Total", "Total Cost")}</th>
                                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">{t("Montant Réclamé", "Amount Claimed")}</th>
                                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">{t("Reçu", "Receipt")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {costLines.map(line => (
                                        <tr key={line.id} className="border-t hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm">{line.description}</td>
                                            <td className="px-4 py-3 text-sm text-right">{line.total?.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</td>
                                            <td className="px-4 py-3 text-sm font-medium text-green-600 text-right">{line.reimbursable?.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</td>
                                            <td className="px-4 py-3 text-center">
                                                {line.receipt_url ? (
                                                    <Button variant="ghost" size="icon" onClick={() => downloadReceipt(line.receipt_url)}><Download className="w-4 h-4" /></Button>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">{t("N/A", "N/A")}</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-100 border-t-2">
                                    <tr>
                                        <td colSpan="2" className="px-4 py-3 text-right font-semibold">{t("Total Réclamé", "Total Claimed")}</td>
                                        <td className="px-4 py-3 text-right font-bold text-lg">{claim.total_amount?.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
            {isRejectionDialogOpen && (
                <RejectionDialog
                    isOpen={isRejectionDialogOpen}
                    onClose={() => setIsRejectionDialogOpen(false)}
                    onConfirm={handleReject}
                    isConfirming={updateClaimStatusMutation.isPending}
                    locale={locale}
                />
            )}
             {isPaidDialogOpen && (
                <PaidDialog
                    isOpen={isPaidDialogOpen}
                    onClose={() => setIsPaidDialogOpen(false)}
                    onConfirm={handleMarkAsPaid}
                    isConfirming={markAsPaidMutation.isPending}
                    locale={locale}
                />
            )}
        </div>
    );
}

// A new sub-component for the "Mark as Paid" dialog
function PaidDialog({ isOpen, onClose, onConfirm, isConfirming, locale }) {
    const [notes, setNotes] = useState('');
    const t = (fr, en) => locale === 'fr' ? fr : en;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("Marquer comme Payé", "Mark as Paid")}</DialogTitle>
                    <DialogDescription>{t("Confirmez que cette demande a été payée. Vous pouvez ajouter des notes de transaction.", "Confirm this claim has been paid. You can add transaction notes.")}</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="payment-notes">{t("Notes de paiement (optionnel)", "Payment Notes (optional)")}</Label>
                    <Textarea id="payment-notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder={t("ID de transaction, date de virement...", "Transaction ID, transfer date...")} className="mt-2" />
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={onClose}>{t("Annuler", "Cancel")}</Button>
                    <Button onClick={() => onConfirm(notes)} disabled={isConfirming} className="bg-blue-600 hover:bg-blue-700">
                        {isConfirming && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {t("Confirmer le paiement", "Confirm Payment")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
