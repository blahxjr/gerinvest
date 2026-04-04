'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Provento, ProventoInput, TIPOS_PROVENTO, TIPO_PROVENTO_LABELS, proventoSchema } from '@/core/domain/provento';
import { formatBRL } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/ui/components/ui/dialog';
import { Button } from '@/ui/components/ui/button';
import { Input } from '@/ui/components/ui/input';
import { Label } from '@/ui/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/components/ui/select';
import { Form, FormField, FormItem, FormLabel, FormMessage, FormControl } from '@/ui/components/ui/form';

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initial?: Provento | null;
}

export function ProventoFormModal({ open, onClose, onSaved, initial }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<ProventoInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(proventoSchema) as any,
    defaultValues: {
      tipo: initial?.tipo ?? 'DIVIDENDO',
      ticker: initial?.ticker ?? '',
      descricao: initial?.descricao ?? '',
      valorBruto: initial?.valorBruto ?? 0,
      irRetido: initial?.irRetido ?? 0,
      impostoIncidente: initial?.impostoIncidente ?? 0,
      dataPagamento: initial?.dataPagamento ?? new Date().toISOString().substring(0, 10),
      competencia: initial?.competencia ?? new Date().toISOString().substring(0, 7),
      observacao: initial?.observacao ?? '',
    },
  });

  function onSubmit(data: ProventoInput) {
    setError(null);
    startTransition(async () => {
      const url = initial ? `/api/proventos/${initial.id}` : '/api/proventos';
      const method = initial ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Erro desconhecido' }));
        setError(typeof err.error === 'string' ? err.error : 'Erro ao salvar');
        return;
      }

      onSaved();
      onClose();
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-slate-900 border-slate-700 text-slate-100 max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? 'Editar Provento' : 'Novo Provento'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Tipo */}
            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-slate-800 border-slate-600">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      {TIPOS_PROVENTO.map((t) => (
                        <SelectItem key={t} value={t} className="text-slate-100 focus:bg-slate-700">
                          {TIPO_PROVENTO_LABELS[t]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Ticker + Data Pagamento */}
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="ticker"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ticker</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ''}
                        placeholder="PETR4"
                        className="bg-slate-800 border-slate-600 uppercase"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dataPagamento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data Pagamento</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" className="bg-slate-800 border-slate-600" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Valor bruto + IR retido */}
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="valorBruto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Bruto (R$)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        min="0"
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        className="bg-slate-800 border-slate-600"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="irRetido"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IR Retido (R$)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        min="0"
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        className="bg-slate-800 border-slate-600"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* IR DARF + Competência */}
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="impostoIncidente"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IR a Recolher/DARF (R$)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        min="0"
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        className="bg-slate-800 border-slate-600"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="competencia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Competência</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ''}
                        type="month"
                        className="bg-slate-800 border-slate-600"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Observação */}
            <FormField
              control={form.control}
              name="observacao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observação</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ''}
                      placeholder="Opcional"
                      className="bg-slate-800 border-slate-600"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <p className="text-sm text-rose-400 bg-rose-900/20 rounded px-3 py-2" role="alert">
                {error}
              </p>
            )}

            <DialogFooter className="gap-2">
              <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending} className="bg-sky-600 hover:bg-sky-500">
                {isPending ? 'Salvando…' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
