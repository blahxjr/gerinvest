"use client";

import { FormEvent, useMemo, useState } from "react";
import { ClasseAtivo, SubclasseAtivo } from "@/core/domain/types";
import QuickClienteForm from "@/ui/components/cadastro/quick/QuickClienteForm";
import QuickInstituicaoForm from "@/ui/components/cadastro/quick/QuickInstituicaoForm";
import QuickContaForm from "@/ui/components/cadastro/quick/QuickContaForm";

type PerfilCarteira = "conservador" | "moderado" | "arrojado";
type InstituicaoTemplate = "BB" | "NUBANK" | "BTG_EQI" | "NOMAD" | "MERCADO_PAGO";
type CadastroClasse =
  | "FUNDO"
  | "RENDA_FIXA"
  | "ACAO_BR"
  | "FII"
  | "ETF_BR"
  | "BDR"
  | "ACAO_EUA"
  | "ETF_EUA"
  | "REIT"
  | "CRIPTO";
type CurrencyCode = "BRL" | "USD" | "EUR";

type AtivoApi = {
  id: string;
  ticker?: string;
  nome: string;
  classe: ClasseAtivo;
};

type CarteiraOption = {
  id: string;
  nome: string;
  descricao?: string;
  perfil?: PerfilCarteira;
  clienteId?: string;
  contaReferenciaId?: string;
};

type ClienteOption = {
  id: string;
  nome: string;
  documento?: string;
};

type InstituicaoOption = {
  id: string;
  nome: string;
};

type ContaOption = {
  id: string;
  clienteId: string;
  instituicaoId: string;
  instituicaoNome: string;
  numeroConta: string;
  apelido?: string;
};

type InvestmentRow = {
  nome: string;
  ticker: string;
  classe: CadastroClasse;
  subclasse?: SubclasseAtivo;
  moedaOriginal: CurrencyCode;
  instituicaoLinha?: string;
  contaLinha?: string;
  cnpj: string;
  benchmark: string;
  indexador: string;
  emissor: string;
  quantidade: number;
  precoMedio: number;
  valorAtualBrl: number;
  dataEntrada: string;
  dataVencimento: string;
};

type SubmitState =
  | { status: "idle" }
  | { status: "loading" }
  | {
      status: "success";
      carteiraNome: string;
      ativosCriados: number;
      ativosReutilizados: number;
      posicoesCriadas: number;
    }
  | { status: "error"; message: string };

type QuickEntityState = {
  type: "success" | "error";
  message: string;
};

type TemplatePreset = {
  carteiraNome: string;
  descricao: string;
  perfil: PerfilCarteira;
  instituicao: string;
  conta: string;
  rows: InvestmentRow[];
};

type Props = {
  clientes: ClienteOption[];
  instituicoes: InstituicaoOption[];
  contas: ContaOption[];
  carteiras: CarteiraOption[];
};

const FUND_SUBCLASSES: SubclasseAtivo[] = [
  "FUNDO_RENDA_FIXA",
  "FUNDO_MULTIMERCADO",
  "FUNDO_ACOES",
  "FUNDO_CAMBIAL",
  "FUNDO_FOF",
];

const RF_SUBCLASSES: SubclasseAtivo[] = ["RF_POS_FIXADO", "RF_IPCA", "RF_PREFIXADO", "RF_TESOURO"];
const CRYPTO_SUBCLASSES: SubclasseAtivo[] = [
  "CRIPTO_BASE",
  "CRIPTO_INFRAESTRUTURA",
  "CRIPTO_DEFI",
  "CRIPTO_ESPECULATIVO",
];

