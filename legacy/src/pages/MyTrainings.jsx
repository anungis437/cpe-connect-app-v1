import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { BookUser, Calendar, Check, Clock, Award, Loader2, Video, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";

export default function MyTrainings() {
  const [user, setUser] = useState(null);
  const [locale, setLocale] = useState('fr');

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

  const { data: attendances = [], isLoading: isLoadingAttendances } = useQuery({
    queryKey: ['myAttendances', user?.email],
    queryFn: () => base44.entities.Attendance.filter({ participant_email: user.email }),
    enabled: !!user?.email
  });

  const sessionIds = attendances.map(a => a.session_id);
  const { data: sessionsData = [], isLoading: isLoadingSessions } = useQuery({
    queryKey: ['mySessions', sessionIds],
    queryFn: () => base44.entities.Session.filter({ id: { $in: sessionIds } }),
    enabled: sessionIds.length > 0
  });
  
  const courseIds = sessionsData.map(s => s.course_id);
  const { data: coursesData = [], isLoading: isLoadingCourses } = useQuery({
      queryKey: ['myCourses', courseIds],
      queryFn: () => base44.entities.Course.filter({id: {$in: courseIds}}),
      enabled: courseIds.length > 0
  });

  const sessions = sessionsData.map(session => ({
      ...session,
      course: coursesData.find(c => c.id === session.course_id) || {}
  }));

  const myTrainings = attendances.map(att => ({
      ...att,
      session: sessions.find(s => s.id === att.session_id) || {}
  })).sort((a,b) => new Date(b.session.start_datetime) - new Date(a.session.start_datetime));

  const t = (frText, enText) => locale === 'fr' ? frText : enText;

  const isLoading = isLoadingAttendances || isLoadingSessions || isLoadingCourses;

  if (!user) return <div className="flex items-center justify-center h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <BookUser className="w-8 h-8 text-blue-900" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t("Mes Formations", "My Trainings")}</h1>
            <p className="text-gray-600 mt-1">{t("Votre parcours de formation personnel", "Your personal training journey")}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20"><Loader2 className="w-12 h-12 mx-auto animate-spin text-blue-600"/></div>
        ) : myTrainings.length === 0 ? (
          <Card className="border-none shadow-md">
            <CardContent className="p-12 text-center">
              <BookUser className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t("Aucune formation inscrite", "No Registered Trainings")}</h3>
              <p className="text-gray-600">{t("Explorez l'Académie pour trouver des formations.", "Explore the Academy to find trainings.")}</p>
              <Link to={createPageUrl("Academy")}>
                <Button className="mt-4">{t("Visiter l'Académie", "Visit Academy")}</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {myTrainings.map(training => (
              <Card key={training.id} className="border-none shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-blue-700 mb-1">{training.session.course?.stream_tag?.replace(/_/g, ' ')}</p>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {locale === 'fr' ? training.session.course?.title_fr : training.session.course?.title_en}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {format(new Date(training.session.start_datetime), "d MMMM yyyy", { locale: locale === 'fr' ? fr : enUS })}</div>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> {format(new Date(training.session.start_datetime), "HH:mm")} - {format(new Date(training.session.end_datetime), "HH:mm")}</div>
                        {training.session.mode === 'virtual' ? 
                            <div className="flex items-center gap-2"><Video className="w-4 h-4" />{t("Virtuel", "Virtual")}</div> :
                            <div className="flex items-center gap-2"><MapPin className="w-4 h-4" />{training.session.location}</div>
                        }
                      </div>
                    </div>
                    <div className="flex items-center md:flex-col md:items-end md:justify-center gap-4">
                      {training.attended ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 gap-1 text-sm"><Check className="w-4 h-4" /> {t("Présence confirmée", "Attended")}</Badge>
                      ) : (
                        <Badge variant="outline" className="text-sm">{t("À venir", "Upcoming")}</Badge>
                      )}
                      {training.certificate_token && (
                         <Link to={createPageUrl(`CertificateView?token=${training.certificate_token}`)} target="_blank">
                            <Button variant="secondary" className="gap-2 w-full"><Award className="w-4 h-4" />{t("Voir le certificat", "View Certificate")}</Button>
                         </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}