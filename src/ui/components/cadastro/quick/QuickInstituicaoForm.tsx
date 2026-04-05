type InstituicaoFormState = {
  nome: string;
  cnpj: string;
  tipo: string;
};

type Props = {
  value: InstituicaoFormState;
  onChange: (patch: Partial<InstituicaoFormState>) => void;
  onCreate: () => void;
  creating: boolean;
};

export default function QuickInstituicaoForm({ value, onChange, onCreate, creating }: Props) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4 space-y-3">
      <h3 className="text-sm font-semibold text-slate-100">Nova instituicao</h3>
      <input
        value={value.nome}
        onChange={(e) => onChange({ nome: e.target.value })}
        placeholder="Nome da instituicao"
        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
      />
      <input
        value={value.cnpj}
        onChange={(e) => onChange({ cnpj: e.target.value })}
        placeholder="CNPJ"
        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
      />
      <input
        value={value.tipo}
        onChange={(e) => onChange({ tipo: e.target.value })}
        placeholder="Tipo ex.: Banco, Corretora"
        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
      />
      <button
        type="button"
        onClick={onCreate}
        disabled={creating}
        className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white disabled:bg-slate-600"
      >
        {creating ? "Criando..." : "Criar instituicao"}
      </button>
    </div>
  );
}
