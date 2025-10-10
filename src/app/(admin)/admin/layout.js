import AdminLayout from "@/components/layout/AdminLayout";

export const metadata = {
  title: "Panel de Administración | ApuDig",
};

export default function AdminRootLayout({ children }) {
  return <AdminLayout>{children}</AdminLayout>;
}