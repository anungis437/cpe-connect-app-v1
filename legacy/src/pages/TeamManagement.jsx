
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { can, ACTIONS } from "../components/permissions";
import { Users, UserPlus, Loader2, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function TeamManagement() {
    const [user, setUser] = useState(null);
    const [locale, setLocale] = useState('fr');
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [newUser, setNewUser] = useState({ full_name: '', email: '', user_role: 'org_hr' });

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

    const { data: teamMembers = [], isLoading } = useQuery({
        queryKey: ['teamMembers', user?.organization_id],
        queryFn: () => base44.entities.User.filter({ organization_id: user.organization_id }),
        enabled: !!user?.organization_id,
    });

    const inviteUserMutation = useMutation({
        mutationFn: (userData) => {
            // The platform will automatically send an invite if a new user is created.
            return base44.entities.User.create({
                ...userData,
                organization_id: user.organization_id,
                phone: '000-000-0000' // Placeholder, user will update on first login
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['teamMembers', user.organization_id]);
            setNewUser({ full_name: '', email: '', user_role: 'org_hr' });
            toast({ title: t("Invitation envoyée", "Invitation Sent"), description: t("L'utilisateur recevra un email pour rejoindre votre organisation.", "The user will receive an email to join your organization."), variant: "success" });
        },
        onError: (error) => {
            toast({ title: t("Erreur", "Error"), description: error.message, variant: "destructive" });
        },
    });

    const t = (frText, enText) => locale === 'fr' ? frText : enText;

    if (!can(user, ACTIONS.MANAGE_TEAM)) {
        return <div className="p-8">{t("Accès réservé aux administrateurs de l'organisation.", "Access reserved for organization administrators.")}</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-5xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold text-gray-900">{t("Gestion de l'équipe", "Team Management")}</h1>
                
                <Card>
                    <CardHeader>
                        <CardTitle>{t("Inviter un nouveau membre", "Invite New Member")}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="user-name">{t("Nom complet", "Full Name")}</Label>
                                <Input id="user-name" value={newUser.full_name} onChange={e => setNewUser({...newUser, full_name: e.target.value})} />
                            </div>
                            <div>
                                <Label htmlFor="user-email">{t("Email", "Email")}</Label>
                                <Input id="user-email" type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                            </div>
                            <div>
                                <Label>{t("Rôle", "Role")}</Label>
                                <Select value={newUser.user_role} onValueChange={user_role => setNewUser({...newUser, user_role})}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="org_admin">{t("Admin", "Admin")}</SelectItem>
                                        <SelectItem value="org_finance">{t("Finance", "Finance")}</SelectItem>
                                        <SelectItem value="org_hr">{t("RH", "HR")}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <Button onClick={() => inviteUserMutation.mutate(newUser)} disabled={inviteUserMutation.isPending || !newUser.full_name || !newUser.email}>
                            {inviteUserMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserPlus className="w-4 h-4 mr-2" />}
                            {t("Envoyer l'invitation", "Send Invitation")}
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t("Membres de l'équipe", "Team Members")}</CardTitle>
                        <CardDescription>{t(`Votre organisation compte ${teamMembers.length} membre(s).`, `Your organization has ${teamMembers.length} member(s).`)}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Loader2 className="animate-spin" /> : (
                            <div className="space-y-2">
                                {teamMembers.map(member => (
                                    <div key={member.id} className="p-3 border rounded-lg flex items-center gap-4">
                                        <Avatar>
                                            <AvatarFallback>{member.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <p className="font-semibold">{member.full_name}</p>
                                            <p className="text-sm text-gray-600">{member.email}</p>
                                        </div>
                                        <Badge variant="outline">{t(member.user_role.replace('org_',''), member.user_role.replace('org_',''))}</Badge>
                                        {member.id !== user.id && (
                                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" disabled>
                                                <Trash2 className="w-4 h-4"/>
                                            </Button>
                                        )}
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
