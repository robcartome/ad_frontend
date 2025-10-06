import "@/app/globals.css";
import Layout from "@/components/layout/Layout";

export const metadata = {
  title: "Panel de Control - Inventario y Facturación",
  description: "Sistema SaaS para ferreterías",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-gray-50">
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}

// import { Geist, Geist_Mono } from "next/font/google";
// import "./globals.css";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// export const metadata = {
//   title: "Panel de Control - Inventario y Facturación",
//   description: "Sistema SAAS para ferretería",
// };

// export default function RootLayout({ children }) {
//   return (
//     <html lang="es">
//       <body
//         className={`${geistSans.variable} ${geistMono.variable} antialiased`}
//       >
//         {children}
//       </body>
//     </html>
//   );
// }
