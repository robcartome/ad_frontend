const websitePermissions = ['read.website', 'manage.website', 'publish.website', 'manage.website.media', 'manage.website.domains'];

export function canAccessAdministrationRoute(pathname, access) {
  if (pathname === '/admin') return true;
  if (pathname === '/admin/website' || pathname.startsWith('/admin/website/')) return access.website;
  return access.companyAdmin;
}

// Presentation only. Django revalidates membership and authorization on every API call.
export function getAdministrationAccess(user, selectedCompany) {
  if (!user?.id || !selectedCompany?.company_id) return { companyAdmin: false, website: false };
  if (user.is_superuser === true) return { companyAdmin: true, website: true };
  const company = user.company;
  if (String(company?.id) !== String(selectedCompany.company_id)) return { companyAdmin: false, website: false };
  const companyAdmin = (company.roles || []).some(role => role.toUpperCase() === 'ADMIN');
  return {
    companyAdmin,
    website: companyAdmin || (company.permissions || []).some(permission => websitePermissions.includes(permission)),
  };
}
