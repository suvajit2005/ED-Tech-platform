import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 py-20">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-secondary-900 dark:text-secondary-100 mb-8">
            About EdTech Platform
          </h1>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-xl text-secondary-600 dark:text-secondary-400 mb-6">
              We are revolutionizing education through technology, making quality learning accessible to everyone, everywhere.
            </p>
            <p className="text-secondary-600 dark:text-secondary-400 mb-6">
              Our platform connects passionate educators with eager learners, creating an ecosystem where knowledge flows freely and growth is inevitable.
            </p>
            <p className="text-secondary-600 dark:text-secondary-400">
              Join us in shaping the future of education.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
