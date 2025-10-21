import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { DollarSign, Filter, Eye, Loader2, List, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";

export default function PaymentRequests() {
  const [user, setUser] = useState(null);
  const [locale, setLocale] = useState('fr');
  const [statusFilter, setStatusFilter] = useState('submitted');
  
  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        setLocale(currentUser.locale || 'fr');
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };
    loadUser();
  }, []);

  const { data: claims = [], isLoading } = useQuery({
    queryKey: ['paymentClaims', statusFilter],
    queryFn: async () => {
        const filter = statusFilter === 'all' ? {} : { status: statusFilter };
        const fetchedClaims = await base44.entities.PaymentClaim.filter(filter, '-submitted_date');
        
        // Enrich claims with project titles
        const projectIds = [...new Set(fetchedClaims.map(c => c.project_id))];
        if (projectIds.length === 0) return [];
        
        const projects = await base44.entities.Project.filter({ id: { $in: projectIds } });
        const projectsById = Object.fromEntries(projects.map(p => [p.id, p]));
        
        return fetchedClaims.map(claim => ({
            ...claim,
            project_title: projectsById[claim.project_id]?.title || "Projet inconnu"
        }));
    },
    enabled: !!user && user.user_role === 'officer',
  });

  const t = (frText, enText) => locale === 'fr' ? frText : enText;
  
  const getStatusProps = (status) => {
    switch (status) {
        case 'submitted': return { label: t('Soumis', 'Submitted'), color: 'bg-blue-100 text-blue-800' };
        case 'approved': return { label: t('Approuvé', 'Approved'), color: 'bg-green-100 text-green-800' };
        case 'rejected': return { label: t('Rejeté', 'Rejected'), color: 'bg-red-100 text-red-800' };
        case 'paid': return { label: t('Payé', 'Paid'), color: 'bg-gray-100 text-gray-800' };
        default: return { label: status, color: 'bg-gray-100' };
    }
  };

  if (!user || user.user_role !== 'officer') {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">{t("Accès réservé aux agents", "Access reserved for officers")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t("Demandes de Paiement", "Payment Requests")}</h1>
          <p className="text-gray-600 mt-1">{t("Traitez les demandes de remboursement des organisations.", "Process reimbursement claims from organizations.")}</p>
        </div>

        <Card className="border-none shadow-md">
            <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-64">
                          <SelectValue placeholder={t("Filtrer par statut...", "Filter by status...")} />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="all">{t("Toutes les demandes", "All Claims")}</SelectItem>
                          <SelectItem value="submitted">{t("Soumis", "Submitted")}</SelectItem>
                          <SelectItem value="approved">{t("Approuvé", "Approved")}</SelectItem>
                          <SelectItem value="rejected">{t("Rejeté", "Rejected")}</SelectItem>
                          <SelectItem value="paid">{t("Payé", "Paid")}</SelectItem>
                      </SelectContent>
                  </Select>
                </div>
            </CardContent>
        </Card>

        {isLoading ? (
            <div className="text-center py-20"><Loader2 className="w-12 h-12 mx-auto animate-spin text-blue-600"/></div>
        ) : claims.length === 0 ? (
            <Card className="border-none shadow-md">
                <CardContent className="p-12 text-center">
                    <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{t("Aucune demande trouvée", "No Claims Found")}</h3>
                    <p className="text-gray-600">{t("La file d'attente pour ce statut est vide.", "The queue for this status is empty.")}</p>
                </CardContent>
            </Card>
        ) : (
          <div className="space-y-4">
            {claims.map(claim => {
              const status = getStatusProps(claim.status);
              return (
                <Card key={claim.id} className="border-none shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{claim.project_title}</h3>
                          <Badge className={status.color}>{status.label}</Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          {t("Réclamation", "Claim")} #{claim.claim_number || claim.id.slice(-6)} - {t("Soumis le", "Submitted on")} {claim.submitted_date ? format(new Date(claim.submitted_date), "d MMM yyyy", { locale: locale === 'fr' ? fr : enUS }) : 'N/A'}
                        </p>
                      </div>
                      <div className="flex-1 grid grid-cols-2 gap-4 items-center">
                          <div>
                              <p className="text-sm text-gray-500">{t("Montant réclamé", "Amount Claimed")}</p>
                              <p className="font-bold text-lg">{claim.total_amount.toLocaleString()} CAD</p>
                          </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link to={createPageUrl(`ClaimDetail?id=${claim.id}`)}>
                          <Button variant="outline" className="gap-2"><Eye className="w-4 h-4"/>{t("Examiner la demande", "Review Claim")}</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
}