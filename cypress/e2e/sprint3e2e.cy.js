/**
 * Sprint 3 — high-level E2E flows (user search, exchange calendar, navigation).
 * Mirrors sprint 1 / sprint 2 style: API stubs + real UI. Requires a logged-in session
 * against the dev server (same assumption as other e2e specs).
 */

const mockSearchUsers = [
  {
    username: 'partner.user',
    display_name: 'Partner User',
    bio: 'On exchange in Spain',
    faculty: 'Arts',
    program: 'Economics',
    grad_year: 2027,
    exchange_term: '3A',
    destination_country: 'Spain',
    destination_school: 'University of Barcelona',
    uw_verified: false,
    tags: [],
  },
  {
    username: 'other.dev',
    display_name: 'Other Dev',
    bio: '',
    faculty: 'Engineering',
    program: 'Computer Science',
    grad_year: 2026,
    exchange_term: '4A',
    destination_country: null,
    destination_school: null,
    uw_verified: true,
    tags: [],
  },
];

const mockMilestones = [
  {
    milestone_id: 501,
    title: 'Exchange application deadline',
    milestone_type: 'UW Internal',
    deadline_utc: '2026-09-15T16:00:00.000Z',
    is_completed: false,
    phase: 'Application',
    destination_country: null,
    is_overdue: false,
    is_approaching_48h: false,
    is_approaching_7d: false,
  },
  {
    milestone_id: 502,
    title: 'Host orientation session',
    milestone_type: 'Host University',
    deadline_utc: '2026-09-22T14:00:00.000Z',
    is_completed: false,
    phase: 'Pre-departure Training',
    destination_country: 'Spain',
    is_overdue: false,
    is_approaching_48h: false,
    is_approaching_7d: true,
  },
];

const sprint3Intercepts = () => {
  cy.intercept('GET', '/api/users/by-email/*', { username: 'elly' });
  cy.intercept('GET', '/api/user/*', {
    display_name: 'Elly Hayakawa',
    username: 'elly',
    bio: 'Engineering student at UWaterloo',
  });
  cy.intercept('GET', '/api/posts/*', []);
  cy.intercept('GET', '/api/messages-list*', []);
  cy.intercept('GET', '/api/messages-unread-count*', { count: 0 });
  cy.intercept('GET', '/api/courses/meta/filters', {
    countries: ['Spain', 'Japan'],
    continents: ['Europe', 'Asia'],
    terms: ['Fall 2025', 'Winter 2026'],
  });
  cy.intercept('GET', '/api/courses*', {
    courses: [],
    pagination: { total: 0, page: 1, totalPages: 1 },
  });
  cy.intercept('GET', '/api/users/elly/saved-courses', []);
  cy.intercept('GET', '/api/users/search*', mockSearchUsers).as('userSearch');
  cy.intercept('GET', '**/api/users/elly/milestones*', mockMilestones).as('milestones');
};

describe('Sprint 3 — User search', () => {
  beforeEach(() => {
    sprint3Intercepts();
    cy.visit('/search');
  });

  it('loads the search page with heading and filter row', () => {
    cy.wait('@userSearch');
    cy.contains('Search Users');
    cy.get('select[aria-label="Faculty"]').should('exist');
    cy.get('select[aria-label="Class (graduation year)"]').should('exist');
    cy.get('select[aria-label="Exchange term"]').should('exist');
    cy.contains('Partner User');
  });

  it('finds users via the main search bar (exchange university text)', () => {
    cy.wait('@userSearch');
    cy.get('input[placeholder*="exchange university"]')
      .clear()
      .type('Barcelona');
    cy.wait('@userSearch').then((interception) => {
      const u = new URL(interception.request.url);
      expect(u.searchParams.get('q')).to.contain('Barcelona');
    });
    cy.contains('Partner User');
  });

  it('applies a faculty filter and refetches', () => {
    cy.wait('@userSearch');
    cy.get('select[aria-label="Faculty"]').select('Engineering');
    cy.wait('@userSearch');
    cy.get('@userSearch').its('request.url').should('include', 'faculty=Engineering');
  });
});

describe('Sprint 3 — Exchange calendar', () => {
  beforeEach(() => {
    sprint3Intercepts();
    cy.visit('/calendar');
  });

  it('shows the calendar shell, export control, and milestone-driven content', () => {
    cy.contains('Exchange Calendar');
    cy.contains('Track your application deadlines');
    cy.contains('button', 'Export .ics').should('be.visible');
    cy.wait('@milestones');
    cy.contains('Exchange application deadline');
    cy.get('.ec-legend').should('exist');
  });

  it('switches to Application Checklist and shows progress UI', () => {
    cy.wait('@milestones');
    cy.contains('button', 'Application Checklist').click();
    cy.contains('Application Progress');
    cy.get('[role="progressbar"]').should('exist');
  });

  it('uses calendar program filter and clear filters', () => {
    cy.wait('@milestones');
    cy.get('[aria-label="Filter by program"]').select('UW Internal');
    cy.wait('@milestones');
    cy.contains('button', 'Clear Filters').click();
    cy.get('[aria-label="Filter by program"]').should('have.value', '');
  });
});

describe('Sprint 3 — Cross-route flow', () => {
  beforeEach(() => {
    sprint3Intercepts();
  });

  it('navigates Search → Calendar via the sidebar', () => {
    cy.visit('/search');
    cy.wait('@userSearch');
    cy.contains('Search Users');
    cy.get('[data-testid="CalendarIcon"]').click();
    cy.url().should('include', '/calendar');
    cy.contains('Exchange Calendar');
    cy.wait('@milestones');
  });

  it('navigates Calendar → Search via the sidebar', () => {
    cy.visit('/calendar');
    cy.wait('@milestones');
    cy.get('[data-testid="SearchIcon"]').click();
    cy.url().should('include', '/search');
    cy.contains('Search Users');
    cy.wait('@userSearch');
  });
});
