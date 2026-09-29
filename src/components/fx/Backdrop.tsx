/** Fixed, pointer-transparent background: a still gradient ground, two soft accent glows and a faint grid. */
export function Backdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 80% at 50% -10%, #0d1024 0%, #06070f 45%, #04050a 100%)',
        }}
      />

      <div
        className="absolute -left-[18vw] -top-[14vh] h-[70vh] w-[70vw] rounded-full opacity-[calc(0.3*var(--fx))] blur-[110px]"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgb(var(--accent-rgb) / 0.55), transparent 66%)',
        }}
      />
      <div
        className="absolute -bottom-[22vh] -right-[16vw] h-[78vh] w-[66vw] rounded-full opacity-[calc(0.25*var(--fx))] blur-[130px]"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgb(var(--accent-2-rgb) / 0.5), transparent 66%)',
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '68px 68px',
          maskImage:
            'radial-gradient(115% 90% at 50% 30%, #000 20%, transparent 78%)',
          WebkitMaskImage:
            'radial-gradient(115% 90% at 50% 30%, #000 20%, transparent 78%)',
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(4,5,10,0.72) 0%, transparent 16%, transparent 84%, rgba(4,5,10,0.85) 100%)',
        }}
      />
    </div>
  );
}
