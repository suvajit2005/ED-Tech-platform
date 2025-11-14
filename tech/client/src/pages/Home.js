import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FiBookOpen, 
  FiUsers, 
  FiAward, 
  FiTrendingUp, 
  FiVideo, 
  FiFileText,
  FiCheckCircle,
  FiStar,
  FiArrowRight
} from 'react-icons/fi';
import { useTheme } from '../contexts/ThemeContext';

const Home = () => {
  const { theme } = useTheme();

  const features = [
    {
      icon: FiBookOpen,
      title: 'Interactive Courses',
      description: 'Access thousands of courses with video lessons, notes, and assignments.',
    },
    {
      icon: FiVideo,
      title: 'Live Classes',
      description: 'Join live sessions with instructors and interact in real-time.',
    },
    {
      icon: FiAward,
      title: 'Certificates',
      description: 'Earn certificates upon course completion to showcase your skills.',
    },
    {
      icon: FiTrendingUp,
      title: 'Progress Tracking',
      description: 'Monitor your learning journey with detailed analytics and reports.',
    },
    {
      icon: FiUsers,
      title: 'Community',
      description: 'Connect with fellow learners and instructors in our vibrant community.',
    },
    {
      icon: FiFileText,
      title: 'Resources',
      description: 'Download course materials, notes, and additional learning resources.',
    },
  ];

  const stats = [
    { number: '10,000+', label: 'Active Students' },
    { number: '500+', label: 'Expert Instructors' },
    { number: '1,000+', label: 'Courses Available' },
    { number: '95%', label: 'Success Rate' },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Student',
      content: 'The platform has transformed my learning experience. The interactive courses and live sessions are amazing!',
      rating: 5,
    },
    {
      name: 'Dr. Michael Chen',
      role: 'Instructor',
      content: 'Teaching on this platform has been incredibly rewarding. The tools and analytics help me deliver better content.',
      rating: 5,
    },
    {
      name: 'Emily Rodriguez',
      role: 'Student',
      content: 'I love the progress tracking feature. It keeps me motivated and helps me stay on track with my goals.',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 to-accent-50 dark:from-secondary-900 dark:to-secondary-800 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-secondary-900 dark:text-secondary-100 mb-6">
              Learn Without
              <span className="text-gradient block">Limits</span>
            </h1>
            <p className="text-xl text-secondary-600 dark:text-secondary-400 mb-8 max-w-2xl mx-auto">
              Join thousands of learners and educators in the most comprehensive online learning platform. 
              Access courses, live classes, and interactive content designed to accelerate your growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/auth/register"
                className="btn-primary btn-xl inline-flex items-center"
              >
                Start Learning Free
                <FiArrowRight className="ml-2" />
              </Link>
              <Link
                to="/auth/register"
                className="btn-outline btn-xl inline-flex items-center"
              >
                Teach on Platform
                <FiArrowRight className="ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-secondary-800">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">
                  {stat.number}
                </div>
                <div className="text-secondary-600 dark:text-secondary-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary-50 dark:bg-secondary-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-secondary-900 dark:text-secondary-100 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-secondary-600 dark:text-secondary-400 max-w-2xl mx-auto">
              We provide everything you need to succeed in your learning journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card-hover p-6 text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-3">
                  {feature.title}
                </h3>
                <p className="text-secondary-600 dark:text-secondary-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white dark:bg-secondary-800">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-secondary-900 dark:text-secondary-100 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-secondary-600 dark:text-secondary-400">
              Don't just take our word for it
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FiStar key={i} className="w-5 h-5 text-warning-500 fill-current" />
                  ))}
                </div>
                <p className="text-secondary-600 dark:text-secondary-400 mb-4">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-medium text-sm">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-secondary-900 dark:text-secondary-100">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-secondary-500 dark:text-secondary-400">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join our community of learners and educators today. Start your journey towards success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth/register"
              className="btn-secondary btn-xl inline-flex items-center"
            >
              Get Started Now
              <FiArrowRight className="ml-2" />
            </Link>
            <Link
              to="/contact"
              className="btn-outline btn-xl inline-flex items-center border-white text-white hover:bg-white hover:text-primary-600"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <FiBookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">EdTech</span>
              </div>
              <p className="text-secondary-400">
                Empowering learners and educators with cutting-edge technology.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Students</h3>
              <ul className="space-y-2 text-secondary-400">
                <li><Link to="/courses" className="hover:text-white">Browse Courses</Link></li>
                <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link to="/help" className="hover:text-white">Help Center</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Instructors</h3>
              <ul className="space-y-2 text-secondary-400">
                <li><Link to="/teach" className="hover:text-white">Start Teaching</Link></li>
                <li><Link to="/instructor-guide" className="hover:text-white">Instructor Guide</Link></li>
                <li><Link to="/earnings" className="hover:text-white">Earnings</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-secondary-400">
                <li><Link to="/about" className="hover:text-white">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-secondary-800 mt-8 pt-8 text-center text-secondary-400">
            <p>&copy; 2024 EdTech Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