const TEMPLATE_PRESETS: Record<InstituicaoTemplate, TemplatePreset> = {
  BB: {
    carteiraNome: "Carteira BB",
    descricao: "Fundos de Investimento Banco do Brasil - Agencia 2314-0 / Conta 16629-4",
    perfil: "moderado",
    instituicao: "Banco do Brasil",
    conta: "16629-4",
    rows: [
      {
        nome: "MM Arbitragem",
        ticker: "MM_ARBITRAGEM",
        classe: "FUNDO",
        subclasse: "FUNDO_MULTIMERCADO",
        moedaOriginal: "BRL",
        cnpj: "06.015.361/0001-98",
        benchmark: "CDI",
        indexador: "CDI",
        emissor: "",
        quantidade: 464.613193,
        precoMedio: 5.380820079,
        valorAtualBrl: 2500.13,
        dataEntrada: "2026-04-01",
        dataVencimento: "",
      },
      {
        nome: "RF Bancos Cred Priv",
        ticker: "RF_BANCOS_CRED_PRIV",
        classe: "FUNDO",
        subclasse: "FUNDO_RENDA_FIXA",
        moedaOriginal: "BRL",
        cnpj: "55.052.563/0001-15",
        benchmark: "CDI",
        indexador: "CDI",
        emissor: "",
        quantidade: 5512.352116,
        precoMedio: 1.133817265,
        valorAtualBrl: 6256.74,
        dataEntrada: "2026-03-31",
        dataVencimento: "",
      },
    ],
  },
  NUBANK: {
    carteiraNome: "Carteira Nubank",
    descricao: "Cadastro manual de fundos e CDB da conta Nubank",
    perfil: "moderado",
    instituicao: "Nubank",
    conta: "Conta Principal",
    rows: [
      {
        nome: "Fundo Reserva Imediata",
        ticker: "NU_RESERVA_IMEDIATA",
        classe: "FUNDO",
        subclasse: "FUNDO_RENDA_FIXA",
        moedaOriginal: "BRL",
        cnpj: "",
        benchmark: "CDI",
        indexador: "CDI",
        emissor: "",
        quantidade: 100,
        precoMedio: 10,
        valorAtualBrl: 1000,
        dataEntrada: "",
        dataVencimento: "",
      },
      {
        nome: "CDB Nubank 110% CDI",
        ticker: "CDB_NUBANK_110_CDI",
        classe: "RENDA_FIXA",
        subclasse: "RF_POS_FIXADO",
        moedaOriginal: "BRL",
        cnpj: "",
        benchmark: "CDI",
        indexador: "CDI",
        emissor: "Nu Financeira",
        quantidade: 1,
        precoMedio: 5000,
        valorAtualBrl: 5000,
        dataEntrada: "",
        dataVencimento: "2029-12-31",
      },
      {
        nome: "Petrobras PN",
        ticker: "PETR4",
        classe: "ACAO_BR",
        moedaOriginal: "BRL",
        cnpj: "",
        benchmark: "IBOV",
        indexador: "",
        emissor: "",
        quantidade: 0,
        precoMedio: 0,
        valorAtualBrl: 0,
        dataEntrada: "",
        dataVencimento: "",
      },
      {
        nome: "Maxi Renda Variavel FII",
        ticker: "MXRF11",
        classe: "FII",
        moedaOriginal: "BRL",
        cnpj: "",
        benchmark: "IFIX",
        indexador: "",
        emissor: "",
        quantidade: 0,
        precoMedio: 0,
        valorAtualBrl: 0,
        dataEntrada: "",
        dataVencimento: "",
      },
    ],
  },
  BTG_EQI: {
    carteiraNome: "Carteira BTG/EQI",
    descricao: "Alocacao manual de fundos e ETFs da conta BTG/EQI",
    perfil: "arrojado",
    instituicao: "BTG/EQI",
    conta: "Conta Investimentos",
    rows: [
      {
        nome: "Fundo BTG Credito",
        ticker: "BTG_CREDITO_FIC",
        classe: "FUNDO",
        subclasse: "FUNDO_RENDA_FIXA",
        moedaOriginal: "BRL",
        cnpj: "",
        benchmark: "CDI",
        indexador: "CDI",
        emissor: "",
        quantidade: 0,
        precoMedio: 0,
        valorAtualBrl: 0,
        dataEntrada: "",
        dataVencimento: "",
      },
      {
        nome: "SPDR S&P 500 ETF",
        ticker: "SPY",
        classe: "ETF_EUA",
        moedaOriginal: "USD",
        cnpj: "",
        benchmark: "S&P500",
        indexador: "",
        emissor: "",
        quantidade: 0,
        precoMedio: 0,
        valorAtualBrl: 0,
        dataEntrada: "",
        dataVencimento: "",
      },
    ],
  },
  NOMAD: {
    carteiraNome: "Carteira Nomad",
    descricao: "Alocacao internacional na corretora Nomad",
    perfil: "arrojado",
    instituicao: "Nomad",
    conta: "Conta Internacional",
    rows: [
      {
        nome: "Apple Inc.",
        ticker: "AAPL",
        classe: "ACAO_EUA",
        moedaOriginal: "USD",
        cnpj: "",
        benchmark: "NASDAQ",
        indexador: "",
        emissor: "",
        quantidade: 0,
        precoMedio: 0,
        valorAtualBrl: 0,
        dataEntrada: "",
        dataVencimento: "",
      },
      {
        nome: "SPDR S&P 500 ETF",
        ticker: "SPY",
        classe: "ETF_EUA",
        moedaOriginal: "USD",
        cnpj: "",
        benchmark: "S&P500",
        indexador: "",
        emissor: "",
        quantidade: 0,
        precoMedio: 0,
        valorAtualBrl: 0,
        dataEntrada: "",
        dataVencimento: "",
      },
      {
        nome: "Vanguard Real Estate ETF",
        ticker: "VNQ",
        classe: "REIT",
        moedaOriginal: "USD",
        cnpj: "",
        benchmark: "US REIT",
        indexador: "",
        emissor: "",
        quantidade: 0,
        precoMedio: 0,
        valorAtualBrl: 0,
        dataEntrada: "",
        dataVencimento: "",
      },
    ],
  },
  MERCADO_PAGO: {
    carteiraNome: "Carteira Mercado Pago",
    descricao: "Cripto e posicoes digitais via Mercado Pago",
    perfil: "arrojado",
    instituicao: "Mercado Pago",
    conta: "Conta Digital",
    rows: [
      {
        nome: "Bitcoin",
        ticker: "BTC",
        classe: "CRIPTO",
        subclasse: "CRIPTO_BASE",
        moedaOriginal: "USD",
        cnpj: "",
        benchmark: "BTC",
        indexador: "",
        emissor: "Mercado Pago",
        quantidade: 0,
        precoMedio: 0,
        valorAtualBrl: 0,
        dataEntrada: "",
        dataVencimento: "",
      },
      {
        nome: "Ethereum",
        ticker: "ETH",
        classe: "CRIPTO",
        subclasse: "CRIPTO_INFRAESTRUTURA",
        moedaOriginal: "USD",
        cnpj: "",
        benchmark: "ETH",
        indexador: "",
        emissor: "Mercado Pago",
        quantidade: 0,
        precoMedio: 0,
        valorAtualBrl: 0,
        dataEntrada: "",
        dataVencimento: "",
      },
    ],
  },
};

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function getSubclassesByClasse(classe: InvestmentRow["classe"]): SubclasseAtivo[] {
  if (classe === "RENDA_FIXA") return RF_SUBCLASSES;
  if (classe === "FUNDO") return FUND_SUBCLASSES;
  if (classe === "CRIPTO") return CRYPTO_SUBCLASSES;
  return [];
}

function getDefaultSubclasse(classe: InvestmentRow["classe"]): SubclasseAtivo {
  const subclasses = getSubclassesByClasse(classe);
  return subclasses[0] ?? "FUNDO_MULTIMERCADO";
}

