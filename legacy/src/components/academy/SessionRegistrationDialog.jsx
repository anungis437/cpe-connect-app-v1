
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Trash2, Loader2, User, Mail } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function SessionRegistrationDialog({ isOpen, onClose, session, course, user, locale }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const t = (frText, enText) => locale === 'fr' ? frText : enText;

  const [participants, setParticipants] = useState([{ name: user.full_name, email: user.email }]); // Pre-fill with current user
  const [selectedProject, setSelectedProject] = useState('');
  
  const { data: projects = [] } = useQuery({
    queryKey: ['userProjects', user.organization_id],
    queryFn: () => base44.entities.Project.filter({ organization_id: user.organization_id, status: 'in_progress' }),
    enabled: !!user.organization_id
  });

  const handleParticipantChange = (index, field, value) => {
    const newParticipants = [...participants];
    newParticipants[index][field] = value;
    setParticipants(newParticipants);
  };

  const addParticipant = () => setParticipants([...participants, { name: '', email: '' }]);
  const removeParticipant = (index) => setParticipants(participants.filter((_, i) => i !== index));

  const registrationMutation = useMutation({
    mutationFn: async () => {
      const validParticipants = participants.filter(p => p.name && p.email);
      if (validParticipants.length === 0) throw new Error(t("Veuillez ajouter au moins un participant valide.", "Please add at least one valid participant."));
      if (!selectedProject) throw new Error(t("Veuillez sélectionner un projet.", "Please select a project."));

      // 1. Create Attendance records
      const attendancePayload = validParticipants.map(p => ({
        session_id: session.id,
        course_id: course.id,
        project_id: selectedProject,
        organization_id: user.organization_id,
        participant_name: p.name,
        participant_email: p.email,
      }));
      await base44.entities.Attendance.bulkCreate(attendancePayload);

      // 2. Create CostLine record
      const totalCost = course.base_price * validParticipants.length; // Price per participant
      const project = projects.find(p => p.id === selectedProject);
      
      // Use project-specific funding rate if available, otherwise fallback, then use course bonification
      let fundingRate = project?.funding_rate || 0.5; // Default/fallback
      if (course.is_bonifiable_75_percent) {
          fundingRate = 0.75;
      }
      
      await base44.entities.CostLine.create({
        project_id: selectedProject,
        category: 'training',
        description: `${t('Formation:', 'Training:')} ${locale === 'fr' ? course.title_fr : course.title_en} (${validParticipants.length} ${t('participant(s)', 'participant(s)')})`,
        quantity: validParticipants.length,
        unit_cost: course.base_price,
        total: totalCost,
        funding_rate: fundingRate,
        reimbursable: totalCost * fundingRate,
      });
    },
    onSuccess: () => {
      toast({
        title: t("Inscription réussie", "Registration Successful"),
        description: t("Les participants ont été inscrits et le coût a été ajouté au projet.", "Participants have been registered and the cost has been added to the project."),
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ['costLines', selectedProject] });
      queryClient.invalidateQueries({ queryKey: ['myAttendances'] });
      onClose();
      setParticipants([{ name: user.full_name, email: user.email }]); // Reset to pre-fill with current user
      setSelectedProject('');
    },
    onError: (error) => {
      toast({
        title: t("Erreur d'inscription", "Registration Error"),
        description: error.message || t("Une erreur est survenue.", "An error occurred."),
        variant: "destructive",
      });
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("Inscrire à la session", "Register for Session")}</DialogTitle>
          <DialogDescription>{locale === 'fr' ? course.title_fr : course.title_en}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="project">{t("Lier à un projet en cours", "Link to an active project")} *</Label>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger id="project"><SelectValue placeholder={t("Sélectionner un projet...", "Select a project...")} /></SelectTrigger>
              <SelectContent>
                {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <Label>{t("Participants", "Participants")}</Label>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {participants.map((p, i) => (
              <div key={i} className="flex items-center gap-2 p-2 border rounded-md">
                <div className="relative flex-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input placeholder={t("Nom complet", "Full Name")} value={p.name} onChange={e => handleParticipantChange(i, 'name', e.target.value)} className="pl-9" />
                </div>
                <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input type="email" placeholder="Email" value={p.email} onChange={e => handleParticipantChange(i, 'email', e.target.value)} className="pl-9" />
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeParticipant(i)}><Trash2 className="w-4 h-4 text-red-500"/></Button>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={addParticipant} className="gap-2"><Plus className="w-4 h-4" />{t("Ajouter un participant", "Add Participant")}</Button>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>{t("Annuler", "Cancel")}</Button>
          <Button onClick={() => registrationMutation.mutate()} disabled={registrationMutation.isPending || !selectedProject}>
            {registrationMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {t("Confirmer l'inscription", "Confirm Registration")} ({ (course.base_price * participants.length).toLocaleString()} CAD)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
