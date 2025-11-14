import React from 'react';
import { useParams } from 'react-router-dom';

const StudentCourseDetail = () => {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100">
        Course Detail - {id}
      </h1>
      <p className="text-secondary-600 dark:text-secondary-400">
        This page will show detailed course information, lessons, and progress.
      </p>
    </div>
  );
};

export default StudentCourseDetail;
