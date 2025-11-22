import EditMovement from "@/components/admin/movements/EditMovement";

export default function Page({ params }) {
  return <EditMovement id={params.id} />;
}
