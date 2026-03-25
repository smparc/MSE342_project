/**
 * UW-style faculties and programs for sign-up / profile.
 */

export const FACULTIES = [
  'Arts',
  'Engineering',
  'Environment',
  'Health',
  'Mathematics',
  'Science',
];

/** @type {Record<string, string[]>} */
export const PROGRAMS_BY_FACULTY = {
  Arts: [
    'Accounting and Financial Management',
    'Anthropology',
    'Classical Studies',
    'Classics',
    'Communication Arts',
    'Economics',
    'English',
    'Fine Arts',
    'French',
    'Gender and Social Justice',
    'Global Business and Digital Arts',
    'History',
    'Legal Studies',
    'Liberal Studies',
    'Medieval Studies',
    'Music',
    'Peace and Conflict Studies',
    'Philosophy',
    'Political Science',
    'Psychology',
    'Religion, Culture, and Spirituality',
    'Sexualities, Relationships, and Families',
    'Social Development Studies',
    'Sociology',
    'Sustainability and Financial Management',
    'Theatre and Performance',
  ].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })),

  Engineering: [
    'Architectural Engineering',
    'Architecture',
    'Biomedical Engineering',
    'Chemical Engineering',
    'Civil Engineering',
    'Computer Engineering',
    'Electrical Engineering',
    'Environmental Engineering',
    'Geological Engineering',
    'Management Engineering',
    'Mechanical Engineering',
    'Mechatronics Engineering',
    'Nanotechnology Engineering',
    'Software Engineering',
    'Systems Design Engineering',
  ].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })),

  Environment: [
    'Climate and Environmental Change',
    'Environment and Business',
    'Environment, Resources and Sustainability',
    'Geography and Aviation',
    'Geography and Environmental Management',
    'Geomatics',
    'Planning',
    'Sustainability and Financial Management',
  ].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })),

  Health: [
    'Health Sciences',
    'Kinesiology',
    'Public Health Sciences',
    'Recreation and Leisure Studies',
    'Recreation, Leadership, and Health',
    'Sport and Recreation Management',
    'Therapeutic Recreation',
  ].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })),

  Mathematics: [
    'Actuarial Science',
    'Applied Mathematics',
    'Applied Mathematics (Scientific Computing and Scientific Machine Learning)',
    'Biostatistics',
    'Business Administration (Laurier) and Computer Science (Waterloo) Double Degree',
    'Business Administration (Laurier) and Mathematics (Waterloo) Double Degree',
    'Combinatorics and Optimization',
    'Computational Mathematics',
    'Computer Science',
    'Computing and Financial Management',
    'Data Science',
    'Information Technology Management',
    'Mathematical Economics',
    'Mathematical Finance',
    'Mathematical Optimization',
    'Mathematical Physics',
    'Mathematical Studies',
    'Mathematics',
    'Mathematics / Business Administration',
    'Mathematics / Chartered Professional Accountancy',
    'Mathematics / Financial Analysis and Risk Management',
    'Mathematics Teaching',
    'Pure Mathematics',
    'Software Engineering',
    'Statistics',
  ].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })),

  Science: [
    'Biochemistry',
    'Biological and Medical Physics',
    'Biology',
    'Biomedical Sciences',
    'Chemistry',
    'Earth Sciences',
    'Environmental Sciences',
    'General Science',
    'Honours Science',
    'Materials and Nanosciences',
    'Mathematical Physics',
    'Medical Sciences',
    'Medicinal Chemistry',
    'Physics',
    'Physics and Astronomy',
    'Psychology',
    'Science and Aviation',
    'Science and Business',
    'Science and Financial Management',
  ].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })),
};

export function getProgramsForFaculty(facultyName) {
  if (!facultyName || !PROGRAMS_BY_FACULTY[facultyName]) return [];
  return [...PROGRAMS_BY_FACULTY[facultyName]].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: 'base' })
  );
}