"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

type Option = { id: string; nome: string };

export default function NovaContaPage() {
  const router = useRouter();

  const [clientes, setClientes] = useState<Option[]>([]);
  const [instituicoes, setInstituicoes] = useState<Option[]>([]);

  const [clienteId, setClienteId] = useState("");
  const [instituicaoId, setInstituicaoId] = useState("");
  const [numeroConta, setNumeroConta] = useState("");
  const [apelido, setApelido] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [clientesRes, instRes] = await Promise.all([
          fetch("/api/clientes"),
          fetch("/api/instituicoes"),
        ]);

        const clientesData = await clientesRes.json();
        const instData = await instRes.json();

        setClientes(clientesData);
        setInstituicoes(instData);
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar clientes e instituições.");
      }
    }

    loadData();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!clienteId || !instituicaoId || !numeroConta.trim()) {
      setError("Preencha cliente, instituição e número da conta.");
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await fetch("/api/contas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteId,
          instituicaoId,
          numeroConta: numeroConta.trim(),
          apelido: apelido.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Erro ao salvar conta.");
      }

      router.push("/contas");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Erro ao salvar conta.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: "840px" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>Nova conta</h1>
      <p style={{ marginTop: "4px", color: "#6b7280" }}>
        Vincule a conta a um cliente e a uma instituição.
      </p>

      <div
        style={{
          marginTop: "24px",
          background: "#ffffff",
          borderRadius: "16px",
          padding: "20px 24px",
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
          border: "1px solid #e5e7eb",
        }}
      >
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
                htmlFor="cliente"
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontWeight: 500,
                  fontSize: "0.9rem",
                }}
              >
                Cliente *
              </label>
              <select
                id="cliente"
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 11px",
                  borderRadius: "10px",
                  border: "1px solid #d1d5db",
                  fontSize: "0.9rem",
                  background: "#fff",
                }}
              >
                <option value="">Selecione um cliente</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="instituicao"
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontWeight: 500,
                  fontSize: "0.9rem",
                }}
              >
                Instituição *
              </label>
              <select
                id="instituicao"
                value={instituicaoId}
                onChange={(e) => setInstituicaoId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 11px",
                  borderRadius: "10px",
                  border: "1px solid #d1d5db",
                  fontSize: "0.9rem",
                  background: "#fff",
                }}
              >
                <option value="">Selecione uma instituição</option>
                {instituicoes.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="numeroConta"
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontWeight: 500,
                  fontSize: "0.9rem",
                }}
              >
                Número da conta *
              </label>
              <input
                id="numeroConta"
                type="text"
                value={numeroConta}
                onChange={(e) => setNumeroConta(e.target.value)}
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
                htmlFor="apelido"
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontWeight: 500,
                  fontSize: "0.9rem",
                }}
              >
                Apelido
              </label>
              <input
                id="apelido"
                type="text"
                value={apelido}
                onChange={(e) => setApelido(e.target.value)}
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
              onClick={() => router.push("/contas")}
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
              {isSubmitting ? "Salvando..." : "Salvar conta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}