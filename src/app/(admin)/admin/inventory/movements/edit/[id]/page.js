import EditMovement from "@/components/admin/movements/EditMovement";

export default async function Page({ params }) {
  const { id } = await params;

  return <EditMovement id={id} />;
}