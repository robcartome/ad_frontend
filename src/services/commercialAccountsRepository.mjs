export function createCommercialAccountsRepository(request) {
  return {
    current: () => request('/websites/current/'),
    list: (websiteId, { search = '', offset = 0, signal } = {}) => request(`/websites/${encodeURIComponent(websiteId)}/commercial-accounts/?${new URLSearchParams({ search, offset, limit: 20 })}`, { signal }),
    approve: (websiteId, account, approved) => request(`/websites/${encodeURIComponent(websiteId)}/commercial-accounts/${encodeURIComponent(account.id)}/`, { method: 'PATCH', headers: { 'If-Match': account.etag }, body: JSON.stringify({ wholesaleApproved: approved }) }),
  };
}
