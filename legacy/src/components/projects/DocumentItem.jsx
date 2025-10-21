import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Download, Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function DocumentItem({ doc, locale, t, projectId, user }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const downloadMutation = useMutation({
    mutationFn: async () => {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: doc.file_url });
      return signed_url;
    },
    onSuccess: (signedUrl) => {
      window.open(signedUrl, '_blank');
    },
    onError: (error) => {
      toast({
        title: t("Erreur de téléchargement", "Download Error"),
        description: t(`Impossible de télécharger le fichier: ${error.message}`, `Failed to download file: ${error.message}`),
        variant: "destructive",
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (documentId) => {
      await base44.entities.Document.delete(documentId);
      if (user) {
        await base44.entities.AuditLog.create({
          actor_email: user.email,
          action: "document_deleted",
          object_type: "document",
          object_id: documentId,
          before_data: { fileName: doc.file_name, kind: doc.kind, projectId: projectId }
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', projectId] });
      toast({
        title: t("Document supprimé", "Document Deleted"),
        description: t("Le document a été supprimé avec succès.", "The document has been successfully deleted."),
        variant: "success",
      });
    },
    onError: (error) => {
      toast({
        title: t("Erreur de suppression", "Deletion Error"),
        description: t(`Impossible de supprimer le document: ${error.message}`, `Failed to delete document: ${error.message}`),
        variant: "destructive",
      });
    }
  });

  return (
    <div className="flex items-center justify-between p-2 rounded bg-gray-50 border border-gray-200">
      <span className="text-sm text-gray-700 truncate mr-2">{doc.file_name}</span>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => downloadMutation.mutate()}
          disabled={downloadMutation.isPending}
        >
          {downloadMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => deleteMutation.mutate(doc.id)}
          disabled={deleteMutation.isPending}
          className="text-red-500 hover:text-red-700"
        >
          {deleteMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}