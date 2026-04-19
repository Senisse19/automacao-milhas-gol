import TermoForm from "@/components/TermoForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-gol-light font-sans selection:bg-gol-orange selection:text-white flex flex-col">
      {/* GOL Header (Simulated) */}
      <header className="bg-gol-white shadow-sm border-b border-gol-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-extrabold tracking-tighter text-gol-orange">
              GOL
            </span>
            <span className="text-gol-gray text-sm font-medium ml-4 hidden sm:block border-l border-gol-border pl-4">
              Portal Interno
            </span>
          </div>
          <div className="text-xs font-bold uppercase tracking-widest text-gol-gray">
            Termo de Quitação
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-12 md:py-16">
        {/* Title Section */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-gol-dark mb-3">
            Emissão de Termo de Quitação
          </h1>
          <p className="text-gol-gray text-base max-w-2xl">
            Preencha os dados abaixo para gerar o documento padronizado em formato .docx.
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-gol-white rounded-2xl shadow-lg border border-gol-border/50 p-6 md:p-10 lg:p-12">
          <TermoForm />
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gol-white border-t border-gol-border py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-6 text-center text-xs text-gol-gray">
          &copy; {new Date().getFullYear()} GOL Linhas Aéreas Inteligentes. Uso Restrito e Confidencial.
        </div>
      </footer>
    </main>
  );
}
