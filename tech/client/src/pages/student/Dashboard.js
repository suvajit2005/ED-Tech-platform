import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FiBookOpen, 
  FiAward, 
  FiTrendingUp, 
  FiClock,
  FiPlay,
  FiCheckCircle
} from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const StudentDashboard = () => {
  // Mock data - in real app, this would come from API
  const progressData = [
    { month: 'Jan', progress: 20 },
    { month: 'Feb', progress: 35 },
    { month: 'Mar', progress: 50 },
    { month: 'Apr', progress: 65 },
    { month: 'May', progress: 80 },
    { month: 'Jun', progress: 90 },
  ];

  const courseProgressData = [
    { name: 'Completed', value: 3, color: '#10B981' },
    { name: 'In Progress', value: 2, color: '#3B82F6' },
    { name: 'Not Started', value: 1, color: '#6B7280' },
  ];

  const recentCourses = [
    {
      id: 1,
      title: 'Complete Web Development Bootcamp',
      instructor: 'John Doe',
      progress: 75,
      thumbnail: '/api/placeholder/300/200',
      nextLesson: 'React Hooks Deep Dive',
    },
    {
      id: 2,
      title: 'Data Science with Python',
      instructor: 'Jane Smith',
      progress: 45,
      thumbnail: '/api/placeholder/300/200',
      nextLesson: 'Pandas Data Manipulation',
    },
    {
      id: 3,
      title: 'Mobile App Development',
      instructor: 'Mike Johnson',
      progress: 20,
      thumbnail: '/api/placeholder/300/200',
      nextLesson: 'Flutter Basics',
    },
  ];

  const upcomingTests = [
    {
      id: 1,
      title: 'JavaScript Fundamentals',
      course: 'Complete Web Development Bootcamp',
      date: '2024-01-15',
      duration: 60,
    },
    {
      id: 2,
      title: 'Python Basics Quiz',
      course: 'Data Science with Python',
      date: '2024-01-18',
      duration: 30,
    },
  ];

  const stats = [
    {
      title: 'Courses Enrolled',
      value: '6',
      icon: FiBookOpen,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100',
    },
    {
      title: 'Courses Completed',
      value: '3',
      icon: FiCheckCircle,
      color: 'text-success-600',
      bgColor: 'bg-success-100',
    },
    {
      title: 'Certificates Earned',
      value: '2',
      icon: FiAward,
      color: 'text-warning-600',
      bgColor: 'bg-warning-100',
    },
    {
      title: 'Study Hours',
      value: '120',
      icon: FiClock,
      color: 'text-accent-600',
      bgColor: 'bg-accent-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-primary rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, Student!</h1>
        <p className="text-white/90">
          Continue your learning journey and achieve your goals.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-1">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
                  {stat.value}
                </p>
              </div>
              <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Progress Chart */}
        <div className="chart-container">
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
            Learning Progress
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="progress" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Course Progress Pie Chart */}
        <div className="chart-container">
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
            Course Status
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={courseProgressData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {courseProgressData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center space-x-6 mt-4">
            {courseProgressData.map((item, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-secondary-600 dark:text-secondary-400">
                  {item.name} ({item.value})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Courses */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
              Recent Courses
            </h3>
            <Link 
              to="/student/courses" 
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {recentCourses.map((course) => (
              <div key={course.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors">
                <div className="w-16 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                  <FiBookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-secondary-900 dark:text-secondary-100 truncate">
                    {course.title}
                  </h4>
                  <p className="text-sm text-secondary-500 dark:text-secondary-400">
                    by {course.instructor}
                  </p>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-secondary-600 dark:text-secondary-400">
                        {course.progress}% complete
                      </span>
                      <span className="text-secondary-600 dark:text-secondary-400">
                        Next: {course.nextLesson}
                      </span>
                    </div>
                    <div className="progress-bar mt-1">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <Link 
                  to={`/student/courses/${course.id}`}
                  className="p-2 text-primary-600 hover:text-primary-700 dark:text-primary-400"
                >
                  <FiPlay className="w-5 h-5" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Tests */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
              Upcoming Tests
            </h3>
            <Link 
              to="/student/tests" 
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {upcomingTests.map((test) => (
              <div key={test.id} className="p-4 border border-secondary-200 dark:border-secondary-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-secondary-900 dark:text-secondary-100">
                    {test.title}
                  </h4>
                  <span className="badge badge-primary">
                    {test.duration} min
                  </span>
                </div>
                <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-2">
                  {test.course}
                </p>
                <div className="flex items-center text-sm text-secondary-600 dark:text-secondary-400">
                  <FiClock className="w-4 h-4 mr-1" />
                  {new Date(test.date).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
