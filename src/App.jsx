import { lazy, Suspense } from "react";
import PageLoading from "./components/PageLoading";
const PublicProgram = lazy(() => import('./pages/PublicProgram'));

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import ProtectedRoute
  from "./components/ProtectedRoute";

import PublicLayout
  from "./components/PublicLayout";

const Login = lazy(() => import('./pages/Login'));

const AboutUs = lazy(() => import('./pages/AboutUs'));

const Courses = lazy(() => import('./pages/Courses'));

const Profile = lazy(() => import('./pages/Profile'));

const OwnerAccessManagement = lazy(() => import('./pages/OwnerAccessManagement'));

const ProgramAccess = lazy(() => import('./pages/ProgramAccess'));

const Register = lazy(() => import('./pages/Register'));

const Plans = lazy(() => import('./pages/Plans'));

const Checkout = lazy(() => import('./pages/Checkout'));

const TeacherDashboard = lazy(() => import('./pages/TeacherDashboard'));

const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));

const TeacherStudents = lazy(() => import('./pages/TeacherStudents'));

const TeacherClasses = lazy(() => import('./pages/TeacherClasses'));

const TeacherClassDetail = lazy(() => import('./pages/TeacherClassDetail'));

const OwnerPlans = lazy(() => import('./pages/OwnerPlans'));

const TeacherLessons = lazy(() => import('./pages/TeacherLessons'));

const TeacherAttendance = lazy(() => import('./pages/TeacherAttendance'));

const TeacherSettings = lazy(() => import('./pages/TeacherSettings'));

const TeacherStudentProgress = lazy(() => import('./pages/TeacherStudentProgress'));

const TeacherStudentPortfolio = lazy(() => import('./pages/TeacherStudentPortfolio'));

const StudentLessons = lazy(() => import('./pages/StudentLessons'));

const StudentLessonDetails = lazy(() => import('./pages/StudentLessonDetails'));

const StudentPortfolio = lazy(() => import('./pages/StudentPortfolio'));

const StudentJoinClass = lazy(() => import('./pages/StudentJoinClass'));

const ProgramsMarketplace = lazy(() => import('./pages/ProgramsMarketplace'));

const ProgramLessonPlayer = lazy(() => import('./pages/ProgramLessonPlayer'));

const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));

const TermsConditions = lazy(() => import('./pages/TermsConditions'));

const RefundPolicy = lazy(() => import('./pages/RefundPolicy'));

const OwnerDashboard = lazy(() => import('./pages/OwnerDashboard'));

const OwnerPrograms = lazy(() => import('./pages/OwnerPrograms'));

const OwnerProgramLessons = lazy(() => import('./pages/OwnerProgramLessons'));

const OwnerLessonBuilder = lazy(() => import('./pages/OwnerLessonBuilder'));

const OwnerCustomers = lazy(() => import('./pages/OwnerCustomers'));

const OwnerSales = lazy(() => import('./pages/OwnerSales'));

const OwnerAnalytics = lazy(() => import('./pages/OwnerAnalytics'));

const OwnerSettings = lazy(() => import('./pages/OwnerSettings'));

const OwnerCourseRegistrations = lazy(() => import('./pages/OwnerCourseRegistrations'));


