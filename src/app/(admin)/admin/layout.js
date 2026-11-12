import AdminLayout from "@/components/layout/AdminLayout";

export const metadata = {
  title: "Administración web | APUDIG",
};

export default function AdminRootLayout({ children }) {
  return <AdminLayout>{children}</AdminLayout>;
}
