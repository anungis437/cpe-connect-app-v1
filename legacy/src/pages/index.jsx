import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import ProjectIntake from "./ProjectIntake";

import Projects from "./Projects";

import ProjectDetail from "./ProjectDetail";

import Academy from "./Academy";

import ReviewProjects from "./ReviewProjects";

import Reports from "./Reports";

import MyTrainings from "./MyTrainings";

import CourseDetail from "./CourseDetail";

import CertificateView from "./CertificateView";

import PaymentRequests from "./PaymentRequests";

import ClaimDetail from "./ClaimDetail";

import AdminPanel from "./AdminPanel";

import TeamManagement from "./TeamManagement";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    ProjectIntake: ProjectIntake,
    
    Projects: Projects,
    
    ProjectDetail: ProjectDetail,
    
    Academy: Academy,
    
    ReviewProjects: ReviewProjects,
    
    Reports: Reports,
    
    MyTrainings: MyTrainings,
    
    CourseDetail: CourseDetail,
    
    CertificateView: CertificateView,
    
    PaymentRequests: PaymentRequests,
    
    ClaimDetail: ClaimDetail,
    
    AdminPanel: AdminPanel,
    
    TeamManagement: TeamManagement,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/ProjectIntake" element={<ProjectIntake />} />
                
                <Route path="/Projects" element={<Projects />} />
                
                <Route path="/ProjectDetail" element={<ProjectDetail />} />
                
                <Route path="/Academy" element={<Academy />} />
                
                <Route path="/ReviewProjects" element={<ReviewProjects />} />
                
                <Route path="/Reports" element={<Reports />} />
                
                <Route path="/MyTrainings" element={<MyTrainings />} />
                
                <Route path="/CourseDetail" element={<CourseDetail />} />
                
                <Route path="/CertificateView" element={<CertificateView />} />
                
                <Route path="/PaymentRequests" element={<PaymentRequests />} />
                
                <Route path="/ClaimDetail" element={<ClaimDetail />} />
                
                <Route path="/AdminPanel" element={<AdminPanel />} />
                
                <Route path="/TeamManagement" element={<TeamManagement />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}