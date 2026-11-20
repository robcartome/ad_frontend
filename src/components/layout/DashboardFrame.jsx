'use client';
import { useState } from 'react';

export default function DashboardFrame({ sidebar, topbar, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);
  const controls = { mobileOpen, setMobileOpen, desktopOpen, onMenuClick: () => setMobileOpen(value => !value), onDesktopToggle: () => setDesktopOpen(value => !value) };
  return <div className="flex min-h-screen bg-gray-100">
    {sidebar(controls)}
    {mobileOpen && <button type="button" className="fixed inset-0 z-30 bg-black/20 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Cerrar menú lateral"/>}
    <div className="flex min-w-0 flex-1 flex-col">{topbar(controls)}<main id="dashboard-main" className="flex-1 overflow-y-auto py-3">{children}</main></div>
  </div>;
}
