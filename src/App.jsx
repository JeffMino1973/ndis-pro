import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Participants from './pages/Participants';
import Staff from './pages/Staff';
import RiskAssessments from './pages/RiskAssessments';
import Incidents from './pages/Incidents';
import SupportPlans from './pages/SupportPlans';
import ServiceAgreements from './pages/ServiceAgreements';
import SettingsPage from './pages/SettingsPage';
import Invoices from './pages/Invoices';
import Rostering from './pages/Rostering';
import Timesheets from './pages/Timesheets';
import GoalTracking from './pages/GoalTracking';
import DocumentVault from './pages/DocumentVault';
import Complaints from './pages/Complaints';
import AuditChecklists from './pages/AuditChecklists';
import KPIDashboard from './pages/KPIDashboard';
import OnboardingRequests from './pages/OnboardingRequests';
import TobyProfile from './pages/TobyProfile';
import OnboardingPublicForm from './pages/OnboardingPublicForm';
import Stationery from './pages/Stationery';
import Quotes from './pages/Quotes';
import ParticipantPortal from './pages/ParticipantPortal';
import ShiftLogger from './pages/ShiftLogger';
import ProgressNotes from './pages/ProgressNotes';
import RestrictivePractices from './pages/RestrictivePractices';
import AIReports from './pages/AIReports';
import TravelGuide from './pages/TravelGuide';
import ImplementationProgram from './pages/ImplementationProgram';
import MedicationDashboard from './pages/MedicationDashboard';
import EpilepsyPlans from './pages/EpilepsyPlans';
import HealthCarePlan from './pages/HealthCarePlan';
import BehaviourContinuum from './pages/BehaviourContinuum';
import BehaviourSupportPlan from './pages/BehaviourSupportPlan';
import PositiveBehaviourSupportPlan from './pages/PositiveBehaviourSupportPlan';
import EmailTemplates from './pages/EmailTemplates';
import Finance from './pages/Finance';
import Payslips from './pages/Payslips';
import MedicationHub from './pages/MedicationHub';
import PublicWebsite from './pages/PublicWebsite';
import JeffreyProfile from './pages/JeffreyProfile';
import InnovationPage from './pages/InnovationPage';
import PolicyManual from './pages/PolicyManual';
import Links from './pages/Links';
import NavAdmin from './pages/NavAdmin';
import ReportsCentre from './pages/ReportsCentre';
import UserGuide from './pages/UserGuide';
import StaffPortal from './pages/StaffPortal';
import AuditLogPage from './pages/AuditLogPage';
import DataExport from './pages/DataExport';


const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      // Show spinner while redirecting, not a blank screen
      return (
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
        </div>
      );
    }
    // For any other unknown error, still try to render the app
  }

  // Render the main app
  return (
    <Routes>
      <Route element={<Layout />}>
      <Route path="/" element={<Dashboard />} />
      <Route path="/participants" element={<Participants />} />
      <Route path="/staff" element={<Staff />} />
      <Route path="/risk-assessments" element={<RiskAssessments />} />
      <Route path="/incidents" element={<Incidents />} />
      <Route path="/support-plans" element={<SupportPlans />} />
      <Route path="/service-agreements" element={<ServiceAgreements />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/invoices" element={<Invoices />} />
      <Route path="/rostering" element={<Rostering />} />
      <Route path="/timesheets" element={<Timesheets />} />
      <Route path="/goal-tracking" element={<GoalTracking />} />
      <Route path="/document-vault" element={<DocumentVault />} />
      <Route path="/complaints" element={<Complaints />} />
      <Route path="/audit-checklists" element={<AuditChecklists />} />
      <Route path="/kpi" element={<KPIDashboard />} />
      <Route path="/onboarding" element={<OnboardingRequests />} />
      <Route path="/toby" element={<TobyProfile />} />
      <Route path="/policy-manual" element={<PolicyManual />} />
      <Route path="/links" element={<Links />} />
      <Route path="/nav-admin" element={<NavAdmin />} />
      <Route path="/reports" element={<ReportsCentre />} />
      <Route path="/user-guide" element={<UserGuide />} />
      <Route path="/staff-portal" element={<StaffPortal />} />
      <Route path="/audit-log" element={<AuditLogPage />} />
      <Route path="/data-export" element={<DataExport />} />
      <Route path="/jeffrey" element={<JeffreyProfile />} />
      <Route path="/onboarding-form" element={<OnboardingPublicForm />} />
      <Route path="/stationery" element={<Stationery />} />
      <Route path="/quotes" element={<Quotes />} />
      <Route path="/shift-logger" element={<ShiftLogger />} />
      <Route path="/progress-notes" element={<ProgressNotes />} />
      <Route path="/restrictive-practices" element={<RestrictivePractices />} />
      <Route path="/ai-reports" element={<AIReports />} />
      <Route path="/travel-guide" element={<TravelGuide />} />
      <Route path="/implementation-programs" element={<ImplementationProgram />} />
      <Route path="/medications" element={<MedicationDashboard />} />
      <Route path="/epilepsy-plans" element={<EpilepsyPlans />} />
      <Route path="/health-care-plans" element={<HealthCarePlan />} />
      <Route path="/behaviour-continuum" element={<BehaviourContinuum />} />
      <Route path="/behaviour-support-plans" element={<BehaviourSupportPlan />} />
      <Route path="/positive-behaviour-support-plans" element={<PositiveBehaviourSupportPlan />} />
      <Route path="/email-templates" element={<EmailTemplates />} />
      <Route path="/finance" element={<Finance />} />
      <Route path="/payslips" element={<Payslips />} />
      <Route path="/medication-hub" element={<MedicationHub />} />
      <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  );
};


function App() {

  return (
    <QueryClientProvider client={queryClientInstance}>
      <Router>
        <Routes>
          <Route path="/" element={<PublicWebsite />} />
          <Route path="/innovation" element={<InnovationPage />} />
          <Route path="/participant-portal" element={<ParticipantPortal />} />

          <Route path="/dashboard/*" element={
            <AuthProvider>
              <AuthenticatedApp />
            </AuthProvider>
          } />
          <Route path="*" element={<PublicWebsite />} />
        </Routes>
      </Router>
      <Toaster />
    </QueryClientProvider>
  )
}

export default App