import B3UploaderForm from '@/ui/components/upload/B3UploaderForm';
import GoogleSheetsSync from '@/ui/components/upload/GoogleSheetsSync';

export default function UploadPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-sky-400">📤 Importar Posições</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Google Sheets - lado esquerdo */}
          <div>
            <GoogleSheetsSync />
          </div>

          {/* B3 Upload - lado direito */}
          <div>
            <B3UploaderForm />
          </div>
        </div>

        {/* Instruções */}
        <div className="rounded-lg bg-slate-800/50 border border-slate-700 p-6 text-sm text-slate-300">
          <h2 className="text-lg font-semibold text-sky-400 mb-4">📖 Como usar</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-emerald-400 mb-2">🔄 Google Sheets (Recomendado para B3)</h3>
              <p>
                Cole o link da sua planilha do Google Sheets contendo suas posições da B3. 
                Os dados serão sincronizados automaticamente para o banco de dados.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-blue-400 mb-2">📊 Upload B3</h3>
              <p>
                Importe o arquivo CSV exportado diretamente do site da B3 Investidor.
                Útil para sincronizações rápidas e atualizações de posições existentes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
