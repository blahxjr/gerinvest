"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

type Option = { id: string; nome: string };

export default function NovoAtivoPage() {
  const router = useRouter();

  const [tiposInvestimento, setTiposInvestimento] = useState<Option[]>([]);
  const [tipoInvestimentoId, setTipoInvestimentoId] = useState("");

  const [codigoNegociacao, setCodigoNegociacao] = useState("");
  const [nomeProduto, setNomeProduto] = useState("");
  const [tipoPapel, setTipoPapel] = useState("");
  const [emissor, setEmissor] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTipos() {
      try {
        const res = await fetch("/api/tipos-investimento");
        const data = await res.json();

        if (!res.ok) {
          const message = data?.message || "Erro ao carregar tipos de investimento.";
          throw new Error(message);
        }

        if (!Array.isArray(data)) {
          throw new Error("Formato de lista inválido para tipos de investimento.");
        }

        setTiposInvestimento(data);
      } catch (err: unknown) {
        console.error(err);
        const message =
          err && typeof err === "object" && err !== null && "message" in err
            ? (err as Error).message
            : "Erro ao carregar tipos de investimento.";
        setError(message);
      }
    }

    loadTipos();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!codigoNegociacao.trim() || !nomeProduto.trim()) {
      setError("Preencha código de negociação e nome do produto.");
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await fetch("/api/ativos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigoNegociacao: codigoNegociacao.trim(),
          nomeProduto: nomeProduto.trim(),
          tipoPapel: tipoPapel.trim() || null,
          emissor: emissor.trim() || null,
          tipoInvestimentoId: tipoInvestimentoId || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Erro ao salvar ativo.");
      }

      router.push("/ativos");
      router.refresh();
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && err !== null && "message" in err
          ? (err as Error).message
          : "Erro ao salvar ativo.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="main-card" style={{ maxWidth: "840px" }}>
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-sky-300">Novo ativo</h1>
        <p className="text-slate-300">Cadastre um ativo financeiro para uso nas posições.</p>
      </div>

      <div className="panel">
        {error && (
          <div
            style={{
              marginBottom: "16px",
              padding: "10px 12px",
              borderRadius: "10px",
              background: "#fef2f2",
              color: "#b91c1c",
              fontSize: "0.875rem",
              border: "1px solid #fecaca",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px 20px",
            }}
          >
            <div>
              <label
                htmlFor="codigo"
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontWeight: 500,
                  fontSize: "0.9rem",
                }}
              >
                Código de negociação *
              </label>
              <input
                id="codigo"
                type="text"
                value={codigoNegociacao}
                onChange={(e) =>
                  setCodigoNegociacao(e.target.value.toUpperCase())
                }
                style={{
                  width: "100%",
                  padding: "9px 11px",
                  borderRadius: "10px",
                  border: "1px solid #d1d5db",
                  fontSize: "0.9rem",
                }}
              />
            </div>

            <div>
              <label
                htmlFor="nomeProduto"
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontWeight: 500,
                  fontSize: "0.9rem",
                }}
              >
                Nome do produto *
              </label>
              <input
                id="nomeProduto"
                type="text"
                value={nomeProduto}
                onChange={(e) => setNomeProduto(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 11px",
                  borderRadius: "10px",
                  border: "1px solid #d1d5db",
                  fontSize: "0.9rem",
                }}
              />
            </div>

            <div>
              <label
                htmlFor="tipoInvestimento"
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontWeight: 500,
                  fontSize: "0.9rem",
                }}
              >
                Tipo de investimento
              </label>
              <select
                id="tipoInvestimento"
                value={tipoInvestimentoId}
                onChange={(e) => setTipoInvestimentoId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 11px",
                  borderRadius: "10px",
                  border: "1px solid #d1d5db",
                  fontSize: "0.9rem",
                  background: "#fff",
                }}
              >
                <option value="">Selecione</option>
                {tiposInvestimento.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="tipoPapel"
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontWeight: 500,
                  fontSize: "0.9rem",
                }}
              >
                Tipo de papel
              </label>
              <input
                id="tipoPapel"
                type="text"
                value={tipoPapel}
                onChange={(e) => setTipoPapel(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 11px",
                  borderRadius: "10px",
                  border: "1px solid #d1d5db",
                  fontSize: "0.9rem",
                }}
              />
            </div>

            <div style={{ gridColumn: "1 / span 2" }}>
              <label
                htmlFor="emissor"
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontWeight: 500,
                  fontSize: "0.9rem",
                }}
              >
                Emissor
              </label>
              <input
                id="emissor"
                type="text"
                value={emissor}
                onChange={(e) => setEmissor(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 11px",
                  borderRadius: "10px",
                  border: "1px solid #d1d5db",
                  fontSize: "0.9rem",
                }}
              />
            </div>
          </div>

          <div
            style={{
              marginTop: "24px",
              display: "flex",
              justifyContent: "flex-end",
              gap: "8px",
            }}
          >
            <button
              type="button"
              onClick={() => router.push("/ativos")}
              style={{
                padding: "8px 16px",
                borderRadius: "999px",
                border: "1px solid #d1d5db",
                background: "#f9fafb",
                color: "#111827",
                fontWeight: 500,
                fontSize: "0.9rem",
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: "8px 18px",
                borderRadius: "999px",
                border: "none",
                background: isSubmitting ? "#9ca3af" : "#2563eb",
                color: "#fff",
                fontWeight: 600,
                fontSize: "0.9rem",
                cursor: isSubmitting ? "default" : "pointer",
                boxShadow: "0 8px 20px rgba(37, 99, 235, 0.35)",
              }}
            >
              {isSubmitting ? "Salvando..." : "Salvar ativo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}