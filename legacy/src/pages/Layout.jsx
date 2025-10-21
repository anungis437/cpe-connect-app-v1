

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { can, ACTIONS } from "../components/permissions";
import {
  LayoutDashboard,
  FileText,
  DollarSign,
  GraduationCap,
  BarChart3,
  Settings,
  Languages,
  Building2,
  LogOut,
  BookUser,
  Bell,
  CheckCircle2,
  MessageSquare,
  AlertCircle,
  Users
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Toaster } from "@/components/ui/toaster";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDistanceToNow } from "date-fns";
import { fr, enUS } from "date-fns/locale";


const ICON_MAP = {
  CheckCircle2,
  MessageSquare,
  AlertCircle,
  DollarSign
};

export default function Layout({ children }) {
  const location = useLocation();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [locale, setLocale] = useState('fr');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

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

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.Notification.filter({ user_email: user.email }, '-created_date', 20);
    },
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId) => base44.entities.Notification.update(notificationId, { is_read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications', user?.email]);
    }
  });

  const markAllAsRead = () => {
    notifications.forEach(n => {
      if (!n.is_read) {
        markAsReadMutation.mutate(n.id);
      }
    });
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const toggleLanguage = async () => {
    const newLocale = locale === 'fr' ? 'en' : 'fr';
    setLocale(newLocale);
    if (user) {
      await base44.auth.updateMe({ locale: newLocale });
    }
  };

  const t = (fr, en) => locale === 'fr' ? fr : en;

  const getNavigationItems = () => {
    const role = user?.user_role || 'org_admin'; // Default to org_admin if role is not available

    const commonItems = [
      {
        title: t("Tableau de bord", "Dashboard"),
        url: createPageUrl("Dashboard"),
        icon: LayoutDashboard,
      },
    ];

    if (role === 'org_admin' || role === 'org_finance' || role === 'org_hr') {
      return [
        ...commonItems,
        {
          title: t("Nouveau projet", "New Project"),
          url: createPageUrl("ProjectIntake"),
          icon: FileText,
        },
        {
          title: t("Mes projets", "My Projects"),
          url: createPageUrl("Projects"),
          icon: Building2,
        },
        {
          title: t("Académie CPE", "CPE Academy"),
          url: createPageUrl("Academy"),
          icon: GraduationCap,
        },
        {
          title: t("Mes Formations", "My Trainings"),
          url: createPageUrl("MyTrainings"),
          icon: BookUser,
        },
      ];
    }

    if (role === 'officer') {
      const items = [
        ...commonItems,
        {
          title: t("Révision", "Review"),
          url: createPageUrl("ReviewProjects"),
          icon: FileText,
        },
        {
          title: t("Demandes de paiement", "Payment Requests"),
          url: createPageUrl("PaymentRequests"),
          icon: DollarSign,
        },
      ];
      if (can(user, ACTIONS.VIEW_REPORTS)) {
          items.push({
            title: t("Rapports", "Reports"),
            url: createPageUrl("Reports"),
            icon: BarChart3,
          });
      }
      return items;
    }

    return commonItems;
  };

  const getAdminItems = () => {
    if (!user) return [];
    const items = [];

    if (can(user, ACTIONS.MANAGE_ORGANIZATIONS)) {
        items.push({ title: t("Organisations", "Organizations"), url: createPageUrl("AdminPanel"), icon: Building2 });
    }

    if (can(user, ACTIONS.MANAGE_TEAM)) {
        items.push({ title: t("Mon Équipe", "My Team"), url: createPageUrl("TeamManagement"), icon: Users });
    }

    return items;
  }

  return (
    <SidebarProvider>
      <style>{`
        :root {
          --color-primary: 220 90% 30%;
          --color-primary-hover: 220 90% 25%;
          --color-accent: 142 76% 36%;
        }
      `}</style>

      <div className="min-h-screen flex w-full bg-gray-50">
        <Sidebar className="border-r border-gray-200 bg-white">
          <SidebarHeader className="border-b border-gray-100 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-900 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg">CPE Connect</h2>
                <p className="text-xs text-gray-500">
                  {t("Concertation pour l'emploi", "Workforce Collaboration")}
                </p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-2">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                {t("Navigation", "Navigation")}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {getNavigationItems().map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={`hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-lg mb-1 ${
                          location.pathname === item.url ? 'bg-blue-50 text-blue-700 font-medium' : ''
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-3 py-2.5">
                          <item.icon className="w-5 h-5" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {getAdminItems().length > 0 && (
                <SidebarGroup>
                  <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2 mt-4">
                    {t("Administration", "Administration")}
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {getAdminItems().map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton
                            asChild
                            className={`hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-lg mb-1 ${
                              location.pathname === item.url ? 'bg-blue-50 text-blue-700 font-medium' : ''
                            }`}
                          >
                            <Link to={item.url} className="flex items-center gap-3 px-3 py-2.5">
                              <item.icon className="w-5 h-5" />
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
            )}
          </SidebarContent>

          <SidebarFooter className="border-t border-gray-100 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleLanguage}
                className="w-full justify-start gap-2 hover:bg-gray-50 flex-1"
              >
                <Languages className="w-4 h-4" />
                {locale === 'fr' ? 'English' : 'Français'}
              </Button>
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="relative px-3">
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0">
                  <div className="p-4 border-b">
                    <h4 className="font-semibold">{t("Notifications", "Notifications")}</h4>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-8">{t("Aucune notification", "No notifications")}</p>
                    ) : (
                      notifications.map(n => {
                        const Icon = ICON_MAP[n.icon] || AlertCircle;
                        return (
                          <Link key={n.id} to={n.link_url || '#'} onClick={() => { markAsReadMutation.mutate(n.id); setIsPopoverOpen(false); }}>
                            <div className={`p-4 border-b hover:bg-gray-50 ${!n.is_read ? 'bg-blue-50' : ''}`}>
                              <div className="flex items-start gap-3">
                                <Icon className="w-5 h-5 text-gray-500 mt-1" />
                                <div className="flex-1">
                                  <p className="text-sm text-gray-800">{locale === 'fr' ? n.message_fr : n.message_en}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {formatDistanceToNow(new Date(n.created_date), { addSuffix: true, locale: locale === 'fr' ? fr : enUS })}
                                  </p>
                                </div>
                                {!n.is_read && <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />}
                              </div>
                            </div>
                          </Link>
                        )
                      })
                    )}
                  </div>
                  {unreadCount > 0 && (
                     <div className="p-2 border-t">
                        <Button variant="link" size="sm" className="w-full" onClick={markAllAsRead}>{t("Marquer tout comme lu", "Mark all as read")}</Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>

            {user && (
              <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-blue-900 text-white text-sm">
                    {user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">
                    {user.full_name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {t(
                      {
                        org_admin: "Admin",
                        org_finance: "Finance",
                        org_hr: "RH",
                        consultant: "Consultant",
                        officer: "Agent",
                        partner: "Partenaire",
                        platform_admin: "Admin"
                      }[user.user_role] || user.user_role,
                      user.user_role
                    )}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => base44.auth.logout()}
                  className="h-8 w-8 text-gray-400 hover:text-gray-600"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            )}
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col min-w-0">
          <header className="bg-white border-b border-gray-200 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-gray-100 p-2 rounded-lg" />
              <h1 className="text-xl font-bold text-gray-900">CPE Connect</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
        <Toaster />
      </div>
    </SidebarProvider>
  );
}

