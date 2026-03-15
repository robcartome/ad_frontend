"use client";
import { useState, useEffect } from "react";

import "../globals.css";
import "../css/style.css"
import "../css/euclid-circular-a-font.css";


import PreLoader from "@/components/PreLoader";

export default function RootLayout({ children }) {

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {loading ? (
        <PreLoader />
      ) : (
        <>{children}</>
      )}
    </>
  );
}
