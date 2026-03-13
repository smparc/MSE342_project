describe('Exchange App', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/users/by-email/*', { username: 'elly' });
    cy.intercept('GET', '/api/user/*', {
      id: 1,
      display_name: 'Elly Hayakawa',
      username: 'elly',
      bio: 'Engineering student at UWaterloo',
    });
    cy.intercept('GET', '/api/posts/*', []);
    cy.intercept('GET', '/api/messages-list*', [
      {
        id: '1',
        senderName: 'Alice Chen',
        lastMessage: 'Hey, how are you?',
        lastMessageAt: '2026-02-26T10:30:00Z',
        unread: 2,
      },
      {
        id: '2',
        senderName: 'Bob Smith',
        lastMessage: 'See you tomorrow!',
        lastMessageAt: '2026-02-25T15:00:00Z',
        unread: 0,
      },
    ]);
    cy.intercept('GET', '/api/conversations/*/messages*', [
      { id: '101', senderId: 'alice', senderName: 'Alice Chen', content: 'Hello!', created_at: '2026-02-26T10:00:00Z' },
      { id: '102', senderId: 'elly', senderName: 'Elly Hayakawa', content: 'Hi Alice!', created_at: '2026-02-26T10:05:00Z' },
    ]);
    cy.intercept('GET', '/api/courses/meta/filters', {
      countries: ['Japan', 'Germany'],
      continents: ['Asia', 'Europe'],
      terms: ['Fall 2025', 'Winter 2026'],
    });
    cy.intercept('GET', '/api/courses*', {
      courses: [
        {
          course_id: 1,
          host_course_code: 'CS101',
          host_course_name: 'Intro to Programming',
          host_university: 'Tokyo University',
          uw_course_code: 'CS115',
          uw_course_name: 'Introduction to Computer Science',
          country: 'Japan',
          status: 'Approved',
          term_taken: 'Fall 2025',
          last_updated: '2026-01-15T00:00:00Z',
        },
        {
          course_id: 2,
          host_course_code: 'MATH201',
          host_course_name: 'Linear Algebra',
          host_university: 'TU Munich',
          uw_course_code: 'MATH136',
          uw_course_name: 'Linear Algebra 1',
          country: 'Germany',
          status: 'Pending Review',
          term_taken: 'Winter 2026',
          last_updated: '2026-02-01T00:00:00Z',
        },
      ],
      pagination: { total: 2, page: 1, totalPages: 1 },
    });
    cy.intercept('GET', '/api/users/elly/saved-courses', []);
  });

  it('shows user profile on the homepage', () => {
    cy.visit('/');
    cy.contains('Elly Hayakawa');
    cy.contains('elly');
  });

  it('navigates to messages and shows conversations', () => {
    cy.visit('/');
    cy.get('[data-testid="ChatIcon"]').click();
    cy.url().should('include', '/messages');
    cy.contains('Alice Chen');
    cy.contains('Bob Smith');
  });

  it('opens a conversation and displays messages', () => {
    cy.visit('/messages');
    cy.contains('Alice Chen').click();
    cy.contains('Hello!');
    cy.contains('Hi Alice!');
  });

  it('open course equivalency and shows courses', () => {
    cy.visit('/course-equivalency');
    cy.url().should('include', '/course-equivalency');
    cy.contains('Course Equivalency Database');
    cy.contains('CS101');
    cy.contains('Tokyo University');
    cy.contains('MATH201');
    cy.contains('TU Munich');
  });

  it('searches for courses by keyword', () => {
    cy.visit('/course-equivalency');
    cy.get('input[placeholder*="Search"]').type('Tokyo');
    cy.contains('Tokyo University');
  });

  it('shows no results message when search is empty', () => {
    cy.intercept('GET', '/api/courses*', {
      courses: [],
      pagination: { total: 0, page: 1, totalPages: 1 },
    });
    cy.visit('/course-equivalency');
    cy.contains('No courses found');
  });
});
