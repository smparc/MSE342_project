// Mock course equivalencies (Graz University of Technology & University of Technology Sydney)
const mockCourses = [
    {
        course_id: 1,
        uw_course_code: 'MSE 342',
        uw_course_name: 'Principles of Software Engineering',
        host_course_code: 'INH.04062UF',
        host_course_name: 'Agile Software Development',
        host_university: 'Graz University of Technology',
        country: 'Austria',
        continent: 'Europe',
        status: 'Approved',
        term_taken: 'Fall 2025',
        last_updated: '2026-01-15T00:00:00Z',
    },
    {
        course_id: 2,
        uw_course_code: 'GENE 21U',
        uw_course_name: 'Stochastic Models and Methods',
        host_course_code: '453.130',
        host_course_name: 'Statistical Signal Processing',
        host_university: 'Graz University of Technology',
        country: 'Austria',
        continent: 'Europe',
        status: 'Approved',
        term_taken: 'Fall 2025',
        last_updated: '2026-01-20T00:00:00Z',
    },
    {
        course_id: 3,
        uw_course_code: 'MSE 431',
        uw_course_name: 'Stochastic Models and Methods',
        host_course_code: '453.031',
        host_course_name: 'Stochastic Models',
        host_university: 'Graz University of Technology',
        country: 'Austria',
        continent: 'Europe',
        status: 'Pending Review',
        term_taken: 'Winter 2026',
        last_updated: '2026-02-01T00:00:00Z',
    },
    {
        course_id: 4,
        uw_course_code: 'GENE 21U',
        uw_course_name: 'MSE Technical Elective',
        host_course_code: '31005',
        host_course_name: 'Machine Learning: Mathematical Theory and Applications',
        host_university: 'Graz University of Technology',
        country: 'Austria',
        continent: 'Europe',
        status: 'Approved',
        term_taken: 'Fall 2025',
        last_updated: '2026-01-10T00:00:00Z',
    },
    {
        course_id: 5,
        uw_course_code: 'GENE 21U',
        uw_course_name: 'MSE Technical Elective',
        host_course_code: '31268',
        host_course_name: 'Intro to Data Analytics (70% equivalent)',
        host_university: 'University of Technology Sydney',
        country: 'Australia',
        continent: 'Oceania',
        status: 'Approved',
        term_taken: 'Fall 2025',
        last_updated: '2026-02-05T00:00:00Z',
    },
];

const commonIntercepts = () => {
    cy.intercept('GET', '/api/users/by-email/*', { username: 'elly' });
    cy.intercept('GET', '/api/user/*', {
        id: 1,
        display_name: 'Elly Hayakawa',
        username: 'elly',
        bio: 'Engineering student at UWaterloo',
    });
    cy.intercept('GET', '/api/posts/*', []);
    cy.intercept('GET', '/api/messages-list*', []);
    cy.intercept('GET', '/api/courses/meta/filters', {
        countries: ['Austria', 'Australia'],
        continents: ['Europe', 'Oceania'],
        terms: ['Fall 2025', 'Winter 2026'],
    });
    cy.intercept('GET', '/api/courses*', {
        courses: mockCourses,
        pagination: { total: mockCourses.length, page: 1, totalPages: 1 },
    });
    cy.intercept('GET', '/api/users/elly/saved-courses', []);
};

describe('Sign In / Sign Up', () => {
    beforeEach(() => {
        commonIntercepts();
        cy.visit('/', {
            onBeforeLoad: (win) => {
                win.sessionStorage?.setItem('cypress_logout', '1');
            },
        });
    });

    it('shows sign in form when not authenticated', () => {
        cy.contains('Welcome Back');
        cy.get('input[name="email"]').should('exist');
        cy.contains('Password', { matchCase: false });
        cy.get('button').contains(/Sign In/i);
    });

});

describe('Profile / UploadReviews (Expenses & Ratings)', () => {
    beforeEach(() => {
        commonIntercepts();
        cy.intercept('GET', '/api/users/elly/expenses', {
            monthly_cost: 1200,
            rent_cost: 800,
            meal_cost: null,
            coffee_cost: null,
            flight_cost: null,
        });
        cy.intercept('GET', '/api/users/elly/ratings', {
            difficulty_rating: 3,
            safety_rating: 4,
            cleanliness_rating: 0,
            travel_opp_rating: 0,
            food_rating: 0,
            scenery_rating: 0,
            activities_rating: 0,
        });
        cy.intercept('PUT', '/api/users/elly/expenses', { statusCode: 200 }).as('putExpenses');
        cy.intercept('PUT', '/api/users/elly/ratings', { statusCode: 200 }).as('putRatings');
        cy.visit('/');
    });

    it('navigates to UploadReviews tab and shows Expenses and Ratings', () => {
        cy.visit('/profile');
        cy.get('[aria-label="star"]').click();
        cy.contains('Expenses');
        cy.contains('Ratings');
        cy.contains('Total Monthly Expenses');
        cy.contains('School Difficulty');
    });

    it('can edit and save expenses', () => {
        cy.visit('/profile');
        cy.get('[aria-label="star"]').click();
        cy.contains('Total Monthly Expenses').parents('tr').find('input').clear().type('1500');
        cy.contains('Save Reviews').click();
        cy.wait('@putExpenses');
        cy.contains(/Reviews updated successfully/i);
    });

    it('can change ratings and save', () => {
        cy.visit('/profile');
        cy.get('[aria-label="star"]').click();
        cy.get('.MuiRating-root').first().click();
        cy.contains('Save Reviews').click();
        cy.wait('@putRatings');
        cy.contains(/Reviews updated successfully/i);
    });
});

