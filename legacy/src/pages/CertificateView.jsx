import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Award, CheckCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";

export default function CertificateView() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const [locale, setLocale] = useState('fr'); // Default to FR for public page

    const { data: attendance, isLoading } = useQuery({
        queryKey: ['certificate', token],
        queryFn: async () => {
            if (!token) return null;
            const attendances = await base44.entities.Attendance.filter({ certificate_token: token });
            return attendances[0];
        },
        enabled: !!token,
    });

    const { data: course, isLoading: isLoadingCourse } = useQuery({
        queryKey: ['certificateCourse', attendance?.course_id],
        queryFn: () => base44.entities.Course.get(attendance.course_id),
        enabled: !!attendance?.course_id,
    });

    const t = (frText, enText) => locale === 'fr' ? frText : enText;

    if (isLoading || isLoadingCourse) {
        return <div className="flex items-center justify-center h-screen bg-gray-50"><Loader2 className="w-16 h-16 animate-spin text-blue-600"/></div>
    }

    if (!attendance || !course) {
        return <div className="flex items-center justify-center h-screen bg-gray-50"><h1 className="text-2xl text-red-600">{t("Certificat invalide ou non trouvé.", "Invalid or not found certificate.")}</h1></div>
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl bg-white shadow-2xl rounded-lg p-8 md:p-16 border-t-8 border-blue-900 relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-blue-50 rounded-full opacity-50"></div>
                <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-gray-50 rounded-full"></div>
                
                <div className="relative z-10">
                    <div className="text-center mb-8">
                        <Award className="w-24 h-24 mx-auto text-yellow-500" />
                        <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mt-4">{t("CERTIFICAT DE RÉUSSITE", "CERTIFICATE OF COMPLETION")}</h1>
                        <p className="text-lg text-gray-600 mt-2">{t("Ceci est pour certifier que", "This is to certify that")}</p>
                    </div>

                    <div className="text-center my-10">
                        <p className="text-3xl md:text-4xl font-serif text-gray-800 tracking-wider border-b-2 pb-2 inline-block">{attendance.participant_name}</p>
                    </div>

                    <div className="text-center text-gray-700">
                        <p className="text-lg">{t("a complété avec succès la formation", "has successfully completed the training")}</p>
                        <p className="text-2xl font-semibold text-blue-800 mt-2">{locale === 'fr' ? course.title_fr : course.title_en}</p>
                    </div>

                    <div className="mt-12 flex flex-col md:flex-row justify-between items-center text-center text-sm text-gray-600">
                        <div>
                            <p className="font-bold border-b pb-1">{t("Date d'émission", "Date Issued")}</p>
                            <p className="mt-1">{format(new Date(attendance.certificate_issued_date), "d MMMM yyyy", { locale: locale === 'fr' ? fr : enUS })}</p>
                        </div>
                        <div className="my-4 md:my-0">
                            <p className="font-bold border-b pb-1">CPE Connect</p>
                            <p className="mt-1">{t("Plateforme de formation agréée", "Approved Training Platform")}</p>
                        </div>
                        <div>
                            <p className="font-bold border-b pb-1">{t("ID du certificat", "Certificate ID")}</p>
                            <p className="mt-1 font-mono text-xs">{attendance.certificate_token}</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-center text-green-600 mt-10 gap-2">
                        <CheckCircle className="w-5 h-5"/>
                        <p className="font-semibold">{t("Vérifié", "Verified")}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}