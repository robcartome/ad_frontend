import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <section className="flex flex-col items-center text-center py-20 bg-gradient-to-b from-white to-gray-100">
      <h1 className="text-4xl font-bold mb-4">
        Bienvenido a <span className="text-blue-600">FerreteríaApp</span>
      </h1>
      <p className="text-gray-600 max-w-xl mb-6">
        Tu sistema de control de inventario y facturación SaaS especializado en ferreterías.
      </p>

      <div className="space-x-4">
        <Button asChild>
          <a href="/products">Ver productos</a>
        </Button>

        <Button variant="outline" asChild>
          <a href="/admin">Entrar al Panel Admin</a>
        </Button>
      </div>
    </section>
  );
}
