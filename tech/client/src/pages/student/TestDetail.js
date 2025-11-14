import React from 'react';
import { useParams } from 'react-router-dom';

const StudentTestDetail = () => {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100">
        Test Detail - {id}
      </h1>
      <p className="text-secondary-600 dark:text-secondary-400">
        This page will show test questions, timer, and submission interface.
      </p>
    </div>
  );
};

export default StudentTestDetail;
