export const ZaEmptyPreview = () => (
  <section
    aria-label="No Pokémon selected"
    className="hidden flex-none flex-col items-center justify-center gap-5 px-8 pb-6 lg:flex lg:min-h-0 lg:w-[42%]"
  >
    <div className="flex size-56 items-center justify-center rounded-2xl border border-white/20 bg-(--za-tile) shadow-lg shadow-black/25">
      <span
        aria-hidden
        className="text-8xl font-bold text-white/25 select-none"
      >
        ?
      </span>
    </div>
    <p className="text-lg font-bold text-white/70">
      Select a Pokémon to see its entry
    </p>
  </section>
);