function App() {
  return (
    <BrowserRouter>

      <Suspense fallback={<PageLoading />}>
      <Routes>

        {/* =================================================
            PUBLIC / NO LOGIN REQUIRED
        ================================================= */}

        <Route element={<PublicLayout />}>
          <Route
            path="/"
            element={<Login />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/about"
            element={<AboutUs />}
          />

          <Route
            path="/programs"
            element={<ProgramsMarketplace />}
          />

          <Route
            path="/programs/:programId"
            element={<PublicProgram />}
          />

          <Route
            path="/courses"
            element={<Courses />}
          />

          <Route
            path="/privacy"
            element={<PrivacyPolicy />}
          />

          <Route
            path="/terms"
            element={<TermsConditions />}
          />

          <Route
            path="/refund-policy"
            element={<RefundPolicy />}
          />
        </Route>


        {/* =================================================
            SHARED PROTECTED
        ================================================= */}

        <Route
          path="/owner/access"
          element={
            <ProtectedRoute
              allowedRole="owner"
            >
              <OwnerAccessManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/programs/:programId/access"
          element={
            <ProtectedRoute>
              <ProgramAccess />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            PLANS + CHECKOUT
        ================================================= */}

        <Route
          path="/plans"
          element={
            <ProtectedRoute>
              <Plans />
            </ProtectedRoute>
          }
        />

        <Route
          path="/owner/plans"
          element={
            <ProtectedRoute
              allowedRole="owner"
            >
              <OwnerPlans />
            </ProtectedRoute>
          }
        />

        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            MARKETPLACE ALIASES
        ================================================= */}

        <Route
          path="/student/programs"
          element={
            <ProtectedRoute
              allowedRole="student"
            >
              <ProgramsMarketplace />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/programs"
          element={
            <ProtectedRoute
              allowedRole="teacher"
            >
              <ProgramsMarketplace />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            TEACHER
        ================================================= */}

        <Route
          path="/teacher"
          element={
            <ProtectedRoute
              allowedRole="teacher"
            >
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/classes"
          element={
            <ProtectedRoute
              allowedRole="teacher"
            >
              <TeacherClasses />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/classes/:classId"
          element={
            <ProtectedRoute
              allowedRole="teacher"
            >
              <TeacherClassDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/students"
          element={
            <ProtectedRoute
              allowedRole="teacher"
            >
              <TeacherStudents />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/students/:studentId/progress"
          element={
            <ProtectedRoute
              allowedRole="teacher"
            >
              <TeacherStudentProgress />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/students/:studentId/portfolio"
          element={
            <ProtectedRoute
              allowedRole="teacher"
            >
              <TeacherStudentPortfolio />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/attendance"
          element={
            <ProtectedRoute
              allowedRole="teacher"
            >
              <TeacherAttendance />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/lessons"
          element={
            <ProtectedRoute
              allowedRole="teacher"
              requiredPlan="teacherPro"
            >
              <TeacherLessons />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/settings"
          element={
            <ProtectedRoute
              allowedRole="teacher"
            >
              <TeacherSettings />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            STUDENT
        ================================================= */}

        <Route
          path="/student"
          element={
            <ProtectedRoute
              allowedRole="student"
            >
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/lessons"
          element={
            <ProtectedRoute
              allowedRole="student"
            >
              <StudentLessons />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/lessons/:lessonId"
          element={
            <ProtectedRoute
              allowedRole="student"
            >
              <StudentLessonDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/portfolio"
          element={
            <ProtectedRoute
              allowedRole="student"
            >
              <StudentPortfolio />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/join-class"
          element={
            <ProtectedRoute
              allowedRole="student"
            >
              <StudentJoinClass />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            OWNER
        ================================================= */}

        <Route
          path="/owner"
          element={
            <ProtectedRoute
              allowedRole="owner"
            >
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/owner/programs"
          element={
            <ProtectedRoute
              allowedRole="owner"
            >
              <OwnerPrograms />
            </ProtectedRoute>
          }
        />

        <Route
          path="/owner/programs/:programId/lessons"
          element={
            <ProtectedRoute
              allowedRole="owner"
            >
              <OwnerProgramLessons />
            </ProtectedRoute>
          }
        />

        <Route
          path="/owner/programs/:programId/lessons/:lessonId/edit"
          element={
            <ProtectedRoute
              allowedRole="owner"
            >
              <OwnerLessonBuilder />
            </ProtectedRoute>
          }
        />

        <Route
          path="/programs/:programId/lessons/:lessonId"
          element={
            <ProtectedRoute>
              <ProgramLessonPlayer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/owner/customers"
          element={
            <ProtectedRoute
              allowedRole="owner"
            >
              <OwnerCustomers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/owner/course-registrations"
          element={
            <ProtectedRoute
              allowedRole="owner"
            >
              <OwnerCourseRegistrations />
            </ProtectedRoute>
          }
        />

        <Route
          path="/owner/sales"
          element={
            <ProtectedRoute
              allowedRole="owner"
            >
              <OwnerSales />
            </ProtectedRoute>
          }
        />

        <Route
          path="/owner/analytics"
          element={
            <ProtectedRoute
              allowedRole="owner"
            >
              <OwnerAnalytics />
            </ProtectedRoute>
          }
        />

        <Route
          path="/owner/settings"
          element={
            <ProtectedRoute
              allowedRole="owner"
            >
              <OwnerSettings />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            FALLBACK
        ================================================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

      </Routes>
      </Suspense>

    </BrowserRouter>
  );
}


export default App;
