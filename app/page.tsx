"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";

export default function Home() {
  const router = useRouter();
  const supabase = createClient();

  // State to toggle between Login and Register
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async () => {
    setLoading(true);
    setError(null);

    try {
      if (authMode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/tree");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });
        if (error) throw error;

        // Si la confirmación de email está desactivada, Supabase devuelve una sesión inmediatamente.
        if (data.session && data.user) {
          // Esperar a que el trigger de Supabase cree el árbol inicial
          // El trigger se ejecuta automáticamente al crear el usuario
          await new Promise(resolve => setTimeout(resolve, 1500));
          router.push("/tree");
        } else {
          // Solo mostramos esto si NO se creó la sesión (es decir, si Supabase pidió confirmar)
          alert("¡Cuenta creada! Por favor verifica tu correo electrónico.");
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col bg-background-light dark:bg-background-dark group/design-root overflow-x-hidden font-display">
      {/* TopAppBar */}
      <div className="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between">
        <div className="text-[#0d141b] dark:text-white flex size-12 shrink-0 items-center justify-start cursor-pointer">
          {/* Placeholder for Back Action if needed */}
        </div>
        <h2 className="text-[#0d141b] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
          Tu Árbol Familiar
        </h2>
      </div>

      <div className="flex-1 flex flex-col px-4 max-w-md mx-auto w-full">
        {/* HeadlineText */}
        <div className="pt-8 pb-6">
          <h2 className="text-[#0d141b] dark:text-white tracking-tight text-[28px] font-bold leading-tight text-center">
            {authMode === "login" ? "Bienvenido" : "Crea tu cuenta"}
          </h2>
          <p className="text-[#4c739a] dark:text-slate-400 text-center text-sm mt-2 px-8">
            Conecta con tu historia y comparte con tus seres queridos de forma segura.
          </p>
        </div>

        {/* SegmentedButtons */}
        <div className="flex py-3">
          <div className="flex h-12 flex-1 items-center justify-center rounded-xl bg-slate-200/50 dark:bg-slate-800 p-1">
            <button
              onClick={() => setAuthMode("login")}
              className={`flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 text-sm font-semibold leading-normal transition-all ${authMode === "login"
                ? "bg-white dark:bg-slate-700 shadow-sm text-[#0d141b] dark:text-white"
                : "text-[#4c739a] dark:text-slate-400"
                }`}
            >
              <span className="truncate">Iniciar Sesión</span>
            </button>
            <button
              onClick={() => setAuthMode("register")}
              className={`flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 text-sm font-semibold leading-normal transition-all ${authMode === "register"
                ? "bg-white dark:bg-slate-700 shadow-sm text-[#0d141b] dark:text-white"
                : "text-[#4c739a] dark:text-slate-400"
                }`}
            >
              <span className="truncate">Registrarse</span>
            </button>
          </div>
        </div>

        {/* Form Container */}
        <div className="mt-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Register-only fields */}
          {authMode === "register" && (
            <div className="flex flex-wrap items-end gap-4">
              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-[#0d141b] dark:text-slate-200 text-sm font-semibold leading-normal pb-2 ml-1">
                  Nombre completo
                </p>
                <input
                  className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d141b] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border-none bg-white dark:bg-slate-800 shadow-sm h-14 placeholder:text-[#94a3b8] p-[15px] text-base font-normal leading-normal"
                  placeholder="Tu nombre"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </label>
            </div>
          )}

          {/* TextField Email */}
          <div className="flex flex-wrap items-end gap-4">
            <label className="flex flex-col min-w-40 flex-1">
              <p className="text-[#0d141b] dark:text-slate-200 text-sm font-semibold leading-normal pb-2 ml-1">
                Correo electrónico
              </p>
              <input
                className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d141b] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border-none bg-white dark:bg-slate-800 shadow-sm h-14 placeholder:text-[#94a3b8] p-[15px] text-base font-normal leading-normal"
                placeholder="nombre@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
          </div>

          {/* TextField Password */}
          <div className="flex flex-wrap items-end gap-4">
            <label className="flex flex-col min-w-40 flex-1">
              <p className="text-[#0d141b] dark:text-slate-200 text-sm font-semibold leading-normal pb-2 ml-1">
                Contraseña
              </p>
              <div className="flex w-full flex-1 items-stretch rounded-xl bg-white dark:bg-slate-800 shadow-sm">
                <input
                  className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-l-xl text-[#0d141b] dark:text-white focus:outline-0 focus:ring-0 border-none bg-transparent h-14 placeholder:text-[#94a3b8] p-[15px] pr-2 text-base font-normal leading-normal"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="text-[#4c739a] flex items-center justify-center pr-[15px] rounded-r-xl cursor-pointer">
                  <span className="material-symbols-outlined">visibility</span>
                </div>
              </div>
            </label>
          </div>

          {authMode === "login" && (
            <div className="flex justify-end px-1">
              <a className="text-primary text-sm font-medium hover:underline" href="#">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          )}
        </div>

        {/* Primary Action Button */}
        <div className="mt-10">
          <button
            onClick={handleAuth}
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Procesando..." : (authMode === "login" ? "Continuar" : "Crear cuenta")}
          </button>
        </div>

        {/* Social Login Divider */}
        <div className="flex items-center my-10 gap-4">
          <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-800"></div>
          <span className="text-[#4c739a] text-xs font-semibold uppercase tracking-wider">
            O continuar con
          </span>
          <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-800"></div>
        </div>

        {/* Social Buttons */}
        <div className="flex justify-center gap-4 mb-10">
          <button
            onClick={handleGoogleLogin}
            className="flex items-center justify-center size-14 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 transition-transform active:scale-95"
          >
            <img
              alt="Google"
              className="size-6"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGMiv8ttoEByU3F7MbD6HoscsOUWWlWvqRH46ncLYKflztD2tnFD2YnbqwOL11BXujdD1LTlH6MDv5tJnc5_IqkEtcV5fQjZA-6R2MGNc0liJjW37xu9T4A0bENcA2JvgsVCAYwwJ8CIzzfvljdXgrNZOOU8MKtufzXXyDBrAGMjvjCjn1sD3cisOvswa1FM-aWiOZw3qYMaFhv2p9G-JAqTcPOBLAPXLUNVCjOH0ko0Umuq7bnnt_BgDOQoCz1LRqRDXHJGXWng"
            />
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 text-center">
        <p className="text-[#4c739a] dark:text-slate-400 text-xs leading-relaxed px-4">
          Al continuar, aceptas nuestros{" "}
          <a className="text-primary font-medium" href="#">
            Términos y Condiciones
          </a>{" "}
          y nuestra{" "}
          <a className="text-primary font-medium" href="#">
            Política de Privacidad
          </a>
          .
        </p>
      </div>

      {/* Safe Area Spacer for iOS (optional) */}
      <div className="h-8 bg-transparent"></div>
    </div>
  );
}
