import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

export default function RejectionDialog({ isOpen, onClose, onConfirm, isConfirming, locale }) {
  const [reason, setReason] = useState('');
  const t = (fr, en) => locale === 'fr' ? fr : en;

  const handleConfirm = () => {
    onConfirm(reason);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("Confirmer le rejet", "Confirm Rejection")}</DialogTitle>
          <DialogDescription>
            {t("Veuillez fournir une raison pour le rejet. Cette information sera visible par l'organisation.", "Please provide a reason for the rejection. This information will be visible to the organization.")}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="rejection-reason">{t("Raison du rejet", "Rejection Reason")} *</Label>
          <Textarea
            id="rejection-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t("Ex: Le jalon n'est pas complètement terminé...", "Ex: The milestone is not fully completed...")}
            className="mt-2"
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>{t("Annuler", "Cancel")}</Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isConfirming || !reason.trim()}
          >
            {isConfirming && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {t("Confirmer le rejet", "Confirm Rejection")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}