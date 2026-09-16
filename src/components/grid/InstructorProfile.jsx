import React from 'react';

const InstructorProfile = ({ ProfileImage, Name }) => (
  <div className="flex items-center gap-2">
    <img
      className="rounded-full w-10 h-10"
      src={ProfileImage}
      alt={Name || 'Instructor'}
    />
    <p className="text-sm font-medium">{Name}</p>
  </div>
);

export default InstructorProfile;
