
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createPageUrl } from "@/utils";

export default function CommentThread({ projectId, user, locale }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState("");
  const t = (frText, enText) => locale === 'fr' ? frText : enText;

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', projectId],
    queryFn: () => base44.entities.Comment.filter({ project_id: projectId }, '-created_date'),
    enabled: !!projectId
  });

  const addCommentMutation = useMutation({
    mutationFn: (message) => base44.entities.Comment.create({
      project_id: projectId,
      user_email: user.email,
      user_full_name: user.full_name,
      user_role: user.user_role,
      message,
    }),
    onSuccess: async (newComment) => {
      queryClient.invalidateQueries(['comments', projectId]);
      setNewMessage("");

      // Notify the other party
      const project = await base44.entities.Project.filter({id: projectId});
      if(project.length > 0) {
        // If officer is commenting, notify project creator. If org member is commenting, notify officer.
        const targetEmail = user.user_role === 'officer' ? project[0].created_by : (project[0].officer_id ? (await base44.entities.User.filter({id: project[0].officer_id}))[0]?.email : null);

        if(targetEmail && targetEmail !== user.email) {
            await base44.entities.Notification.create({
                user_email: targetEmail,
                message_fr: `${user.full_name} a laissé un commentaire sur le projet "${project[0].title}".`,
                message_en: `${user.full_name} left a comment on project "${project[0].title}".`,
                link_url: createPageUrl(`ProjectDetail?id=${projectId}&tab=comments`),
                icon: 'MessageSquare'
            });
        }
      }
    },
    onError: () => {
      toast({
        title: t("Erreur", "Error"),
        description: t("Impossible d'envoyer le commentaire.", "Could not send comment."),
        variant: "destructive",
      });
    }
  });
  
  const handlePostComment = () => {
    if (newMessage.trim()) {
      addCommentMutation.mutate(newMessage.trim());
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'officer': return 'bg-blue-100 text-blue-800';
      case 'org_admin':
      case 'org_finance':
        return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-600" />;
  }

  return (
    <div className="space-y-6">
      {/* New Comment Form */}
      <div className="flex items-start gap-4">
        <Avatar>
          <AvatarFallback className="bg-blue-900 text-white">
            {user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={t("Écrire un commentaire...", "Write a comment...")}
            className="h-24"
          />
          <Button
            onClick={handlePostComment}
            disabled={addCommentMutation.isPending || !newMessage.trim()}
          >
            {addCommentMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            {t("Envoyer", "Send")}
          </Button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>{t("Aucun commentaire pour le moment.", "No comments yet.")}</p>
          </div>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="flex items-start gap-4">
              <Avatar>
                <AvatarFallback>
                  {comment.user_full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 p-4 rounded-lg bg-white border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{comment.user_full_name}</span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${getRoleBadgeColor(comment.user_role)}`}>
                        {t(comment.user_role.replace('org_',''), comment.user_role.replace('org_',''))}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(comment.created_date), { addSuffix: true, locale: locale === 'fr' ? fr : enUS })}
                  </span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{comment.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
