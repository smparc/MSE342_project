import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom'
import Profile from './index'
import NavBar from '../App/NavBar'
import CourseSearch from '../CourseSearch/index'
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { FirebaseContext } from '../Firebase';

const theme = createTheme()

const mockFirebase = {
    auth: {
        currentUser: {
            getIdToken: () => Promise.resolve('mock-token'),
            email: 'test@example.com'
        }
    },
    doSignOut: jest.fn(() => Promise.resolve())
};

const renderWithProviders = (ui) => {
    return render(
        <MemoryRouter>
            <ThemeProvider theme={theme}>
                <FirebaseContext.Provider value={mockFirebase}>
                    {ui}
                </FirebaseContext.Provider>
            </ThemeProvider>
        </MemoryRouter>
    );
};



describe('Profile Sprint 3 Tests', () => {
    beforeEach(() => {
        global.fetch = jest.fn()
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('Bio Adding/Deleting', () => {
        const mockUser = {username: 'test.user', display_name: 'Test User', bio: "Bio"}

        it('should allow deleting profile bio', async() => {
            global.fetch.mockImplementation((url, options) => {
                if(options?.method === 'PUT') return Promise.resolve({ok: true, json: async() => ({success: true}) })
                    return Promise.resolve({ok: true, json: async() => mockUser})
            })

            renderWithProviders(<Profile currentUser='test.user' />)
            await screen.findByText('test.user')

            fireEvent.click(screen.getByRole('button', { name: /Edit Profile/i }));
            fireEvent.change(screen.getByLabelText(/Bio/i), { target: { value: '' } });
            fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('api/user/'), expect.objectContaining({method: 'PUT'}))
            })
        })


        it('should allow updating the bio with new text', async () => {
            global.fetch.mockImplementation((url, options) => {
                if (options?.method === 'PUT') return Promise.resolve({ ok: true, json: async () => ({ success: true }) });
                return Promise.resolve({ ok: true, json: async () => mockUser });
            });

            renderWithProviders(<Profile currentUser="test.user" />);
            await screen.findByText('test.user');

            fireEvent.click(screen.getByRole('button', { name: /Edit Profile/i }));
            fireEvent.change(screen.getByLabelText(/Bio/i), { target: { value: 'New Bio' } });
            fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith(
                    expect.stringContaining('/api/user/'),
                    expect.objectContaining({ body: expect.stringContaining('"bio":"New Bio"') })
                );
            });
        });

        it('should handle API errors during bio update', async () => {
            global.fetch.mockImplementation((url, options) => {
                if (options?.method === 'PUT') return Promise.resolve({ ok: false, status: 500, json: async () => ({ error: 'Fail' }) });
                return Promise.resolve({ ok: true, json: async () => mockUser });
            });

            renderWithProviders(<Profile currentUser="test.user" />);
            fireEvent.click(await screen.findByRole('button', { name: /Edit Profile/i }));
            fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ method: 'PUT' }));
            });
        });

    })

    describe('Navbar', () => {
        it('should allow the settings bar in nav bar', async () => {
            renderWithProviders(<NavBar currentUser='test.user' />)
            expect(await screen.findByLabelText(/Settings/i)).toBeInTheDocument()
        })
    })

    describe('Settings', () => {
        it('should open the settings menu and show Profile link', async() => {
            renderWithProviders(<NavBar currentUser='test.user' />)
            fireEvent.click(await screen.findByLabelText(/Settings/i))
            // expect(await screen.findByText('Profile').toBeInTheDocument())
            const profileLink = await screen.findByText('Profile')
            expect(profileLink).toBeInTheDocument()
        })
    })


    describe('Course Search and Adding Classes', () => {
        const mockCourse = { course_id: 1, host_course_code: 'TEST 100', uw_course_code: 'UW 100', status: 'Approved'}

        const mockSearchAPI = (courseData = mockCourse) => {
            global.fetch.mockImplementation((url, options) => {
                if (url.includes('/meta/filters')) return Promise.resolve({ ok: true, json: async () => ({ countries: [], continents: [], terms: [] }) });
                if (url.includes('/api/courses?')) return Promise.resolve({ ok: true, json: async () => ({ courses: [courseData], totalPages: 1 }) });
                if (url.match(/\/api\/courses\/\d+$/)) return Promise.resolve({ ok: true, json: async () => courseData });
                if (options?.method === 'POST') return Promise.resolve({ ok: true, json: async () => ({ success: true }) });
                return Promise.resolve({ ok: true, json: async () => [] })
            })
    }

    it('should add course from main equivalency table', async () => {
        mockSearchAPI()
        renderWithProviders(<CourseSearch currentUser='test.user' />)
        await screen.findByText(/TEST 100/i)

        fireEvent.click(screen.getByTitle(/Add to my Profile/i))

        await waitFor( () => {
            const postCalls = global.fetch.mock.calls.filter(c => c[1]?.method === 'POST')
            expect(postCalls.length).toBe(1)
        })
    })

    it('should add course from course modal', async () => {
        const modalCourse = {...mockCourse, uw_course_code: 'MODAL 100', host_course_code: 'MODAL-HOST'}
        mockSearchAPI(modalCourse)

        renderWithProviders(<CourseSearch currentUser='test.user' />)
        const card = await screen.findByText(/MODAL-HOST/i)
        fireEvent.click(card.closest('.cs-card'))

        await screen.findByText('Course Equivalency Details')
        const modalAddButton = await screen.findByRole('button', {name: /Add to Profile/i})
        fireEvent.click(modalAddButton)
    })

    it('should handle already added courses error', async() => {
        global.fetch.mockImplementation((url, options) => {
            if (options?.method === 'POST') return Promise.resolve({ok: false, status: 400, json: async() => ({error: 'Exist'})})
            if (url.includes('/meta/filters')) return Promise.resolve({ok: true, json: async () => ({countries: [], continents: [], terms: []})})
            if (url.includes('/api/courses?')) return Promise.resolve({ok: true, json: async () => ({courses: [mockCourse], totalPages: 1})})
            return Promise.resolve({ok: true, json: async() => []})
        })

        renderWithProviders(<CourseSearch currentUser='test.user' />)
        await screen.findByText(/TEST 100/i)
        fireEvent.click(screen.getByTitle(/Add to my Profile/i))

        await screen.findByText(/Failed to add course/i)
    })


    })
})