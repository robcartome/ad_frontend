"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "sonner";
import { LogIn, Eye, EyeOff, Building2 } from "lucide-react";

export default function LoginPage() {
  const { login, selectCompany } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState("login"); // "login" | "select-company"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(email, password);
      if (data.companies.length === 0) {
        toast.error("Tu usuario no pertenece a ninguna empresa. Solicita acceso a un administrador.");
        return;
      }
      if (data.companies.length === 1) {
        // Auto-select the only company
        await selectCompany(data.companies[0].company_id, data.companies[0].company_name);
        toast.success("Sesión iniciada correctamente");
        router.push("/admin");
      } else {
        setCompanies(data.companies);
        setStep("select-company");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectCompany(company) {
    setLoading(true);
    try {
      await selectCompany(company.company_id, company.company_name);
      toast.success(`Empresa seleccionada: ${company.company_name}`);
      router.push("/admin");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">ApuDig</h1>
          <p className="text-sm text-gray-500 mt-1">Sistema ERP para ferreterías</p>
        </div>

        {step === "login" && (
          <>
            <h2 className="text-lg font-semibold text-gray-700 mb-6">Iniciar sesión</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="usuario@empresa.com"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <LogIn size={16} />
                )}
                Entrar
              </button>
            </form>
          </>
        )}

        {step === "select-company" && (
          <>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Selecciona una empresa</h2>
            <p className="text-sm text-gray-500 mb-6">
              Tu usuario tiene acceso a las siguientes empresas:
            </p>
            <div className="space-y-3">
              {companies.map((company) => (
                <button
                  key={company.company_id}
                  onClick={() => handleSelectCompany(company)}
                  disabled={loading}
                  className="w-full text-left border border-gray-200 hover:border-blue-400 hover:bg-blue-50 rounded-lg p-4 transition-colors disabled:opacity-50"
                >
                  <div className="font-semibold text-gray-800">{company.company_name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Roles: {company.roles.join(", ")}
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep("login")}
              className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline"
            >
              ← Volver al login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
