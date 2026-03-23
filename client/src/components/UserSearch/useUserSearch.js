import * as React from 'react';

/**
 * Shared hook for user search using GET /api/users/search.
 * Used by CreateMessage modal and Search page.
 */
export const useUserSearch = ({
  currentUsername = '',
  searchQuery = '',
  includeTags = false,
  excludeConversations = false,
  enabled = true,
}) => {
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const searchUsers = React.useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (currentUsername) params.set('exclude', currentUsername);
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      if (includeTags) params.set('includeTags', '1');
      if (excludeConversations) params.set('excludeConversations', '1');

      const url = `/api/users/search?${params.toString()}`;
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        setUsers([]);
        setError(data.error || 'Failed to search users');
        return;
      }
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error searching users:', err);
      setUsers([]);
      setError('Failed to search users');
    } finally {
      setLoading(false);
    }
  }, [currentUsername, searchQuery, includeTags, excludeConversations, enabled]);

  return { users, loading, error, searchUsers };
};

export default useUserSearch;
