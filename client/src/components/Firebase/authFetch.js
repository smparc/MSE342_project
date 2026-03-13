/**
 * Utility for making authenticated API calls with Firebase ID token
 */

export const authFetch = async (url, options = {}, firebase) => {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    // Get the Firebase ID token if user is signed in
    if (firebase && firebase.auth.currentUser) {
        try {
            const token = await firebase.auth.currentUser.getIdToken();
            defaultOptions.headers.Authorization = token;
        } catch (error) {
            console.error('Error getting ID token:', error);
        }
    }

    // Merge headers
    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...(options.headers || {}),
        },
    };

    return fetch(url, mergedOptions);
};

export default authFetch;
