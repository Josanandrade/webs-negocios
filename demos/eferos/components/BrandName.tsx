/** Pinta "®" como superíndice para que no pese lo mismo que las letras en titulares grandes. */
export default function BrandName({ name }: { name: string }) {
  const parts = name.split("®");
  if (parts.length === 1) return <>{name}</>;
  return (
    <>
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && <sup className="reg">®</sup>}
        </span>
      ))}
    </>
  );
}
