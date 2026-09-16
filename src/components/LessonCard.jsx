import React from 'react';
import { Link } from 'react-router-dom';

const LessonCard = ({ lesson }) => (
  <Link
    to={`/lessons/${lesson.LessonID}`}
    className="block bg-white dark:bg-secondary-dark-bg rounded-xl p-4 shadow hover:shadow-lg transition"
  >
    <div className="flex justify-between items-center mb-2">
      <p className="font-semibold">{lesson.Learner}</p>
      <StatusBadge status={lesson.Status} />
    </div>

    <p className="text-sm text-gray-500">
      {lesson.date} · {lesson.start} – {lesson.end}
    </p>

    <p className="text-xs text-gray-400 mt-1">
      Instructor: {lesson.Instructor}
    </p>
  </Link>
);

export default LessonCard;

/* ===================== Status Badge ===================== */

const StatusBadge = ({ status }) => {
  const colors = {
    Scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
    Completed: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
    Cancelled: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
  };

  return (
    <span className={`px-3 py-0.5 rounded-full text-xs ${colors[status]}`}>
      {status}
    </span>
  );
};
