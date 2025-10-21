
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { can, ACTIONS } from "../components/permissions";
import { Building2, Plus, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

export default function AdminPanel() {
    const [user, setUser] = useState(null);
    const [locale, setLocale] = useState('fr');
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [newOrg, setNewOrg] = useState({ name: '', neq: '', sector: '', size_band: '' });

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

    const { data: organizations = [], isLoading } = useQuery({
        queryKey: ['organizations'],
        queryFn: () => base44.entities.Organization.list('-created_date'),
    });

    const createOrgMutation = useMutation({
        mutationFn: (orgData) => base44.entities.Organization.create(orgData),
        onSuccess: () => {
            queryClient.invalidateQueries(['organizations']);
            setNewOrg({ name: '', neq: '', sector: '', size_band: '' });
            toast({ title: t("Organisation créée", "Organization Created"), variant: "success" });
        },
        onError: (error) => {
            toast({ title: t("Erreur", "Error"), description: error.message, variant: "destructive" });
        },
    });

    const t = (frText, enText) => locale === 'fr' ? frText : enText;

    if (!can(user, ACTIONS.MANAGE_ORGANIZATIONS)) {
        return <div className="p-8">{t("Accès refusé.", "Access denied.")}</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-5xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold text-gray-900">{t("Panneau d'Administration", "Admin Panel")}</h1>
                
                <Card>
                    <CardHeader>
                        <CardTitle>{t("Créer une nouvelle organisation", "Create New Organization")}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="org-name">{t("Nom de l'organisation", "Organization Name")}</Label>
                                <Input id="org-name" value={newOrg.name} onChange={e => setNewOrg({...newOrg, name: e.target.value})} />
                            </div>
                            <div>
                                <Label htmlFor="org-neq">NEQ</Label>
                                <Input id="org-neq" value={newOrg.neq} onChange={e => setNewOrg({...newOrg, neq: e.target.value})} />
                            </div>
                            <div>
                                <Label>{t("Secteur", "Sector")}</Label>
                                <Select value={newOrg.sector} onValueChange={sector => setNewOrg({...newOrg, sector})}>
                                    <SelectTrigger><SelectValue placeholder={t("Choisir...", "Select...")} /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="manufacturing">{t("Manufacturier", "Manufacturing")}</SelectItem>
                                        <SelectItem value="retail">{t("Détail", "Retail")}</SelectItem>
                                        <SelectItem value="services">{t("Services", "Services")}</SelectItem>
                                        <SelectItem value="technology">{t("Technologie", "Technology")}</SelectItem>
                                        <SelectItem value="other">{t("Autre", "Other")}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>{t("Taille", "Size")}</Label>
                                <Select value={newOrg.size_band} onValueChange={size_band => setNewOrg({...newOrg, size_band})}>
                                    <SelectTrigger><SelectValue placeholder={t("Choisir...", "Select...")} /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1-5">1-5</SelectItem>
                                        <SelectItem value="6-24">6-24</SelectItem>
                                        <SelectItem value="25-99">25-99</SelectItem>
                                        <SelectItem value="100-249">100-249</SelectItem>
                                        <SelectItem value="250+">250+</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <Button onClick={() => createOrgMutation.mutate(newOrg)} disabled={createOrgMutation.isPending || !newOrg.name || !newOrg.neq}>
                            {createOrgMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                            {t("Créer l'organisation", "Create Organization")}
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t("Organisations Existantes", "Existing Organizations")}</CardTitle>
                        <CardDescription>{t(`Il y a ${organizations.length} organisations sur la plateforme.`, `There are ${organizations.length} organizations on the platform.`)}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Loader2 className="animate-spin" /> : (
                            <div className="space-y-2">
                                {organizations.map(org => (
                                    <div key={org.id} className="p-3 border rounded-lg flex items-center gap-4">
                                        <Building2 className="w-5 h-5 text-gray-500"/>
                                        <div className="flex-1">
                                            <p className="font-semibold">{org.name}</p>
                                            <p className="text-sm text-gray-600">NEQ: {org.neq} | {t("Secteur:", "Sector:")} {org.sector}</p>
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
