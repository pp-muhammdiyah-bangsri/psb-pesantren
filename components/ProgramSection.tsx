interface ProgramItem {
  id: number;
  nama: string;
  deskripsi: string;
  icon: string;
  warna: string;
  urutan: number;
  is_aktif: boolean;
}

interface ProgramSectionProps {
  programs: ProgramItem[];
  config: Record<string, string>;
}

export default function ProgramSection({ programs, config }: ProgramSectionProps) {
  const primary = config.warna_primer || "#0f4c1e";
  const accent = config.warna_aksen || "#c8a84b";
  const aktif = programs.filter((p) => p.is_aktif);

  if (aktif.length === 0) return null;

  return (
    <section id="program" className="py-20 px-4" style={{ background: `linear-gradient(180deg, #f8faf8 0%, #ffffff 100%)` }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: accent }}>
            {config.program_badge || "Keunggulan Kami"}
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-3" style={{ color: primary }}>
            {config.program_judul || "Program Unggulan"}
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-base">
            {config.program_deskripsi || "Kami menyediakan program terbaik untuk membentuk generasi yang berilmu, berakhlak, dan berdaya saing global."}
          </p>
          <div
            className="w-16 h-1 mx-auto rounded-full mt-4"
            style={{ background: `linear-gradient(90deg, ${accent}, #f0d080)` }}
          />
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {aktif.map((prog, idx) => (
            <div
              key={prog.id}
              className="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              style={{
                background: "white",
                boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
                border: "1px solid rgba(0,0,0,0.06)",
                animationDelay: `${idx * 80}ms`,
              }}
            >
              {/* Color bar top */}
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ background: `linear-gradient(90deg, ${prog.warna || primary}, ${accent})` }}
              />

              <div className="p-7">
                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-5 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: `${prog.warna || primary}15`,
                    border: `1.5px solid ${prog.warna || primary}30`,
                  }}
                >
                  {prog.icon}
                </div>

                {/* Content */}
                <h3
                  className="text-lg font-bold mb-2 leading-snug"
                  style={{ color: prog.warna || primary }}
                >
                  {prog.nama}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {prog.deskripsi}
                </p>
              </div>

              {/* Hover gradient overlay */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ background: `linear-gradient(135deg, ${prog.warna || primary}06, transparent)` }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}