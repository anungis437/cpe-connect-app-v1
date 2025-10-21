
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  GraduationCap,
  Clock,
  Users,
  MapPin,
  Calendar,
  Video,
  BookOpen,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import SessionRegistrationDialog from "../components/academy/SessionRegistrationDialog";
import { Link } from "react-router-dom"; // Assuming react-router-dom is used for navigation

export default function Academy() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [locale, setLocale] = useState('fr');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStream, setSelectedStream] = useState('all');
  const [bonificationFilter, setBonificationFilter] = useState('all'); // New filter state
  const [isDialogOpen, setIsDialogOpen] = useState(false); // New state for dialog visibility
  const [selectedSession, setSelectedSession] = useState(null); // New state for session to register
  const [selectedCourse, setSelectedCourse] = useState(null); // New state for course related to session

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setLocale(currentUser.locale || 'fr');
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.filter({ active: true })
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => base44.entities.Session.list('-start_datetime')
  });

  const t = (fr, en) => locale === 'fr' ? fr : en;

  const streams = [
    { value: 'all', label: t("Tous", "All") },
    { value: 'coaching_leadership', label: t("Leadership & Coaching", "Leadership & Coaching") },
    { value: 'hrm_diagnostic', label: t("Diagnostic RH", "HR Diagnostic") },
    { value: 'digital_productivity', label: t("Productivité numérique", "Digital Productivity") },
    { value: 'artt', label: t("ARTT & Stabilisation", "ARTT & Stabilization") },
    { value: 'recruitment_qc', label: t("Recrutement QC/CA", "Recruitment QC/CA")},
    { value: 'green_transition', label: t("Transition verte", "Green Transition") },
  ];

  const filteredCourses = courses.filter(course => {
    const matchesSearch =
      (course.title_fr?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (course.title_en?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStream = selectedStream === 'all' || course.stream_tag === selectedStream;
    const matchesBonification = bonificationFilter === 'all' || (bonificationFilter === 'yes' && course.is_bonifiable_75_percent);
    return matchesSearch && matchesStream && matchesBonification;
  });

  // Combine sessions with their respective course information
  const allSessionsWithCourses = sessions.map(session => ({
    ...session,
    course: courses.find(c => c.id === session.course_id)
  })).filter(s => s.course); // Filter out sessions that do not have a matching course

  const upcomingSessions = allSessionsWithCourses.filter(s =>
    new Date(s.start_datetime) > new Date()
  ).slice(0, 6);

  // Function to handle click on register button
  const handleRegisterClick = (session) => {
    setSelectedSession(session);
    setSelectedCourse(session.course);
    setIsDialogOpen(true);
  };

  // Helper function to create URLs for navigation
  const createPageUrl = (pageNameWithParams) => {
    // This function builds a URL string. For a robust routing system,
    // this would typically interact with a router (e.g., react-router-dom's `useNavigate` or direct paths).
    // Given the `CourseDetail?id=${course.id}` format, we construct a query string.
    const [page, params] = pageNameWithParams.split('?');
    // Assuming '/Academy' is the base path for this page's context.
    return `/Academy?page=${page}${params ? '&' + params : ''}`;
  };


  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">
            {t("Académie CPE", "CPE Academy")}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t(
              "Formations et coaching pour développer vos compétences en gestion des ressources humaines",
              "Training and coaching to develop your human resources management skills"
            )}
          </p>
        </div>

        {/* Search and Filter */}
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <Input
                placeholder={t("Rechercher une formation...", "Search training...")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <div className="flex gap-2">
                 <Select value={bonificationFilter} onValueChange={setBonificationFilter}>
                    <SelectTrigger className="w-auto">
                        <SelectValue placeholder={t("Filtre bonification", "Bonus Filter")} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t("Toute éligibilité", "All Eligibility")}</SelectItem>
                        <SelectItem value="yes">{t("Bonifiable à 75%", "75% Bonus Eligible")}</SelectItem>
                    </SelectContent>
                </Select>
                <Tabs value={selectedStream} onValueChange={setSelectedStream} className="w-full md:w-auto">
                  <TabsList className="grid grid-cols-3 md:grid-cols-none md:flex">
                    {streams.map(stream => (
                      <TabsTrigger key={stream.value} value={stream.value} className="text-xs">
                        {stream.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Sessions */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t("Prochaines sessions", "Upcoming Sessions")}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingSessions.map(session => (
              <Card key={session.id} className="border-none shadow-md hover:shadow-xl transition-shadow flex flex-col">
                <CardContent className="p-6 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {session.mode === 'virtual' ? (
                        <><Video className="w-3 h-3 mr-1" /> {t("Virtuel", "Virtual")}</>
                      ) : (
                        <><MapPin className="w-3 h-3 mr-1" /> {t("Présentiel", "In-person")}</>
                      )}
                    </Badge>
                  </div>

                  {/* Display course title for the session */}
                  <h4 className="font-semibold text-lg mt-4 mb-2">{locale === 'fr' ? session.course.title_fr : session.course.title_en}</h4>

                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      {format(new Date(session.start_datetime), "d MMMM yyyy, HH:mm", {
                        locale: locale === 'fr' ? fr : enUS
                      })}
                    </div>

                    {session.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        {session.location}
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      {t(
                        `Places disponibles: ${session.capacity || 15}`,
                        `Available seats: ${session.capacity || 15}`
                      )}
                    </div>
                  </div>

                  <Button onClick={() => handleRegisterClick(session)} className="w-full mt-4 bg-blue-900 hover:bg-blue-800">
                    {t("S'inscrire", "Register")}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Course Catalog */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t("Catalogue de formations", "Course Catalog")}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {filteredCourses.map(course => (
              <Card key={course.id} className="border-none shadow-md hover:shadow-xl transition-all group">
                <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2 group-hover:text-blue-600 transition-colors">
                        {locale === 'fr' ? course.title_fr : course.title_en}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="bg-white">
                          {course.stream_tag}
                        </Badge>
                        {course.is_bonifiable_75_percent && (
                           <Badge className="bg-yellow-200 text-yellow-800 border-yellow-300">
                             {t("Bonifiable 75%", "75% Bonus")}
                           </Badge>
                        )}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-white shadow-sm">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {locale === 'fr' ? course.description_fr : course.description_en}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      {course.duration_hours}h
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      Max {course.max_participants || 15}
                    </div>
                  </div>

                  {course.objectives_fr && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-sm text-gray-900 mb-2">
                        {t("Objectifs:", "Objectives:")}
                      </h4>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {locale === 'fr' ? course.objectives_fr : course.objectives_en}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-2xl font-bold text-blue-900">
                      {course.base_price?.toLocaleString()} CAD
                    </span>
                    <Link to={createPageUrl(`CourseDetail?id=${course.id}`)}>
                      <Button variant="outline" className="hover:bg-blue-50">
                        {t("En savoir plus", "Learn More")}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      {selectedSession && selectedCourse && user && (
        <SessionRegistrationDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          session={selectedSession}
          course={selectedCourse}
          user={user}
          locale={locale}
        />
      )}
    </div>
  );
}
