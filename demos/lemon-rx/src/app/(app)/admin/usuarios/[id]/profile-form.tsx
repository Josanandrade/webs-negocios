"use client";

import { useRef, useState, useTransition } from "react";
import { Avatar } from "@/components/avatar";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import type { AccessStatus, PaymentStatus, Profile, Role, Sex } from "@/lib/types";
import { updateUserProfile } from "../actions";

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

export function AdminProfileForm({ profile, isSelf }: { profile: Profile; isSelf: boolean }) {
  const [name, setName] = useState(profile.full_name);
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [sex, setSex] = useState<Sex>(profile.sex ?? "male");
  const [role, setRole] = useState<Role>(profile.role);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(profile.payment_status);
  const [accessStatus, setAccessStatus] = useState<AccessStatus>(profile.access_status);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatar_url);
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function chooseFile(selected: File | null) {
    setMessage(null);
    if (!selected) return setFile(null);
    if (!ALLOWED.includes(selected.type)) {
      setFile(null);
      return setMessage({ text: "Usa una imagen JPG, PNG o WebP.", error: true });
    }
    if (selected.size > MAX_SIZE) {
      setFile(null);
      return setMessage({ text: "La foto no puede superar 5 MB.", error: true });
    }
    setFile(selected);
  }

  function save() {
    setMessage(null);
    startTransition(async () => {
      try {
        let nextAvatar = avatarUrl;
        if (file) {
          const supabase = createBrowserSupabase();
          const path = `${profile.id}/profile`;
          const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, {
            upsert: true,
            contentType: file.type,
            cacheControl: "3600",
          });
          if (uploadError) throw uploadError;
          const { data } = supabase.storage.from("avatars").getPublicUrl(path);
          nextAvatar = `${data.publicUrl}?v=${Date.now()}`;
        }

        const result = await updateUserProfile(profile.id, {
          fullName: name,
          phone,
          sex,
          avatarUrl: nextAvatar,
          role,
          paymentStatus,
          accessStatus,
        });
        if (!result.ok) return setMessage({ text: result.error, error: true });
        setAvatarUrl(nextAvatar);
        setFile(null);
        if (inputRef.current) inputRef.current.value = "";
        setMessage({ text: "Perfil guardado." });
      } catch (error) {
        console.error(error);
        setMessage({ text: "No se ha podido subir la foto. Inténtalo de nuevo.", error: true });
      }
    });
  }

  return (
    <section className="mt-6 rounded-sm border border-line bg-ink-2 p-5">
      <div className="flex items-center gap-4">
        <Avatar url={file ? URL.createObjectURL(file) : avatarUrl} name={name} size="lg" />
        <div className="min-w-0">
          <p className="eyebrow">Perfil de usuario</p>
          <h2 className="truncate font-display text-[24px] font-bold uppercase">{name || "Sin nombre"}</h2>
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="admin-profile-photo" className="label">Foto de perfil</label>
        <input
          ref={inputRef}
          id="admin-profile-photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => chooseFile(e.target.files?.[0] ?? null)}
          className="block w-full text-[14px] text-chalk-3 file:mr-3 file:rounded-sm file:border-0 file:bg-chalk file:px-3 file:py-2 file:font-semibold file:text-ink"
        />
        <p className="mt-1 text-[12px] text-chalk-3">JPG, PNG o WebP · máximo 5 MB.</p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="admin-profile-name" className="label">Nombre y apellidos</label>
          <input id="admin-profile-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} className="field" />
        </div>
        <div>
          <label htmlFor="admin-profile-phone" className="label">Teléfono</label>
          <input id="admin-profile-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={30} className="field" placeholder="600 000 000" />
        </div>
        <div>
          <label htmlFor="admin-profile-sex" className="label">Sexo</label>
          <select id="admin-profile-sex" value={sex} onChange={(e) => setSex(e.target.value as Sex)} className="field">
            <option value="male">Hombre</option>
            <option value="female">Mujer</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="label">Email de acceso</label>
          <div className="field flex items-center text-chalk-3">{profile.email}</div>
          <p className="mt-1 text-[12px] text-chalk-3">Está vinculado al inicio de sesión y no se modifica desde esta ficha.</p>
        </div>
        <div>
          <label htmlFor="admin-profile-role" className="label">Rol</label>
          <select id="admin-profile-role" value={role} disabled={isSelf} onChange={(e) => setRole(e.target.value as Role)} className="field disabled:opacity-60">
            <option value="athlete">Atleta</option>
            <option value="admin">Administrador</option>
          </select>
          {isSelf && <p className="mt-1 text-[12px] text-chalk-3">No puedes quitarte a ti mismo el rol de administrador.</p>}
        </div>
        <div>
          <label htmlFor="admin-profile-payment" className="label">Pago</label>
          <select id="admin-profile-payment" value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)} className="field">
            <option value="paid">Pagado</option>
            <option value="pending">Pendiente</option>
          </select>
        </div>
        <div>
          <label htmlFor="admin-profile-access" className="label">Acceso</label>
          <select id="admin-profile-access" value={role === "admin" ? "active" : accessStatus} disabled={role === "admin"} onChange={(e) => setAccessStatus(e.target.value as AccessStatus)} className="field disabled:opacity-60">
            <option value="pending">Pendiente de activar</option>
            <option value="active">Activo</option>
            <option value="blocked">Bloqueado</option>
          </select>
        </div>
      </div>

      {message && <p className={`mt-4 text-[14px] ${message.error ? "text-danger" : "text-ok"}`}>{message.text}</p>}
      <button type="button" onClick={save} disabled={pending} className="btn-primary mt-5 w-full sm:w-auto">
        {pending ? "Guardando…" : "Guardar perfil"}
      </button>
    </section>
  );
}
