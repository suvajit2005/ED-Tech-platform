import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Layout Components
import Layout from './components/layout/Layout';
import AuthLayout from './components/layout/AuthLayout';

// Auth Components
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import StudentCourses from './pages/student/Courses';
import StudentCourseDetail from './pages/student/CourseDetail';
import StudentTests from './pages/student/Tests';
import StudentTestDetail from './pages/student/TestDetail';
import StudentProfile from './pages/student/Profile';

// Teacher Pages
import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherCourses from './pages/teacher/Courses';
import TeacherCourseCreate from './pages/teacher/CourseCreate';
import TeacherCourseEdit from './pages/teacher/CourseEdit';
import TeacherAnalytics from './pages/teacher/Analytics';
import TeacherLiveClasses from './pages/teacher/LiveClasses';
import TeacherProfile from './pages/teacher/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminCourses from './pages/admin/Courses';
import AdminRevenue from './pages/admin/Revenue';
import AdminAnalytics from './pages/admin/Analytics';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

// Protected Route Component
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        
        {/* Auth Routes */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          {/* Student Routes */}
          <Route path="student" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
          <Route path="student/courses" element={<ProtectedRoute role="student"><StudentCourses /></ProtectedRoute>} />
          <Route path="student/courses/:id" element={<ProtectedRoute role="student"><StudentCourseDetail /></ProtectedRoute>} />
          <Route path="student/tests" element={<ProtectedRoute role="student"><StudentTests /></ProtectedRoute>} />
          <Route path="student/tests/:id" element={<ProtectedRoute role="student"><StudentTestDetail /></ProtectedRoute>} />
          <Route path="student/profile" element={<ProtectedRoute role="student"><StudentProfile /></ProtectedRoute>} />

          {/* Teacher Routes */}
          <Route path="teacher" element={<ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>} />
          <Route path="teacher/courses" element={<ProtectedRoute role="teacher"><TeacherCourses /></ProtectedRoute>} />
          <Route path="teacher/courses/create" element={<ProtectedRoute role="teacher"><TeacherCourseCreate /></ProtectedRoute>} />
          <Route path="teacher/courses/:id/edit" element={<ProtectedRoute role="teacher"><TeacherCourseEdit /></ProtectedRoute>} />
          <Route path="teacher/analytics" element={<ProtectedRoute role="teacher"><TeacherAnalytics /></ProtectedRoute>} />
          <Route path="teacher/live-classes" element={<ProtectedRoute role="teacher"><TeacherLiveClasses /></ProtectedRoute>} />
          <Route path="teacher/profile" element={<ProtectedRoute role="teacher"><TeacherProfile /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="admin/users" element={<ProtectedRoute role="admin"><AdminUsers /></ProtectedRoute>} />
          <Route path="admin/courses" element={<ProtectedRoute role="admin"><AdminCourses /></ProtectedRoute>} />
          <Route path="admin/revenue" element={<ProtectedRoute role="admin"><AdminRevenue /></ProtectedRoute>} />
          <Route path="admin/analytics" element={<ProtectedRoute role="admin"><AdminAnalytics /></ProtectedRoute>} />
        </Route>

        {/* Redirect based on user role */}
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated ? (
              user?.role === 'student' ? <Navigate to="/student" replace /> :
              user?.role === 'teacher' ? <Navigate to="/teacher" replace /> :
              user?.role === 'admin' ? <Navigate to="/admin" replace /> :
              <Navigate to="/" replace />
            ) : (
              <Navigate to="/auth/login" replace />
            )
          } 
        />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