describe('ContactsList', () => {
    const mockContacts = [
        { contact_id: 1, name: 'Jane Doe', role: 'Exchange Coordinator', department: 'International Office', faculty: 'Engineering', email: 'jane@uwaterloo.ca' },
        { contact_id: 2, name: 'John Smith', role: 'Advisor', department: 'Study Abroad', faculty: 'Arts', email: 'john@uwaterloo.ca' },
    ];

    beforeEach(() => {
        commonIntercepts();
        cy.intercept('GET', '/api/contacts', mockContacts);
        cy.visit('/');
    });

    it('navigates to contacts and displays list', () => {
        cy.visit('/contacts');
        cy.url().should('include', '/contacts');
        cy.contains('Study Abroad Contacts');
        cy.contains('Jane Doe');
        cy.contains('John Smith');
    });

    it('searches contacts by name', () => {
        cy.visit('/contacts');
        cy.get('input[placeholder*="Search"]').type('Jane');
        cy.contains('Jane Doe');
        cy.contains('John Smith').should('not.exist');
    });

    it('shows no results when search has no match', () => {
        cy.visit('/contacts');
        cy.get('input[placeholder*="Search"]').type('xyz-nonexistent');
        cy.contains(/No contacts found/i);
    });
});

describe('AdvisorsList', () => {
    const mockAdvisors = [
        { advisor_id: 1, name: 'Dr. Alice Wang', faculty: 'Engineering', programs: 'Exchange Programs', email: 'alice@uwaterloo.ca' },
        { advisor_id: 2, name: 'Dr. Bob Lee', faculty: 'Arts', programs: 'Study Abroad', email: 'bob@uwaterloo.ca' },
    ];

    beforeEach(() => {
        commonIntercepts();
        cy.intercept('GET', '/api/advisors', mockAdvisors);
        cy.visit('/');
    });

    it('navigates to advisors and displays list', () => {
        cy.visit('/advisors');
        cy.url().should('include', '/advisors');
        cy.contains('Academic Advisors');
        cy.contains('Dr. Alice Wang');
        cy.contains('Dr. Bob Lee');
    });

    it('filters advisors by faculty', () => {
        cy.visit('/advisors');
        cy.get('select[aria-label*="Filter"]').select('Engineering');
        cy.contains('Dr. Alice Wang');
        cy.contains('Dr. Bob Lee').should('not.exist');
    });

    it('searches advisors by name', () => {
        cy.visit('/advisors');
        cy.get('input[placeholder*="Search"]').type('Alice');
        cy.contains('Dr. Alice Wang');
        cy.contains('Dr. Bob Lee').should('not.exist');
    });
});

describe('Sort Courses', () => {
    beforeEach(() => {
        commonIntercepts();
        cy.visit('/course-equivalency');
    });

    it('shows sort dropdown with options', () => {
        cy.contains('Course Equivalency Database');
        cy.get('select[aria-label="Sort by"]').should('exist');
        cy.get('select[aria-label="Sort by"]').select('Most Recently Updated');
        cy.get('select[aria-label="Sort by"]').should('have.value', 'last_updated');
    });

    it('can sort by Average Rating', () => {
        const coursesWithRating = mockCourses.slice(0, 2).map((c, i) => ({ ...c, avg_rating: i === 0 ? 4.5 : 3.0 }));
        cy.intercept('GET', '**/api/courses*', (req) => {
            req.reply({
                body: { courses: coursesWithRating, pagination: { total: 2, page: 1, totalPages: 1 } },
            });
        }).as('coursesWithSort');
        cy.get('select[aria-label="Sort by"]').select('Average Rating');
        cy.wait('@coursesWithSort');
        cy.get('@coursesWithSort.all').should('have.length.at.least', 1);
    });

    it('can sort by University Name', () => {
        const sortedByUni = [...mockCourses].sort((a, b) => a.host_university.localeCompare(b.host_university));
        cy.intercept('GET', '**/api/courses*', (req) => {
            req.reply({
                body: { courses: sortedByUni, pagination: { total: mockCourses.length, page: 1, totalPages: 1 } },
            });
        }).as('coursesByUni');
        cy.get('select[aria-label="Sort by"]').select('University Name');
        cy.wait('@coursesByUni');
        cy.get('@coursesByUni').its('request.url').should('include', 'sort=university');
    });
});
