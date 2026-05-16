"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import {
  listUsers,
  listRoles,
  assignRoleToUser,
  removeRoleFromUser,
  registerUser,
} from "@/services/authService";
import { toast } from "sonner";
import { Users, UserPlus, Shield, X, Check } from "lucide-react";

export default function UsersPage() {
  const { selectedCompany, hasRole, isSuperuser } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);

  // Register form state
  const [form, setForm] = useState({ email: "", password: "", name: "", phone: "" });
  const [saving, setSaving] = useState(false);

  const canManage = isSuperuser || hasRole("admin", "super_admin");

  useEffect(() => {
    if (!canManage) return;
    loadData();
  }, [canManage]);

  async function loadData() {
    setLoading(true);
    try {
      const [u, r] = await Promise.all([listUsers(), listRoles()]);
      setUsers(u);
      setRoles(r);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAssignRole(userId, roleId) {
    try {
      await assignRoleToUser(userId, roleId, selectedCompany?.company_id);
      toast.success("Rol asignado");
      loadData();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleRemoveRole(userId, roleId) {
    try {
      await removeRoleFromUser(userId, roleId, selectedCompany?.company_id);
      toast.success("Rol quitado");
      loadData();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await registerUser(form.email, form.password, form.name, form.phone);
      toast.success(`Usuario ${form.email} creado`);
      setForm({ email: "", password: "", name: "", phone: "" });
      setShowRegister(false);
      loadData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!canManage) {
    return (
      <div className="p-8 text-center text-gray-500">
        No tienes permisos para gestionar usuarios.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-blue-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">Gestión de Usuarios</h1>
            <p className="text-sm text-gray-500">
              Empresa: {selectedCompany?.company_name}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowRegister(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <UserPlus size={15} />
          Nuevo usuario
        </button>
      </div>

      {/* Register modal */}
      {showRegister && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Crear usuario</h2>
              <button onClick={() => setShowRegister(false)}>
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleRegister} className="space-y-3">
              <input
                type="text"
                placeholder="Nombre completo"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                placeholder="Correo electrónico *"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="tel"
                placeholder="Teléfono"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="password"
                placeholder="Contraseña (mínimo 8 caracteres) *"
                required
                minLength={8}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRegister(false)}
                  className="flex-1 border border-gray-300 rounded-lg py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check size={14} />
                  )}
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Usuario</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Roles</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Asignar rol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  roles={roles}
                  companyId={selectedCompany?.company_id}
                  onAssign={handleAssignRole}
                  onRemove={handleRemoveRole}
                />
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-400">
                    No hay usuarios en esta empresa. Crea el primero.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function UserRow({ user, roles, companyId, onAssign, onRemove }) {
  const [selectedRole, setSelectedRole] = useState("");

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3">
        <div className="font-medium text-gray-800">{user.name || "—"}</div>
        <div className="text-xs text-gray-500">{user.email}</div>
        {user.is_superuser && (
          <span className="inline-flex items-center gap-1 text-xs text-blue-600 mt-0.5">
            <Shield size={10} /> Superadmin
          </span>
        )}
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
            user.is_active
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {user.is_active ? "Activo" : "Inactivo"}
        </span>
      </td>
      <td className="px-4 py-3 max-w-xs">
        {/* We don't have per-user role info in the list — admin needs to use assign/remove */}
        <span className="text-gray-400 text-xs">Ver abajo</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Seleccionar rol...</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <button
            disabled={!selectedRole}
            onClick={() => {
              onAssign(user.id, selectedRole);
              setSelectedRole("");
            }}
            className="bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs px-2 py-1.5 rounded-lg disabled:opacity-40"
          >
            Asignar
          </button>
          <button
            disabled={!selectedRole}
            onClick={() => {
              onRemove(user.id, selectedRole);
              setSelectedRole("");
            }}
            className="bg-red-100 hover:bg-red-200 text-red-700 text-xs px-2 py-1.5 rounded-lg disabled:opacity-40"
          >
            Quitar
          </button>
        </div>
      </td>
    </tr>
  );
}
