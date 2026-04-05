type ContaFormState = {
  clienteId: string;
  instituicaoId: string;
  numeroConta: string;
  apelido: string;
};

type SelectOption = {
  id: string;
  nome: string;
};

type Props = {
  value: ContaFormState;
  clientes: SelectOption[];
  instituicoes: SelectOption[];
  onChange: (patch: Partial<ContaFormState>) => void;
  onCreate: () => void;
  creating: boolean;
};

export default function QuickContaForm({
  value,
  clientes,
  instituicoes,
  onChange,
  onCreate,
  creating,
}: Props) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4 space-y-3">
      <h3 className="text-sm font-semibold text-slate-100">Nova conta</h3>
      <select
        value={value.clienteId}
        onChange={(e) => onChange({ clienteId: e.target.value })}
        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
      >
        <option value="">Selecione o cliente</option>
        {clientes.map((item) => (
          <option key={item.id} value={item.id}>
            {item.nome}
          </option>
        ))}
      </select>
      <select
        value={value.instituicaoId}
        onChange={(e) => onChange({ instituicaoId: e.target.value })}
        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
      >
        <option value="">Selecione a instituicao</option>
        {instituicoes.map((item) => (
          <option key={item.id} value={item.id}>
            {item.nome}
          </option>
        ))}
      </select>
      <input
        value={value.numeroConta}
        onChange={(e) => onChange({ numeroConta: e.target.value })}
        placeholder="Numero da conta"
        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
      />
      <input
        value={value.apelido}
        onChange={(e) => onChange({ apelido: e.target.value })}
        placeholder="Apelido opcional"
        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
      />
      <button
        type="button"
        onClick={onCreate}
        disabled={creating}
        className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white disabled:bg-slate-600"
      >
        {creating ? "Criando..." : "Criar conta"}
      </button>
    </div>
  );
}
