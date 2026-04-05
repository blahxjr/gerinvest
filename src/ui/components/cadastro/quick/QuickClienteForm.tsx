type ClienteFormState = {
  nome: string;
  documento: string;
  email: string;
};

type Props = {
  value: ClienteFormState;
  onChange: (patch: Partial<ClienteFormState>) => void;
  onCreate: () => void;
  creating: boolean;
};

export default function QuickClienteForm({ value, onChange, onCreate, creating }: Props) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4 space-y-3">
      <h3 className="text-sm font-semibold text-slate-100">Novo cliente</h3>
      <input
        value={value.nome}
        onChange={(e) => onChange({ nome: e.target.value })}
        placeholder="Nome do cliente"
        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
      />
      <input
        value={value.documento}
        onChange={(e) => onChange({ documento: e.target.value })}
        placeholder="CPF ou documento"
        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
      />
      <input
        value={value.email}
        onChange={(e) => onChange({ email: e.target.value })}
        placeholder="E-mail"
        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
      />
      <button
        type="button"
        onClick={onCreate}
        disabled={creating}
        className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white disabled:bg-slate-600"
      >
        {creating ? "Criando..." : "Criar cliente"}
      </button>
    </div>
  );
}
