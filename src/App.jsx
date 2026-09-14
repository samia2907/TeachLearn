import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import ProtectedRoute
  from "./components/ProtectedRoute";

import Login
  from "./pages/Login";
import AboutUs from "./pages/AboutUs";

import Register
  from "./pages/Register";

import Plans
  from "./pages/Plans";

import Checkout
  from "./pages/Checkout";

import TeacherDashboard
  from "./pages/TeacherDashboard";

import StudentDashboard
  from "./pages/StudentDashboard";

import TeacherStudents
  from "./pages/TeacherStudents";

import TeacherClasses
  from "./pages/TeacherClasses";
import TeacherClassDetail
  from "./pages/TeacherClassDetail";
import OwnerPlans from "./pages/OwnerPlans";
import TeacherLessons
  from "./pages/TeacherLessons";

import TeacherAttendance
  from "./pages/TeacherAttendance";

import TeacherSettings
  from "./pages/TeacherSettings";

import TeacherStudentProgress
  from "./pages/TeacherStudentProgress";

import TeacherStudentPortfolio
  from "./pages/TeacherStudentPortfolio";
import ProgramLearning
  from "./pages/ProgramLearning";
import StudentLessons
  from "./pages/StudentLessons";

import StudentLessonDetails
  from "./pages/StudentLessonDetails";

import StudentPortfolio
  from "./pages/StudentPortfolio";
import StudentJoinClass
  from "./pages/StudentJoinClass";

import ProgramsMarketplace
  from "./pages/ProgramsMarketplace";
import ProgramLessonPlayer
  from "./pages/ProgramLessonPlayer";
import PrivacyPolicy
  from "./pages/PrivacyPolicy";

import TermsConditions
  from "./pages/TermsConditions";

import RefundPolicy
  from "./pages/RefundPolicy";

import OwnerDashboard
  from "./pages/OwnerDashboard";

import OwnerPrograms
  from "./pages/OwnerPrograms";

import OwnerProgramLessons
  from "./pages/OwnerProgramLessons";

import OwnerLessonBuilder
  from "./pages/OwnerLessonBuilder";

import OwnerCustomers
  from "./pages/OwnerCustomers";

import OwnerSales
  from "./pages/OwnerSales";

import OwnerAnalytics
  from "./pages/OwnerAnalytics";

import OwnerSettings
  from "./pages/OwnerSettings";


function App() {
  return (
    <BrowserRouter>

      <Routes>
        <Route path="/about" element={<AboutUs />} />

        {/* =================================================
            DEFAULT
        ================================================= */}

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />


        {/* =================================================
            AUTH
        ================================================= */}

        <Route
          path="/login"
          element={
            <Login />
          }
        />


        <Route
          path="/register"
          element={
            <Register />
          }
        />


        {/* =================================================
            LEGAL
        ================================================= */}

        <Route
          path="/privacy"
          element={
            <PrivacyPolicy />
          }
        />


        <Route
          path="/terms"
          element={
            <TermsConditions />
          }
        />


        <Route
          path="/refund-policy"
          element={
            <RefundPolicy />
          }
        />


        {/* =================================================
            PLANS + CHECKOUT
        ================================================= */}

        <Route
          path="/plans"
          element={
            <Plans />
          }
        />

<Route
  path="/owner/plans"
  element={<OwnerPlans />}
/>
        <Route
          path="/checkout"
          element={
            <Checkout />
          }
        />


        {/* =================================================
            MARKETPLACE
        ================================================= */}

        <Route
          path="/programs"
          element={
            <ProtectedRoute>
              <ProgramsMarketplace />
            </ProtectedRoute>
          }
        />
<Route
  path="/programs/:programId"
  element={
    <ProtectedRoute>
      <ProgramLearning />
    </ProtectedRoute>
  }
/>

        {/* Student alias */}

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


        {/* Teacher alias */}

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

    </BrowserRouter>
  );
}


export default App;
