import React, { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

export default function ClaimSubmissionDialog({ isOpen, onClose, project, user, uncalimedCostLines, locale }) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const t = (frText, enText) => locale === 'fr' ? frText : enText;

    const [selectedLineIds, setSelectedLineIds] = useState([]);

    const { total, reimbursable } = useMemo(() => {
        return uncalimedCostLines.reduce(
            (acc, line) => {
                if (selectedLineIds.includes(line.id)) {
                    acc.total += line.total || 0;
                    acc.reimbursable += line.reimbursable || 0;
                }
                return acc;
            },
            { total: 0, reimbursable: 0 }
        );
    }, [selectedLineIds, uncalimedCostLines]);

    const handleSelectLine = (lineId) => {
        setSelectedLineIds(prev =>
            prev.includes(lineId) ? prev.filter(id => id !== lineId) : [...prev, lineId]
        );
    };

    const submitClaimMutation = useMutation({
        mutationFn: async () => {
            if (selectedLineIds.length === 0) {
                throw new Error(t("Veuillez sélectionner au moins une ligne de coût.", "Please select at least one cost line."));
            }

            // 1. Create the PaymentClaim record
            const claimPayload = {
                project_id: project.id,
                organization_id: user.organization_id,
                status: 'submitted',
                submitted_date: new Date().toISOString(),
                total_amount: reimbursable
            };
            const newClaim = await base44.entities.PaymentClaim.create(claimPayload);

            // 2. Update all selected cost lines with the new claim ID
            // This should ideally be a single transaction, but we do it sequentially.
            // A robust backend would handle this atomically.
            for (const lineId of selectedLineIds) {
                await base44.entities.CostLine.update(lineId, { payment_claim_id: newClaim.id });
            }

            return newClaim;
        },
        onSuccess: () => {
            toast({
                title: t("Demande soumise", "Claim Submitted"),
                description: t("Votre demande de remboursement a été envoyée pour révision.", "Your reimbursement claim has been sent for review."),
                variant: "success"
            });
            queryClient.invalidateQueries({ queryKey: ['costLines', project.id] });
            queryClient.invalidateQueries({ queryKey: ['paymentClaims'] });
            onClose();
        },
        onError: (error) => {
            toast({
                title: t("Erreur de soumission", "Submission Error"),
                description: error.message,
                variant: "destructive"
            });
        }
    });

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{t("Soumettre une demande de remboursement", "Submit Reimbursement Claim")}</DialogTitle>
                    <DialogDescription>{t("Sélectionnez les lignes de coût à inclure dans cette demande.", "Select the cost lines to include in this claim.")}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <ScrollArea className="h-72 w-full rounded-md border p-4">
                        <div className="space-y-2">
                            {uncalimedCostLines.length > 0 ? (
                                uncalimedCostLines.map(line => (
                                    <div key={line.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50">
                                        <Checkbox
                                            id={`line-${line.id}`}
                                            checked={selectedLineIds.includes(line.id)}
                                            onCheckedChange={() => handleSelectLine(line.id)}
                                        />
                                        <label htmlFor={`line-${line.id}`} className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            <div className="flex justify-between items-center">
                                                <span>{line.description}</span>
                                                <span className="font-bold text-green-600">{line.reimbursable?.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</span>
                                            </div>
                                        </label>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-sm text-gray-500">{t("Aucune ligne de coût non réclamée disponible.", "No unclaimed cost lines available.")}</p>
                            )}
                        </div>
                    </ScrollArea>
                    <div className="p-4 bg-gray-100 rounded-lg text-right">
                        <p className="text-sm text-gray-600">{t("Montant total réclamé", "Total Amount Claimed")}</p>
                        <p className="text-2xl font-bold text-gray-900">{reimbursable.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={onClose}>{t("Annuler", "Cancel")}</Button>
                    <Button onClick={() => submitClaimMutation.mutate()} disabled={submitClaimMutation.isPending || selectedLineIds.length === 0}>
                        {submitClaimMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {t("Soumettre la demande", "Submit Claim")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}