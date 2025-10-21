
import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQueries } from "@tanstack/react-query";
import { can, ACTIONS } from "../components/permissions";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, DollarSign, FileCheck, Clock, Building } from 'lucide-react';
import { format, differenceInDays, startOfMonth } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import _ from 'lodash';

const COLORS = ['#003f5c', '#444e86', '#955196', '#dd5182', '#ff6e54', '#ffa600'];

const CustomTooltip = ({ active, payload, label, locale }) => {
  const t = (frText, enText) => locale === 'fr' ? frText : enText;
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-white border rounded shadow-lg">
        <p className="label font-bold">{`${label}`}</p>
        {payload.map((pld, index) => (
          <p key={index} style={{ color: pld.color }}>
            {`${pld.name}: ${pld.value.toLocaleString()}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};


export default function Reports() {
    const [user, setUser] = useState(null);
    const [locale, setLocale] = useState('fr');

    useEffect(() => {
        const loadUser = async () => {
            try {
                const currentUser = await base44.auth.me();
                setUser(currentUser);
                setLocale(currentUser.locale || 'fr');
            } catch (error) { console.error("Error loading user:", error); }
        };
        loadUser();
    }, []);

    const t = (frText, enText) => locale === 'fr' ? frText : enText;

    const results = useQueries({
        queries: [
            { queryKey: ['reportProjects'], queryFn: () => base44.entities.Project.list(undefined, 1000) },
            { queryKey: ['reportClaims'], queryFn: () => base44.entities.PaymentClaim.list(undefined, 1000) },
            { queryKey: ['reportOrgs'], queryFn: () => base44.entities.Organization.list(undefined, 1000) },
        ],
    });

    const isLoading = results.some(r => r.isLoading);
    const projects = results[0]?.data || [];
    const claims = results[1]?.data || [];
    const orgs = results[2]?.data || [];

    const reportData = useMemo(() => {
        if (isLoading || projects.length === 0) return null;

        const totalFundingDisbursed = _.sumBy(claims.filter(c => c.status === 'paid'), 'total_amount');
        const totalProjectsFunded = projects.filter(p => ['approved', 'in_progress', 'completed', 'closed'].includes(p.status)).length;
        
        const approvedProjects = projects.filter(p => p.status === 'approved' && p.updated_date);
        const approvalTimes = approvedProjects.map(p => differenceInDays(new Date(p.updated_date), new Date(p.created_date)));
        const averageApprovalTime = approvalTimes.length > 0 ? _.mean(approvalTimes) : 0;
        
        const orgsOnboarded = orgs.length;

        const projectsByStream = _.countBy(projects, 'stream');
        const projectsByStreamData = Object.entries(projectsByStream).map(([name, count]) => ({ name, [t('Projets','Projects')]: count }));

        const orgsById = _.keyBy(orgs, 'id');
        const fundingBySector = projects.reduce((acc, project) => {
            const org = orgsById[project.organization_id];
            if (org && project.approved_funding) {
                const sector = org.sector || 'other';
                acc[sector] = (acc[sector] || 0) + project.approved_funding;
            }
            return acc;
        }, {});
        const fundingBySectorData = Object.entries(fundingBySector).map(([name, value]) => ({ name, value }));

        const submissionsByMonth = _.groupBy(projects, p => format(startOfMonth(new Date(p.created_date)), 'yyyy-MM-dd'));
        const submissionsByMonthData = Object.entries(submissionsByMonth)
            .map(([month, projects]) => ({
                month: format(new Date(month), 'MMM yyyy', { locale: locale === 'fr' ? fr : enUS }),
                [t('Soumissions','Submissions')]: projects.length
            }))
            .sort((a,b) => new Date(a.month) - new Date(b.month));

        return {
            kpis: {
                totalFundingDisbursed,
                totalProjectsFunded,
                averageApprovalTime,
                orgsOnboarded
            },
            charts: {
                projectsByStreamData,
                fundingBySectorData,
                submissionsByMonthData
            }
        };

    }, [projects, claims, orgs, isLoading, locale]);

    if (isLoading || !user) {
        return <div className="flex items-center justify-center h-screen"><Loader2 className="w-12 h-12 animate-spin text-blue-600" /></div>;
    }

    if (!can(user, ACTIONS.VIEW_REPORTS)) {
        return (
            <div className="flex items-center justify-center h-screen text-center">
                 <div>
                    <FileCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {t("Accès non autorisé", "Unauthorized Access")}
                    </h3>
                    <p className="text-gray-600">
                        {t("Vous n'avez pas la permission de voir cette page.", "You do not have permission to view this page.")}
                    </p>
                </div>
            </div>
        );
    }
    
    if (!reportData) {
         return (
            <div className="flex items-center justify-center h-screen text-center">
                <div>
                    <FileCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {t("Pas assez de données", "Not Enough Data")}
                    </h3>
                    <p className="text-gray-600">
                        {t("Les rapports apparaîtront une fois que des données de projet existeront.", "Reports will appear once project data exists.")}
                    </p>
                </div>
            </div>
        );
    }

    const { kpis, charts } = reportData;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{t("Rapports & Analytique", "Reports & Analytics")}</h1>
                    <p className="text-gray-600 mt-1">{t("Aperçu de la performance et de l'impact du programme.", "An overview of program performance and impact.")}</p>
                </div>

                {/* KPIs */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t("Financement décaissé", "Funding Disbursed")}</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{kpis.totalFundingDisbursed.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t("Projets financés", "Projects Funded")}</CardTitle>
                            <FileCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{kpis.totalProjectsFunded}</div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t("Temps d'approbation moyen", "Avg. Approval Time")}</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{`${Math.round(kpis.averageApprovalTime)} ${t('jours', 'days')}`}</div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t("Organisations", "Organizations")}</CardTitle>
                            <Building className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{kpis.orgsOnboarded}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("Soumissions de projet par mois", "Project Submissions per Month")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={charts.submissionsByMonthData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip content={<CustomTooltip locale={locale} />} />
                                    <Line type="monotone" dataKey={t('Soumissions','Submissions')} stroke="#003f5c" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>{t("Projets par volet", "Projects by Stream")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={charts.projectsByStreamData} layout="vertical" margin={{ left: 120 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="name" type="category" width={100} interval={0} />
                                    <Tooltip content={<CustomTooltip locale={locale} />} />
                                    <Bar dataKey={t('Projets','Projects')} fill="#444e86" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                 <Card>
                    <CardHeader>
                        <CardTitle>{t("Financement approuvé par secteur", "Approved Funding by Sector")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={charts.fundingBySectorData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    nameKey="name"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {charts.fundingBySectorData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => value.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}/>
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
