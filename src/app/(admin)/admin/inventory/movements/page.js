"use client";

import { useEffect, useState } from "react";
import { getMovements } from "@/services/movementsService";
import MovementsTable from "@/components/admin/MovementsTable";

export default function MovementsPage() {
  const [movements, setMovements] = useState([]);

  useEffect(() => {
    getMovements().then(setMovements);
  }, []);

  return (
    <div className="p-6">
      <MovementsTable movements={movements} />
    </div>
  );
}
