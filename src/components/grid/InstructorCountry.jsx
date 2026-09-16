import React from 'react';
import { GrLocation } from 'react-icons/gr';

const InstructorCountry = ({ Country }) => (
  <div className="flex items-center justify-center gap-2">
    <GrLocation className="text-gray-500" />
    <span className="text-sm">{Country}</span>
  </div>
);

export default InstructorCountry;
