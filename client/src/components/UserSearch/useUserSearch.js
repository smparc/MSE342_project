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
  facultyFilter = '',
  gradYearFilter = '',
  exchangeTermFilter = '',
  exchangeCountryFilter = '',
  exchangeSchoolFilter = '',
  /** When true (e.g. Search page), fetch with empty q to show a default user list. */
  fetchAllWhenEmpty = false,
}) => {
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(() => Boolean(fetchAllWhenEmpty && enabled));
  const [error, setError] = React.useState('');

  const searchUsers = React.useCallback(async () => {
    if (!enabled) {
      setUsers([]);
      setError('');
      setLoading(false);
      return;
    }
    const hasTextOrFilters =
      searchQuery.trim() ||
      facultyFilter.trim() ||
      gradYearFilter.trim() ||
      exchangeTermFilter.trim() ||
      exchangeCountryFilter.trim() ||
      exchangeSchoolFilter.trim();
    if (!fetchAllWhenEmpty && !hasTextOrFilters) {
      setUsers([]);
      setError('');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (currentUsername) params.set('exclude', currentUsername);
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      if (includeTags) params.set('includeTags', '1');
      if (excludeConversations) params.set('excludeConversations', '1');
      if (facultyFilter.trim()) params.set('faculty', facultyFilter.trim());
      if (gradYearFilter.trim()) params.set('grad_year', gradYearFilter.trim());
      if (exchangeTermFilter.trim()) params.set('exchange_term', exchangeTermFilter.trim());
      if (exchangeCountryFilter.trim()) params.set('exchange_country', exchangeCountryFilter.trim());
      if (exchangeSchoolFilter.trim()) params.set('exchange_school', exchangeSchoolFilter.trim());

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
  }, [
    currentUsername,
    searchQuery,
    includeTags,
    excludeConversations,
    enabled,
    facultyFilter,
    gradYearFilter,
    exchangeTermFilter,
    exchangeCountryFilter,
    exchangeSchoolFilter,
    fetchAllWhenEmpty,
  ]);

  return { users, loading, error, searchUsers };
};

export default useUserSearch;
