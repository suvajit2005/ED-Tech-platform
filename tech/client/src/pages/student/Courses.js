import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiFilter, FiBookOpen, FiClock, FiStar, FiUsers } from 'react-icons/fi';

const StudentCourses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Mock data - in real app, this would come from API
  const courses = [
    {
      id: 1,
      title: 'Complete Web Development Bootcamp',
      instructor: 'John Doe',
      category: 'programming',
      rating: 4.8,
      students: 1250,
      duration: '40 hours',
      progress: 75,
      thumbnail: '/api/placeholder/300/200',
      price: 99,
      isEnrolled: true,
    },
    {
      id: 2,
      title: 'Data Science with Python',
      instructor: 'Jane Smith',
      category: 'data-science',
      rating: 4.9,
      students: 890,
      duration: '35 hours',
      progress: 45,
      thumbnail: '/api/placeholder/300/200',
      price: 149,
      isEnrolled: true,
    },
    {
      id: 3,
      title: 'Mobile App Development',
      instructor: 'Mike Johnson',
      category: 'programming',
      rating: 4.7,
      students: 650,
      duration: '30 hours',
      progress: 20,
      thumbnail: '/api/placeholder/300/200',
      price: 129,
      isEnrolled: true,
    },
    {
      id: 4,
      title: 'Digital Marketing Masterclass',
      instructor: 'Sarah Wilson',
      category: 'marketing',
      rating: 4.6,
      students: 2100,
      duration: '25 hours',
      progress: 0,
      thumbnail: '/api/placeholder/300/200',
      price: 79,
      isEnrolled: false,
    },
  ];

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'programming', label: 'Programming' },
    { value: 'data-science', label: 'Data Science' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'design', label: 'Design' },
  ];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || course.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100">
            My Courses
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400 mt-1">
            Continue your learning journey
          </p>
        </div>
        <Link
          to="/courses"
          className="btn-primary btn-md mt-4 sm:mt-0"
        >
          Browse All Courses
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-secondary-400" />
          </div>
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiFilter className="h-5 w-5 text-secondary-400" />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input pl-10 pr-8"
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div key={course.id} className="card-hover">
            <div className="relative">
              <div className="w-full h-48 bg-gradient-to-br from-primary-500 to-accent-500 rounded-t-xl flex items-center justify-center">
                <FiBookOpen className="w-16 h-16 text-white/80" />
              </div>
              {course.isEnrolled && (
                <div className="absolute top-4 right-4">
                  <span className="badge badge-success">Enrolled</span>
                </div>
              )}
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="badge badge-primary">
                  {categories.find(cat => cat.value === course.category)?.label}
                </span>
                <div className="flex items-center text-sm text-secondary-600 dark:text-secondary-400">
                  <FiStar className="w-4 h-4 text-warning-500 fill-current mr-1" />
                  {course.rating}
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-2 line-clamp-2">
                {course.title}
              </h3>
              
              <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-4">
                by {course.instructor}
              </p>
              
              <div className="flex items-center justify-between text-sm text-secondary-600 dark:text-secondary-400 mb-4">
                <div className="flex items-center">
                  <FiUsers className="w-4 h-4 mr-1" />
                  {course.students.toLocaleString()}
                </div>
                <div className="flex items-center">
                  <FiClock className="w-4 h-4 mr-1" />
                  {course.duration}
                </div>
              </div>

              {course.isEnrolled ? (
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-secondary-600 dark:text-secondary-400">Progress</span>
                      <span className="text-secondary-600 dark:text-secondary-400">
                        {course.progress}%
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <Link
                    to={`/student/courses/${course.id}`}
                    className="btn-primary btn-md w-full"
                  >
                    Continue Learning
                  </Link>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
                    ${course.price}
                  </span>
                  <button className="btn-outline btn-md">
                    Enroll Now
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <FiBookOpen className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
            No courses found
          </h3>
          <p className="text-secondary-600 dark:text-secondary-400 mb-4">
            Try adjusting your search or filter criteria
          </p>
          <Link to="/courses" className="btn-primary btn-md">
            Browse All Courses
          </Link>
        </div>
      )}
    </div>
  );
};

export default StudentCourses;