function normalizeTicker(value: string): string {
  return value.trim().toUpperCase();
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

function toClasseAtivo(classe: CadastroClasse): ClasseAtivo {
  return classe;
}

function sortByNome<T extends { nome: string }>(items: T[]): T[] {
  return [...items].sort((left, right) => left.nome.localeCompare(right.nome, "pt-BR"));
}

function getApiErrorMessage(data: unknown, fallback: string): string {
  if (typeof data !== "object" || data === null) return fallback;
  const candidate = data as { message?: string; error?: string };
  return candidate.message || candidate.error || fallback;
}

export default function CadastroManualInvestimentosClient({
  clientes,
  instituicoes,
  contas,
  carteiras,
}: Props) {
  const [clientesState, setClientesState] = useState<ClienteOption[]>(clientes);
  const [instituicoesState, setInstituicoesState] = useState<InstituicaoOption[]>(instituicoes);
  const [contasState, setContasState] = useState<ContaOption[]>(contas);
  const [carteirasState, setCarteirasState] = useState<CarteiraOption[]>(carteiras);
  const [template, setTemplate] = useState<InstituicaoTemplate>("NUBANK");
  const [carteiraExistenteId, setCarteiraExistenteId] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [instituicaoId, setInstituicaoId] = useState("");
  const [contaReferenciaId, setContaReferenciaId] = useState("");
  const [nomeCarteira, setNomeCarteira] = useState(TEMPLATE_PRESETS.NUBANK.carteiraNome);
  const [descricao, setDescricao] = useState(TEMPLATE_PRESETS.NUBANK.descricao);
  const [perfil, setPerfil] = useState<PerfilCarteira>(TEMPLATE_PRESETS.NUBANK.perfil);
  const [instituicao, setInstituicao] = useState(TEMPLATE_PRESETS.NUBANK.instituicao);
  const [conta, setConta] = useState(TEMPLATE_PRESETS.NUBANK.conta);
  const [rows, setRows] = useState<InvestmentRow[]>(TEMPLATE_PRESETS.NUBANK.rows);
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });
  const [quickState, setQuickState] = useState<QuickEntityState | null>(null);
  const [creatingCliente, setCreatingCliente] = useState(false);
  const [creatingInstituicao, setCreatingInstituicao] = useState(false);
  const [creatingConta, setCreatingConta] = useState(false);
  const [clienteForm, setClienteForm] = useState({ nome: "", documento: "", email: "" });
  const [instituicaoForm, setInstituicaoForm] = useState({ nome: "", cnpj: "", tipo: "" });
  const [contaForm, setContaForm] = useState({
    clienteId: "",
    instituicaoId: "",
    numeroConta: "",
    apelido: "",
  });

  const contasFiltradas = useMemo(() => {
    return contasState.filter((item) => {
      const matchesCliente = !clienteId || item.clienteId === clienteId;
      const matchesInstituicao = !instituicaoId || item.instituicaoId === instituicaoId;
      return matchesCliente && matchesInstituicao;
    });
  }, [clienteId, contasState, instituicaoId]);

  const total = useMemo(() => {
    return rows.reduce((acc, row) => acc + (Number.isFinite(row.valorAtualBrl) ? row.valorAtualBrl : 0), 0);
  }, [rows]);

  function getContaDisplay(item: ContaOption): string {
    return item.apelido ? `${item.apelido} (${item.numeroConta})` : item.numeroConta;
  }

  async function parseJson<T>(response: Response): Promise<T | { message?: string; error?: string }> {
    return (await response.json()) as T | { message?: string; error?: string };
  }

  function applyTemplate(nextTemplate: InstituicaoTemplate): void {
    const preset = TEMPLATE_PRESETS[nextTemplate];
    setTemplate(nextTemplate);
    setCarteiraExistenteId("");
    setNomeCarteira(preset.carteiraNome);
    setDescricao(preset.descricao);
    setPerfil(preset.perfil);
    setInstituicao(preset.instituicao);
    setConta(preset.conta);
    setRows(preset.rows);
    setSubmitState({ status: "idle" });

    const matchedInstitution = instituicoesState.find((item) => normalizeText(item.nome) === normalizeText(preset.instituicao));
    setInstituicaoId(matchedInstitution?.id ?? "");
    if (matchedInstitution) {
      const matchedAccount = contasState.find(
        (item) =>
          (!clienteId || item.clienteId === clienteId) &&
          item.instituicaoId === matchedInstitution.id &&
          normalizeText(item.numeroConta) === normalizeText(preset.conta)
      );
      setContaReferenciaId(matchedAccount?.id ?? "");
    } else {
      setContaReferenciaId("");
    }
  }

  function updateRow(index: number, patch: Partial<InvestmentRow>): void {
    setRows((prev) => {
      const next = [...prev];
      const current = next[index];
      const merged = { ...current, ...patch };

      if (patch.classe) {
        const allowedSubclasses = getSubclassesByClasse(patch.classe);
        if (allowedSubclasses.length === 0) {
          merged.subclasse = undefined;
        } else if (!merged.subclasse || !allowedSubclasses.includes(merged.subclasse)) {
          merged.subclasse = getDefaultSubclasse(patch.classe);
        }
      }

      const quantidade = Number(merged.quantidade) || 0;
      const precoMedio = Number(merged.precoMedio) || 0;
      if (("quantidade" in patch || "precoMedio" in patch) && !("valorAtualBrl" in patch)) {
        merged.valorAtualBrl = Number((quantidade * precoMedio).toFixed(2));
      }

      next[index] = merged;
      return next;
    });
  }

  function addRow(tipo: InvestmentRow["classe"] = "FUNDO"): void {
    setRows((prev) => [
      ...prev,
      {
        nome: "",
        ticker: "",
        classe: tipo,
        subclasse: getSubclassesByClasse(tipo).length > 0 ? getDefaultSubclasse(tipo) : undefined,
        cnpj: "",
        moedaOriginal: tipo === "FUNDO" || tipo === "RENDA_FIXA" ? "BRL" : "USD",
        instituicaoLinha: "",
        contaLinha: "",
        benchmark: "",
        indexador: tipo === "RENDA_FIXA" ? "CDI" : "",
        emissor: "",
        quantidade: 0,
        precoMedio: 0,
        valorAtualBrl: 0,
        dataEntrada: "",
        dataVencimento: "",
      },
    ]);
  }

  function removeRow(index: number): void {
    setRows((prev) => prev.filter((_, rowIndex) => rowIndex !== index));
  }

  function handleSelectCarteira(id: string): void {
    setCarteiraExistenteId(id);
    setSubmitState({ status: "idle" });

    if (!id) {
      return;
    }

    const carteiraAtual = carteirasState.find((item) => item.id === id);
    if (!carteiraAtual) {
      return;
    }

    setNomeCarteira(carteiraAtual.nome);
    setDescricao(carteiraAtual.descricao ?? "");
    setPerfil(carteiraAtual.perfil ?? "moderado");
    setClienteId(carteiraAtual.clienteId ?? "");
    setContaReferenciaId(carteiraAtual.contaReferenciaId ?? "");

    const contaSelecionada = contasState.find((item) => item.id === carteiraAtual.contaReferenciaId);
    if (contaSelecionada) {
      setInstituicaoId(contaSelecionada.instituicaoId);
      setInstituicao(contaSelecionada.instituicaoNome);
      setConta(contaSelecionada.numeroConta);
      setContaForm((prev) => ({
        ...prev,
        clienteId: contaSelecionada.clienteId,
        instituicaoId: contaSelecionada.instituicaoId,
      }));
    }
  }

  function handleClienteChange(nextClienteId: string): void {
    setClienteId(nextClienteId);
    setCarteiraExistenteId("");

    if (contaReferenciaId) {
      const contaSelecionada = contasState.find((item) => item.id === contaReferenciaId && item.clienteId === nextClienteId);
      if (!contaSelecionada) {
        setContaReferenciaId("");
      }
    }

    setContaForm((prev) => ({ ...prev, clienteId: nextClienteId }));
  }

  function handleInstituicaoChange(nextInstituicaoId: string): void {
    setInstituicaoId(nextInstituicaoId);
    const item = instituicoesState.find((candidate) => candidate.id === nextInstituicaoId);
    setInstituicao(item?.nome ?? "");

    if (contaReferenciaId) {
      const contaSelecionada = contasState.find(
        (candidate) => candidate.id === contaReferenciaId && candidate.instituicaoId === nextInstituicaoId
      );
      if (!contaSelecionada) {
        setContaReferenciaId("");
      }
    }

    setContaForm((prev) => ({ ...prev, instituicaoId: nextInstituicaoId }));
  }

  function handleContaChange(nextContaId: string): void {
    setContaReferenciaId(nextContaId);
    const contaSelecionada = contasState.find((item) => item.id === nextContaId);
    if (!contaSelecionada) {
      return;
    }

    setClienteId(contaSelecionada.clienteId);
    setInstituicaoId(contaSelecionada.instituicaoId);
    setInstituicao(contaSelecionada.instituicaoNome);
    setConta(contaSelecionada.numeroConta);
    setContaForm((prev) => ({
      ...prev,
      clienteId: contaSelecionada.clienteId,
      instituicaoId: contaSelecionada.instituicaoId,
    }));
  }

  function resolveInstitutionId(name: string): string | undefined {
    return instituicoesState.find((item) => normalizeText(item.nome) === normalizeText(name))?.id;
  }

  function resolveContaLinha(instituicaoLinha: string, contaLinha: string): ContaOption | undefined {
    return contasState.find((item) => {
      const matchesCliente = !clienteId || item.clienteId === clienteId;
      return (
        matchesCliente &&
        normalizeText(item.instituicaoNome) === normalizeText(instituicaoLinha) &&
        normalizeText(item.numeroConta) === normalizeText(contaLinha)
      );
    });
  }

  function validate(): string | null {
    if (!nomeCarteira.trim()) return "Nome da carteira e obrigatorio.";
    if (!instituicao.trim()) return "Instituicao e obrigatoria.";
    if (!conta.trim()) return "Conta e obrigatoria.";

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row.nome.trim()) return `Linha ${i + 1}: nome do investimento e obrigatorio.`;
      if (row.valorAtualBrl < 0) return `Linha ${i + 1}: valor atual nao pode ser negativo.`;
      if (row.quantidade < 0) return `Linha ${i + 1}: quantidade nao pode ser negativa.`;
      if (row.precoMedio < 0) return `Linha ${i + 1}: preco medio nao pode ser negativo.`;
      if (
        ["ACAO_BR", "FII", "ETF_BR", "BDR", "ACAO_EUA", "ETF_EUA", "REIT", "CRIPTO"].includes(row.classe) &&
        !row.ticker.trim()
      ) {
        return `Linha ${i + 1}: ticker e obrigatorio para classes listadas e cripto.`;
      }
      if (row.classe === "RENDA_FIXA" && !row.dataVencimento) {
        return `Linha ${i + 1}: data de vencimento e obrigatoria para renda fixa.`;
      }
    }

    return null;
  }

  async function handleCreateCliente(): Promise<void> {
    if (!clienteForm.nome.trim()) {
      setQuickState({ type: "error", message: "Informe o nome do cliente para criar o cadastro rapido." });
      return;
    }

    setCreatingCliente(true);
    setQuickState(null);

    try {
      const response = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: clienteForm.nome.trim(),
          documento: clienteForm.documento.trim() || null,
          email: clienteForm.email.trim() || null,
        }),
      });

      const data = await parseJson<ClienteOption>(response);
      if (!response.ok || !("id" in data)) {
        throw new Error(getApiErrorMessage(data, "Falha ao criar cliente."));
      }

      const nextCliente: ClienteOption = {
        id: data.id,
        nome: data.nome,
        documento: data.documento,
      };

      setClientesState((prev) => sortByNome([...prev, nextCliente]));
      setClienteId(nextCliente.id);
      setContaForm((prev) => ({ ...prev, clienteId: nextCliente.id }));
      setClienteForm({ nome: "", documento: "", email: "" });
      setQuickState({ type: "success", message: `Cliente ${nextCliente.nome} criado com sucesso.` });
    } catch (error) {
      setQuickState({
        type: "error",
        message: error instanceof Error ? error.message : "Erro inesperado ao criar cliente.",
      });
    } finally {
      setCreatingCliente(false);
    }
  }

  async function handleCreateInstituicao(): Promise<void> {
    if (!instituicaoForm.nome.trim() || !instituicaoForm.cnpj.trim()) {
      setQuickState({ type: "error", message: "Informe nome e CNPJ para criar a instituicao." });
      return;
    }

    setCreatingInstituicao(true);
    setQuickState(null);

    try {
      const response = await fetch("/api/instituicoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: instituicaoForm.nome.trim(),
          cnpj: instituicaoForm.cnpj.trim(),
          tipo: instituicaoForm.tipo.trim() || null,
        }),
      });

      const data = await parseJson<InstituicaoOption>(response);
      if (!response.ok || !("id" in data)) {
        throw new Error(getApiErrorMessage(data, "Falha ao criar instituicao."));
      }

      const nextInstituicao: InstituicaoOption = {
        id: data.id,
        nome: data.nome,
      };

      setInstituicoesState((prev) => sortByNome([...prev, nextInstituicao]));
      setInstituicaoId(nextInstituicao.id);
      setInstituicao(nextInstituicao.nome);
      setContaForm((prev) => ({ ...prev, instituicaoId: nextInstituicao.id }));
      setInstituicaoForm({ nome: "", cnpj: "", tipo: "" });
      setQuickState({ type: "success", message: `Instituicao ${nextInstituicao.nome} criada com sucesso.` });
    } catch (error) {
      setQuickState({
        type: "error",
        message: error instanceof Error ? error.message : "Erro inesperado ao criar instituicao.",
      });
    } finally {
      setCreatingInstituicao(false);
    }
  }

  async function handleCreateConta(): Promise<void> {
    if (!contaForm.clienteId || !contaForm.instituicaoId || !contaForm.numeroConta.trim()) {
      setQuickState({ type: "error", message: "Selecione cliente, instituicao e numero da conta para criar a conta." });
      return;
    }

    setCreatingConta(true);
    setQuickState(null);

    try {
      const response = await fetch("/api/contas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteId: contaForm.clienteId,
          instituicaoId: contaForm.instituicaoId,
          numeroConta: contaForm.numeroConta.trim(),
          apelido: contaForm.apelido.trim() || null,
        }),
      });

      const data = await parseJson<{ id: string }>(response);
      if (!response.ok || !("id" in data)) {
        throw new Error(getApiErrorMessage(data, "Falha ao criar conta."));
      }

      const instituicaoSelecionada = instituicoesState.find((item) => item.id === contaForm.instituicaoId);
      const nextConta: ContaOption = {
        id: data.id,
        clienteId: contaForm.clienteId,
        instituicaoId: contaForm.instituicaoId,
        instituicaoNome: instituicaoSelecionada?.nome || instituicao,
        numeroConta: contaForm.numeroConta.trim(),
        apelido: contaForm.apelido.trim() || undefined,
      };

      setContasState((prev) =>
        [...prev, nextConta].sort((left, right) => {
          const institutionSort = left.instituicaoNome.localeCompare(right.instituicaoNome, "pt-BR");
          if (institutionSort !== 0) return institutionSort;
          return left.numeroConta.localeCompare(right.numeroConta, "pt-BR");
        })
      );
      setContaReferenciaId(nextConta.id);
      setClienteId(nextConta.clienteId);
      setInstituicaoId(nextConta.instituicaoId);
      setInstituicao(nextConta.instituicaoNome);
      setConta(nextConta.numeroConta);
      setContaForm((prev) => ({ ...prev, numeroConta: "", apelido: "" }));
      setQuickState({ type: "success", message: `Conta ${getContaDisplay(nextConta)} criada com sucesso.` });
    } catch (error) {
      setQuickState({
        type: "error",
        message: error instanceof Error ? error.message : "Erro inesperado ao criar conta.",
      });
    } finally {
      setCreatingConta(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const validationError = validate();
    if (validationError) {
      setSubmitState({ status: "error", message: validationError });
      return;
    }

    setSubmitState({ status: "loading" });

    try {
      const existingCarteira = carteirasState.find(
        (item) =>
          normalizeText(item.nome) === normalizeText(nomeCarteira) &&
          (!clienteId || item.clienteId === clienteId)
      );

      let carteiraId = carteiraExistenteId || existingCarteira?.id;
      if (!carteiraId) {
        const carteiraResponse = await fetch("/api/carteiras", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome: nomeCarteira.trim(),
            descricao: descricao.trim(),
            perfil,
            moedaBase: "BRL",
            clienteId: clienteId || undefined,
            contaReferenciaId: contaReferenciaId || undefined,
          }),
        });

        const carteiraData = (await carteiraResponse.json()) as { id?: string; error?: string };
        if (!carteiraResponse.ok || !carteiraData.id) {
          throw new Error(carteiraData.error || "Falha ao criar carteira.");
        }

        const createdCarteiraId = carteiraData.id;
        carteiraId = createdCarteiraId;
        setCarteirasState((prev) => [
          {
            id: createdCarteiraId,
            nome: nomeCarteira.trim(),
            descricao: descricao.trim() || undefined,
            perfil,
            clienteId: clienteId || undefined,
            contaReferenciaId: contaReferenciaId || undefined,
          },
          ...prev,
        ]);
      } else if (carteiraExistenteId) {
        const carteiraResponse = await fetch(`/api/carteiras/${carteiraExistenteId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome: nomeCarteira.trim(),
            descricao: descricao.trim(),
            perfil,
            clienteId: clienteId || null,
            contaReferenciaId: contaReferenciaId || null,
          }),
        });

        if (!carteiraResponse.ok) {
          const carteiraData = (await carteiraResponse.json()) as { error?: string };
          throw new Error(carteiraData.error || "Falha ao atualizar carteira selecionada.");
        }

        setCarteirasState((prev) =>
          prev.map((item) =>
            item.id === carteiraExistenteId
              ? {
                  ...item,
                  nome: nomeCarteira.trim(),
                  descricao: descricao.trim() || undefined,
                  perfil,
                  clienteId: clienteId || undefined,
                  contaReferenciaId: contaReferenciaId || undefined,
                }
              : item
          )
        );
      }

      let ativosCriados = 0;
      let ativosReutilizados = 0;
      let posicoesCriadas = 0;

      const ativosResponse = await fetch("/api/ativos");
      if (!ativosResponse.ok) {
        throw new Error("Falha ao carregar ativos existentes.");
      }
      const ativos = (await ativosResponse.json()) as AtivoApi[];

      for (const row of rows) {
        const classeAtivo = toClasseAtivo(row.classe);
        const normalizedTicker = normalizeTicker(row.ticker);
        const normalizedNome = normalizeText(row.nome);

        const existingAtivo = ativos.find((ativo) => {
          const sameTicker = normalizedTicker.length > 0 && normalizeTicker(ativo.ticker || "") === normalizedTicker;
          const sameNomeAndClasse = normalizeText(ativo.nome) === normalizedNome && ativo.classe === classeAtivo;
          return sameTicker || sameNomeAndClasse;
        });

        let ativoId = existingAtivo?.id;
        if (ativoId) {
          ativosReutilizados += 1;
        }

        if (!ativoId) {
          const metadata: Record<string, unknown> = {
            origem: "cadastro-manual-investimentos",
            emissor: row.emissor || undefined,
            cnpj: row.cnpj || undefined,
            instituicaoBase: instituicao.trim(),
          };

          const ativoPayload: Record<string, unknown> = {
            nome: row.nome.trim(),
            classe: classeAtivo,
            subclasse: row.subclasse,
            pais: row.moedaOriginal === "BRL" ? "BRA" : "USA",
            moeda: row.moedaOriginal,
            benchmark: row.benchmark || undefined,
            indexador: row.indexador || undefined,
            metadata,
          };

          if (row.ticker.trim()) {
            ativoPayload.ticker = row.ticker.trim();
          }

          const ativoResponse = await fetch("/api/ativos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(ativoPayload),
          });

          const ativoData = (await ativoResponse.json()) as { id?: string; error?: string };
          if (!ativoResponse.ok || !ativoData.id) {
            throw new Error(ativoData.error || `Falha ao criar ativo: ${row.nome}`);
          }

          ativoId = ativoData.id;
          ativosCriados += 1;
        }

        const valorAtual = row.valorAtualBrl > 0 ? row.valorAtualBrl : Number((row.quantidade * row.precoMedio).toFixed(2));
        const instituicaoLinha = (row.instituicaoLinha || instituicao).trim();
        const contaLinha = (row.contaLinha || conta).trim();
        const contaLinhaRelacionada = resolveContaLinha(instituicaoLinha, contaLinha);
        const instituicaoLinhaId =
          contaLinhaRelacionada?.instituicaoId ?? resolveInstitutionId(instituicaoLinha) ?? (instituicaoId || undefined);
        const clienteLinhaId = contaLinhaRelacionada?.clienteId ?? (clienteId || undefined);
        const contaLinhaId = contaLinhaRelacionada?.id ?? (contaReferenciaId || undefined);

        const posicaoResponse = await fetch("/api/posicoes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            carteiraId,
            ativoId,
            clienteId: clienteLinhaId,
            instituicaoId: instituicaoLinhaId,
            contaId: contaLinhaId,
            quantidade: row.quantidade,
            precoMedio: row.precoMedio,
            valorAtualBruto: valorAtual,
            valorAtualBrl: valorAtual,
            moedaOriginal: row.moedaOriginal,
            instituicao: instituicaoLinha,
            conta: contaLinha,
            dataEntrada: row.dataEntrada || undefined,
            dataVencimento: row.dataVencimento || undefined,
            origemDado: "MANUAL",
            importadoEm: new Date().toISOString(),
          }),
        });

        const posicaoData = (await posicaoResponse.json()) as { id?: string; error?: string };
        if (!posicaoResponse.ok || !posicaoData.id) {
          throw new Error(posicaoData.error || `Falha ao criar posicao: ${row.nome}`);
        }

        posicoesCriadas += 1;
      }

      setSubmitState({
        status: "success",
        carteiraNome: nomeCarteira.trim(),
        ativosCriados,
        ativosReutilizados,
        posicoesCriadas,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro inesperado ao cadastrar carteira.";
      setSubmitState({ status: "error", message });
    }
  }

  return (
    <div className="space-y-5">
      <section className="main-card space-y-3">
        <h1 className="text-2xl font-bold text-sky-300">Cadastro Manual de Investimentos</h1>
        <p className="text-slate-200">
          Alocacao manual por banco e carteira com suporte a fundos, renda fixa, acoes, FIIs, ETFs, internacional e cripto.
        </p>
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
          <span className="badge badge-primary">Reaproveita ativos por ticker ou nome e classe</span>
          <span className="badge badge-primary">Persiste cliente, conta e instituicao nas posicoes</span>
          <span className="badge badge-accent">Total previsto: {formatCurrency(total)}</span>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="space-y-4">
        <section className="panel grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="template-model" className="mb-1 block text-sm font-semibold text-slate-100">
              Modelo rapido
            </label>
            <div className="flex gap-2">
              <select
                id="template-model"
                value={template}
                onChange={(e) => setTemplate(e.target.value as InstituicaoTemplate)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
              >
                <option value="NUBANK">Nubank</option>
                <option value="BB">Banco do Brasil</option>
                <option value="BTG_EQI">BTG/EQI</option>
                <option value="NOMAD">Nomad</option>
                <option value="MERCADO_PAGO">Mercado Pago</option>
              </select>
              <button
                type="button"
                onClick={() => applyTemplate(template)}
                className="rounded-lg border border-sky-500/60 bg-sky-500/20 px-3 py-2 text-xs font-semibold text-sky-200 hover:bg-sky-500/30"
              >
                Aplicar
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="carteira-existente" className="mb-1 block text-sm font-semibold text-slate-100">
              Carteira existente
            </label>
            <select
              id="carteira-existente"
              value={carteiraExistenteId}
              onChange={(e) => handleSelectCarteira(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
            >
              <option value="">Criar ou localizar por nome</option>
              {carteirasState.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="cliente-relacional" className="mb-1 block text-sm font-semibold text-slate-100">
              Cliente
            </label>
            <select
              id="cliente-relacional"
              value={clienteId}
              onChange={(e) => handleClienteChange(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
            >
              <option value="">Sem vinculo explicito</option>
              {clientesState.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="instituicao-relacional" className="mb-1 block text-sm font-semibold text-slate-100">
              Instituicao de referencia
            </label>
            <select
              id="instituicao-relacional"
              value={instituicaoId}
              onChange={(e) => handleInstituicaoChange(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
            >
              <option value="">Sem vinculo explicito</option>
              {instituicoesState.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="conta-referencia" className="mb-1 block text-sm font-semibold text-slate-100">
              Conta de referencia
            </label>
            <select
              id="conta-referencia"
              value={contaReferenciaId}
              onChange={(e) => handleContaChange(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
            >
              <option value="">Sem vinculo explicito</option>
              {contasFiltradas.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.instituicaoNome} - {getContaDisplay(item)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="nome-carteira" className="mb-1 block text-sm font-semibold text-slate-100">
              Nome da carteira
            </label>
            <input
              id="nome-carteira"
              value={nomeCarteira}
              onChange={(e) => setNomeCarteira(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
              required
            />
          </div>

          <div>
            <label htmlFor="perfil-carteira" className="mb-1 block text-sm font-semibold text-slate-100">
              Perfil
            </label>
            <select
              id="perfil-carteira"
              value={perfil}
              onChange={(e) => setPerfil(e.target.value as PerfilCarteira)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
            >
              <option value="conservador">Conservador</option>
              <option value="moderado">Moderado</option>
              <option value="arrojado">Arrojado</option>
            </select>
          </div>

          <div>
            <label htmlFor="instituicao" className="mb-1 block text-sm font-semibold text-slate-100">
              Instituicao exibida
            </label>
            <input
              id="instituicao"
              value={instituicao}
              onChange={(e) => setInstituicao(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
              required
            />
          </div>

          <div>
            <label htmlFor="conta" className="mb-1 block text-sm font-semibold text-slate-100">
              Conta exibida
            </label>
            <input
              id="conta"
              value={conta}
              onChange={(e) => setConta(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
              required
            />
          </div>

          <div className="md:col-span-2 lg:col-span-4">
            <label htmlFor="descricao" className="mb-1 block text-sm font-semibold text-slate-100">
              Descricao
            </label>
            <input
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
            />
          </div>

          <div className="md:col-span-2 lg:col-span-4 rounded-xl border border-slate-700 bg-slate-900/60 p-3 text-sm text-slate-300">
            <p className="font-semibold text-slate-100">Modelo relacional</p>
            <p>
              Se cliente e conta forem selecionados, a carteira sera vinculada diretamente e as posicoes herdam os IDs corretos. Se uma linha usar outra conta, o sistema tenta resolver pelo par instituicao e conta informado na propria linha.
            </p>
          </div>
        </section>

        <section className="panel space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Cadastros rapidos</h2>
            <p className="text-sm text-slate-300">
              Crie cliente, instituicao e conta sem sair da tela. Os selects acima sao atualizados imediatamente.
            </p>
          </div>

          {quickState && (
            <div
              className={`rounded-lg border px-3 py-2 text-sm ${
                quickState.type === "success"
                  ? "border-emerald-500/40 bg-emerald-900/20 text-emerald-100"
                  : "border-red-500/40 bg-red-900/20 text-red-100"
              }`}
            >
              {quickState.message}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <QuickClienteForm
              value={clienteForm}
              onChange={(patch) => setClienteForm((prev) => ({ ...prev, ...patch }))}
              onCreate={handleCreateCliente}
              creating={creatingCliente}
            />
            <QuickInstituicaoForm
              value={instituicaoForm}
              onChange={(patch) => setInstituicaoForm((prev) => ({ ...prev, ...patch }))}
              onCreate={handleCreateInstituicao}
              creating={creatingInstituicao}
            />
            <QuickContaForm
              value={contaForm}
              clientes={clientesState.map((item) => ({ id: item.id, nome: item.nome }))}
              instituicoes={instituicoesState.map((item) => ({ id: item.id, nome: item.nome }))}
              onChange={(patch) => setContaForm((prev) => ({ ...prev, ...patch }))}
              onCreate={handleCreateConta}
              creating={creatingConta}
            />
          </div>
        </section>

        <section className="panel">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-slate-100">Investimentos da carteira</h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => addRow("FUNDO")}
                className="rounded-lg border border-sky-500/60 bg-sky-500/20 px-3 py-2 text-xs font-semibold text-sky-200 hover:bg-sky-500/30"
              >
                Adicionar fundo
              </button>
              <button
                type="button"
                onClick={() => addRow("RENDA_FIXA")}
                className="rounded-lg border border-amber-500/60 bg-amber-500/20 px-3 py-2 text-xs font-semibold text-amber-100 hover:bg-amber-500/30"
              >
                Adicionar CDB/RF
              </button>
              <button
                type="button"
                onClick={() => addRow("ACAO_BR")}
                className="rounded-lg border border-emerald-500/60 bg-emerald-500/20 px-3 py-2 text-xs font-semibold text-emerald-100 hover:bg-emerald-500/30"
              >
                Adicionar Acao/FII/ETF
              </button>
              <button
                type="button"
                onClick={() => addRow("ACAO_EUA")}
                className="rounded-lg border border-indigo-500/60 bg-indigo-500/20 px-3 py-2 text-xs font-semibold text-indigo-100 hover:bg-indigo-500/30"
              >
                Adicionar Internacional
              </button>
              <button
                type="button"
                onClick={() => addRow("CRIPTO")}
                className="rounded-lg border border-fuchsia-500/60 bg-fuchsia-500/20 px-3 py-2 text-xs font-semibold text-fuchsia-100 hover:bg-fuchsia-500/30"
              >
                Adicionar Cripto
              </button>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="modern-table" aria-label="Tabela de investimentos para cadastro manual">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Nome</th>
                  <th>Ticker</th>
                  <th>Subclasse</th>
                  <th>CNPJ</th>
                  <th>Moeda</th>
                  <th>Instituicao (linha)</th>
                  <th>Conta (linha)</th>
                  <th>Indexador</th>
                  <th>Emissor</th>
                  <th>Cotas/Qtd</th>
                  <th>Preco Medio</th>
                  <th>Valor Atual BRL</th>
                  <th>Entrada</th>
                  <th>Vencimento</th>
                  <th>Acao</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => {
                  const subclasseOptions = getSubclassesByClasse(row.classe);
                  const showSubclasse = subclasseOptions.length > 0;
                  return (
                    <tr key={`${row.nome}-${index}`}>
                      <td>
                        <select
                          value={row.classe}
                          onChange={(e) => updateRow(index, { classe: e.target.value as InvestmentRow["classe"] })}
                          className="w-28 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-white"
                        >
                          <option value="FUNDO">FUNDO</option>
                          <option value="RENDA_FIXA">RENDA_FIXA</option>
                          <option value="ACAO_BR">ACAO_BR</option>
                          <option value="FII">FII</option>
                          <option value="ETF_BR">ETF_BR</option>
                          <option value="BDR">BDR</option>
                          <option value="ACAO_EUA">ACAO_EUA</option>
                          <option value="ETF_EUA">ETF_EUA</option>
                          <option value="REIT">REIT</option>
                          <option value="CRIPTO">CRIPTO</option>
                        </select>
                      </td>
                      <td>
                        <input
                          value={row.nome}
                          onChange={(e) => updateRow(index, { nome: e.target.value })}
                          className="w-56 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-white"
                          required
                        />
                      </td>
                      <td>
                        <input
                          value={row.ticker}
                          onChange={(e) => updateRow(index, { ticker: e.target.value })}
                          className="w-40 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-white"
                        />
                      </td>
                      <td>
                        {showSubclasse ? (
                          <select
                            value={row.subclasse}
                            onChange={(e) => updateRow(index, { subclasse: e.target.value as SubclasseAtivo })}
                            className="w-48 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-white"
                          >
                            {subclasseOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-xs text-slate-400">N/A</span>
                        )}
                      </td>
                      <td>
                        <input
                          value={row.cnpj}
                          onChange={(e) => updateRow(index, { cnpj: e.target.value })}
                          className="w-40 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-white"
                        />
                      </td>
                      <td>
                        <select
                          value={row.moedaOriginal}
                          onChange={(e) => updateRow(index, { moedaOriginal: e.target.value as CurrencyCode })}
                          className="w-24 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-white"
                        >
                          <option value="BRL">BRL</option>
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                        </select>
                      </td>
                      <td>
                        <input
                          value={row.instituicaoLinha || ""}
                          onChange={(e) => updateRow(index, { instituicaoLinha: e.target.value })}
                          placeholder={instituicao}
                          className="w-40 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-white"
                        />
                      </td>
                      <td>
                        <input
                          value={row.contaLinha || ""}
                          onChange={(e) => updateRow(index, { contaLinha: e.target.value })}
                          placeholder={conta}
                          className="w-36 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-white"
                        />
                      </td>
                      <td>
                        <input
                          value={row.indexador}
                          onChange={(e) => updateRow(index, { indexador: e.target.value })}
                          className="w-28 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-white"
                        />
                      </td>
                      <td>
                        <input
                          value={row.emissor}
                          onChange={(e) => updateRow(index, { emissor: e.target.value })}
                          className="w-36 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-white"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.000001"
                          value={row.quantidade}
                          onChange={(e) => updateRow(index, { quantidade: Number(e.target.value) })}
                          className="w-28 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-white"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.000001"
                          value={row.precoMedio}
                          onChange={(e) => updateRow(index, { precoMedio: Number(e.target.value) })}
                          className="w-28 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-white"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          value={row.valorAtualBrl}
                          onChange={(e) => updateRow(index, { valorAtualBrl: Number(e.target.value) })}
                          className="w-32 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-white"
                        />
                      </td>
                      <td>
                        <input
                          type="date"
                          value={row.dataEntrada}
                          onChange={(e) => updateRow(index, { dataEntrada: e.target.value })}
                          className="w-36 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-white"
                        />
                      </td>
                      <td>
                        <input
                          type="date"
                          value={row.dataVencimento}
                          onChange={(e) => updateRow(index, { dataVencimento: e.target.value })}
                          className="w-36 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-white"
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => removeRow(index)}
                          className="rounded border border-red-500/50 bg-red-500/20 px-2 py-1 text-xs font-semibold text-red-200 hover:bg-red-500/30"
                          aria-label={`Remover investimento ${row.nome || index + 1}`}
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-slate-300">
            <p>Linhas: {rows.length}</p>
            <p>Total atual: {formatCurrency(total)}</p>
            <p>Cliente vinculado: {clientesState.find((item) => item.id === clienteId)?.nome || "nao definido"}</p>
          </div>
          <button
            type="submit"
            disabled={submitState.status === "loading"}
            className="rounded-lg bg-sky-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-600"
          >
            {submitState.status === "loading" ? "Cadastrando..." : "Salvar carteira no banco"}
          </button>
        </section>
      </form>

      {submitState.status === "success" && (
        <section className="rounded-xl border border-emerald-500/40 bg-emerald-900/20 p-4 text-sm text-emerald-100">
          <p className="font-semibold">Cadastro concluido com sucesso.</p>
          <p>
            Carteira: {submitState.carteiraNome} | Ativos criados: {submitState.ativosCriados} | Ativos reutilizados:{" "}
            {submitState.ativosReutilizados} | Posicoes criadas: {submitState.posicoesCriadas}
          </p>
        </section>
      )}

      {submitState.status === "error" && (
        <section className="rounded-xl border border-red-500/40 bg-red-900/20 p-4 text-sm text-red-100">
          <p className="font-semibold">Nao foi possivel concluir o cadastro.</p>
          <p>{submitState.message}</p>
        </section>
      )}
    </div>
  );
}
