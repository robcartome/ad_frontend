import "./globals.css";

export const metadata = {
  title: "ApuDig",
  description: "Sistema de inventario y facturación SaaS para ferreterías",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        {children}
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