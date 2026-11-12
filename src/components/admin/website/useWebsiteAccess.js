'use client';

import { useAuth } from '@/lib/AuthContext';

export function useWebsiteAccess() {
  const auth = useAuth();
  const admin = auth.isSuperuser || auth.hasRole('admin', 'super_admin', 'superadmin');
  const canApply = admin || auth.hasPermission('websites.publish_website');
  const canEdit = admin || auth.hasPermission('websites.change_website');
  return { ...auth, canEdit, canApply, canView: canEdit || canApply || auth.hasPermission('websites.view_website') };
}
