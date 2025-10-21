import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, BookOpen, Clock, Users, DollarSign, Calendar, Video, MapPin, Loader2, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import SessionRegistrationDialog from "../components/academy/SessionRegistrationDialog";

export default function CourseDetail() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('id');
  
  const [user, setUser] = useState(null);
  const [locale, setLocale] = useState('fr');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        setLocale(currentUser.locale || 'fr');
      } catch (error) {
        console.error("Error loading user", error);
      }
    };
    loadUser();
  }, []);

  const { data: course, isLoading: isLoadingCourse } = useQuery({
    queryKey: ['courseDetail', courseId],
    queryFn: async () => {
      const courses = await base44.entities.Course.filter({ id: courseId });
      return courses[0];
    },
    enabled: !!courseId,
  });

  const { data: sessions = [], isLoading: isLoadingSessions } = useQuery({
    queryKey: ['courseSessions', courseId],
    queryFn: () => base44.entities.Session.filter({ course_id: courseId }, '-start_datetime'),
    enabled: !!courseId,
  });
  
  const t = (frText, enText) => locale === 'fr' ? frText : enText;

  const handleRegisterClick = (session) => {
    setSelectedSession(session);
    setIsDialogOpen(true);
  }

  if (isLoadingCourse || !user) {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="w-12 h-12 animate-spin text-blue-600" /></div>;
  }
  
  if (!course) {
    return <div className="text-center py-20">{t("Cours non trouvé", "Course not found")}</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl("Academy"))}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{locale === 'fr' ? course.title_fr : course.title_en}</h1>
            <Badge variant="outline" className="mt-2">{course.stream_tag.replace(/_/g, ' ')}</Badge>
          </div>
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3"><BookOpen className="w-6 h-6 text-blue-700"/>{t("Description du cours", "Course Description")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-6">{locale === 'fr' ? course.description_fr : course.description_en}</p>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="p-4 bg-gray-50 rounded-lg"><Clock className="w-6 h-6 mx-auto mb-2 text-blue-600"/><p className="font-semibold">{course.duration_hours} {t("heures", "hours")}</p></div>
              <div className="p-4 bg-gray-50 rounded-lg"><Users className="w-6 h-6 mx-auto mb-2 text-blue-600"/><p className="font-semibold">Max {course.max_participants} {t("participants", "participants")}</p></div>
              <div className="p-4 bg-gray-50 rounded-lg"><DollarSign className="w-6 h-6 mx-auto mb-2 text-blue-600"/><p className="font-semibold">{course.base_price?.toLocaleString()} CAD</p></div>
            </div>
            
            <h3 className="text-lg font-semibold mt-8 mb-4">{t("Objectifs d'apprentissage", "Learning Objectives")}</h3>
            <p className="text-gray-700 whitespace-pre-line">{locale === 'fr' ? course.objectives_fr : course.objectives_en}</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3"><Calendar className="w-6 h-6 text-blue-700"/>{t("Sessions à venir", "Upcoming Sessions")}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingSessions ? <Loader2 className="mx-auto animate-spin"/> : sessions.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                    <Info className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                    <p>{t("Aucune session n'est planifiée pour ce cours pour le moment.", "No sessions are scheduled for this course at the moment.")}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {sessions.map(session => (
                        <div key={session.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-lg border hover:shadow-md transition-shadow">
                            <div>
                                <p className="font-bold text-lg">{format(new Date(session.start_datetime), "d MMMM yyyy", { locale: locale === 'fr' ? fr : enUS })}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                    <span><Clock className="w-4 h-4 inline mr-1"/>{format(new Date(session.start_datetime), "HH:mm")} - {format(new Date(session.end_datetime), "HH:mm")}</span>
                                    {session.mode === 'virtual' ? 
                                        <span><Video className="w-4 h-4 inline mr-1"/>{t("Virtuel", "Virtual")}</span> :
                                        <span><MapPin className="w-4 h-4 inline mr-1"/>{session.location}</span>
                                    }
                                </div>
                            </div>
                            <Button onClick={() => handleRegisterClick(session)} className="mt-4 md:mt-0">{t("Inscrire des participants", "Register Participants")}</Button>
                        </div>
                    ))}
                </div>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedSession && user && (
        <SessionRegistrationDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          session={selectedSession}
          course={course}
          user={user}
          locale={locale}
        />
      )}
    </div>
  );
}