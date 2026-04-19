import TermoForm from "@/components/TermoForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-gol-white flex flex-col md:flex-row font-sans selection:bg-gol-orange selection:text-white">
      {/* Editorial Left Panel - Inspired by Brand Guide */}
      <div className="w-full md:w-[40%] min-h-[40vh] md:min-h-screen flex flex-col sticky top-0">
        {/* Dark Top Section */}
        <div className="bg-gol-dark flex-grow p-10 md:p-16 flex flex-col justify-between text-gol-white relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-sm font-bold tracking-widest text-gol-orange uppercase mb-6">Automação Interna</h1>
            <h2 className="text-5xl md:text-6xl font-normal leading-[1.1] tracking-tight">
              Termo de<br />Quitação<br />de Milhas
            </h2>
          </div>
          
          <div className="mt-20 relative z-10">
            <p className="text-gol-gray text-sm max-w-xs leading-relaxed">
              Sistema gerador de documentos padronizados para o setor de atendimento.
            </p>
          </div>
          
          {/* Abstract background element */}
          <div className="text-[15rem] font-bold tracking-tighter text-white/5 absolute -bottom-16 -right-10 pointer-events-none select-none leading-none">
            GOL
          </div>
        </div>
        
        {/* Orange Bottom Section */}
        <div className="bg-gol-orange p-10 md:p-16 text-gol-white shrink-0">
          <p className="text-lg md:text-xl font-medium leading-snug">
            01. Preencha os dados.<br />
            02. Valide as informações.<br />
            03. Gere o documento.
          </p>
          <div className="mt-12 text-xs font-bold uppercase tracking-widest opacity-90 border-t border-white/20 pt-4">
            Uso Restrito • Confidencial
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full md:w-[60%] bg-gol-white p-8 md:p-16 lg:p-24 overflow-y-auto md:h-screen">
        <TermoForm />
      </div>
    </main>
  );
}
