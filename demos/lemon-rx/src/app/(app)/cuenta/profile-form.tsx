"use client";

import { useRef, useState, useTransition } from "react";
import { Avatar } from "@/components/avatar";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import type { Profile, Sex } from "@/lib/types";
import { updateOwnProfile } from "./actions";

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

export function ProfileForm({ profile }: { profile: Profile }) {
  const [name, setName] = useState(profile.full_name);
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [sex, setSex] = useState<Sex>(profile.sex ?? "male");
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

        const result = await updateOwnProfile({ fullName: name, phone, sex, avatarUrl: nextAvatar });
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
    <section className="mt-8 rounded-sm border border-line bg-ink-2 p-5">
      <h2 className="font-display text-[22px] font-bold uppercase">Datos personales</h2>
      <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
        <Avatar url={file ? URL.createObjectURL(file) : avatarUrl} name={name} size="xl" />
        <div className="min-w-0 flex-1">
          <label htmlFor="profile-photo" className="label">Foto de perfil</label>
          <input
            ref={inputRef}
            id="profile-photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => chooseFile(e.target.files?.[0] ?? null)}
            className="block w-full text-[14px] text-chalk-3 file:mr-3 file:rounded-sm file:border-0 file:bg-chalk file:px-3 file:py-2 file:font-semibold file:text-ink"
          />
          <p className="mt-1 text-[12px] text-chalk-3">JPG, PNG o WebP · máximo 5 MB.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="profile-name" className="label">Nombre y apellidos</label>
          <input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} autoComplete="name" className="field" />
        </div>
        <div>
          <label htmlFor="profile-phone" className="label">Teléfono</label>
          <input id="profile-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={30} autoComplete="tel" className="field" placeholder="600 000 000" />
        </div>
        <div>
          <label htmlFor="profile-sex" className="label">Sexo</label>
          <select id="profile-sex" value={sex} onChange={(e) => setSex(e.target.value as Sex)} className="field">
            <option value="male">Hombre</option>
            <option value="female">Mujer</option>
          </select>
        </div>
      </div>

      <div className="mt-4">
        <label className="label">Email de acceso</label>
        <div className="field flex items-center text-chalk-3">{profile.email}</div>
        <p className="mt-1 text-[12px] text-chalk-3">Es el email con el que inicias sesión. No se modifica desde este formulario.</p>
      </div>

      {message && <p className={`mt-4 text-[14px] ${message.error ? "text-danger" : "text-ok"}`}>{message.text}</p>}
      <button type="button" onClick={save} disabled={pending} className="btn-primary mt-5 w-full sm:w-auto">
        {pending ? "Guardando…" : "Guardar cambios"}
      </button>
    </section>
  );
}
