import { useState } from 'react';
import { Search, X, Check, GitMerge, Minus, EyeOff, Star } from 'lucide-react';
import type { SimilarityGroup, SimilarityDecision } from '../services/similarAddressService';

type GroupDecision = 'unify' | 'keep' | 'ignore';

interface GroupState {
  decision: GroupDecision;
  selectedRowIndices: number[];
}

interface SimilarAddressesModalProps {
  groups: SimilarityGroup[];
  onApply: (decisions: SimilarityDecision[]) => void;
  onClose: () => void;
}

export function SimilarAddressesModal({
  groups,
  onApply,
  onClose,
}: SimilarAddressesModalProps) {
  const [states, setStates] = useState<Record<string, GroupState>>(() => {
    const init: Record<string, GroupState> = {};
    for (const g of groups) {
      init[g.id] = { decision: 'ignore', selectedRowIndices: [] };
    }
    return init;
  });

  const toggleMember = (groupId: string, rowIndex: number) => {
    setStates((prev) => {
      const cur = prev[groupId];
      const isSelected = cur.selectedRowIndices.includes(rowIndex);
      let newSelected: number[];

      if (isSelected) {
        newSelected = cur.selectedRowIndices.filter((idx) => idx !== rowIndex);
      } else {
        newSelected = [...cur.selectedRowIndices, rowIndex];
      }

      const decision: GroupDecision =
        newSelected.length >= 2 ? 'unify' : cur.decision === 'unify' ? 'ignore' : cur.decision;

      return { ...prev, [groupId]: { decision, selectedRowIndices: newSelected } };
    });
  };

  const setDecision = (groupId: string, decision: GroupDecision) => {
    setStates((prev) => ({ ...prev, [groupId]: { ...prev[groupId], decision } }));
  };

  const handleApply = () => {
    const decisions: SimilarityDecision[] = [];
    for (const g of groups) {
      const st = states[g.id];
      if (st?.decision === 'unify' && st.selectedRowIndices.length >= 2) {
        const principalMember = g.members.find(
          (m) => m.rowIndex === st.selectedRowIndices[0],
        );
        if (principalMember) {
          decisions.push({
            groupRowIndex: g.members[0].rowIndex,
            selectedRowIndices: st.selectedRowIndices,
            principalAddress: principalMember.originalAddress,
          });
        }
      }
    }
    onApply(decisions);
  };

  const pendingCount = groups.filter((g) => states[g.id]?.decision === 'ignore').length;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center">
      <div className="flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-3xl bg-white dark:bg-slate-800 sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-900/30">
              <Search className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Endereços semelhantes
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {groups.length} {groups.length === 1 ? 'grupo' : 'grupos'} para revisar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
            Selecione os pedidos que pertencem ao mesmo endereço. O primeiro selecionado será o endereço principal.
          </p>
          <div className="space-y-4">
            {groups.map((group, gi) => {
              const st = states[group.id] ?? { decision: 'ignore' as GroupDecision, selectedRowIndices: [] };
              const canUnify = st.selectedRowIndices.length >= 2;
              return (
                <div
                  key={group.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/40"
                >
                  <div className="flex items-center gap-2 px-4 pt-3.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                      {gi + 1}
                    </span>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Esses pedidos pertencem ao mesmo endereço?
                    </p>
                  </div>

                  <div className="mt-2.5 space-y-1.5 px-4">
                    {group.members.map((member) => {
                      const isSelected = st.selectedRowIndices.includes(member.rowIndex);
                      const isPrincipal = isSelected && st.selectedRowIndices[0] === member.rowIndex;
                      const label = member.complement
                        ? `${member.originalAddress} (${member.complement})`
                        : member.originalAddress;
                      return (
                        <button
                          key={member.rowIndex}
                          onClick={() => toggleMember(group.id, member.rowIndex)}
                          className={`flex w-full items-start gap-2.5 rounded-xl border p-2.5 text-left transition-colors ${
                            isPrincipal
                              ? 'border-brand-500 bg-brand-50 dark:border-brand-400 dark:bg-brand-900/20'
                              : isSelected
                                ? 'border-brand-300 bg-brand-50/50 dark:border-brand-700 dark:bg-brand-900/10'
                                : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-slate-500'
                          }`}
                        >
                          <span
                            className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                              isSelected
                                ? 'border-brand-600 bg-brand-600 dark:border-brand-400 dark:bg-brand-400'
                                : 'border-slate-300 dark:border-slate-600'
                            }`}
                          >
                            {isSelected && <Check className="h-3 w-3 text-white" />}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              {isPrincipal && (
                                <span className="inline-flex items-center gap-0.5 rounded-full bg-brand-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                                  <Star className="h-2.5 w-2.5" />
                                  PRINCIPAL
                                </span>
                              )}
                              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                {label}
                              </p>
                            </div>
                            <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
                              {member.spxTn && `SPX: ${member.spxTn}`}
                              {member.spxTn && member.sequence && ' · '}
                              {member.sequence && `Seq: ${member.sequence}`}
                              {member.cep && ` · CEP: ${member.cep}`}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex gap-1.5 px-4 pb-3.5 pt-3">
                    <button
                      onClick={() => setDecision(group.id, 'unify')}
                      disabled={!canUnify}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold transition-colors ${
                        st.decision === 'unify' && canUnify
                          ? 'bg-brand-600 text-white'
                          : canUnify
                            ? 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                            : 'cursor-not-allowed bg-white text-slate-300 dark:bg-slate-800 dark:text-slate-600'
                      }`}
                    >
                      <GitMerge className="h-3.5 w-3.5" />
                      Unificar
                    </button>
                    <button
                      onClick={() => setDecision(group.id, 'keep')}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold transition-colors ${
                        st.decision === 'keep'
                          ? 'bg-slate-700 text-white dark:bg-slate-600'
                          : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                      }`}
                    >
                      <Minus className="h-3.5 w-3.5" />
                      Manter separados
                    </button>
                    <button
                      onClick={() => setDecision(group.id, 'ignore')}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold transition-colors ${
                        st.decision === 'ignore'
                          ? 'bg-slate-300 text-slate-700 dark:bg-slate-600 dark:text-slate-200'
                          : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                      }`}
                    >
                      <EyeOff className="h-3.5 w-3.5" />
                      Ignorar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-slate-100 px-5 py-4 dark:border-slate-700">
          {pendingCount > 0 && (
            <p className="mb-2.5 text-center text-xs text-slate-400 dark:text-slate-500">
              {pendingCount} {pendingCount === 1 ? 'grupo sem decisão' : 'grupos sem decisão'} (serão ignorados)
            </p>
          )}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex flex-1 items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100 active:scale-[0.98] dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
            >
              Cancelar
            </button>
            <button
              onClick={handleApply}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-700 active:scale-[0.98]"
            >
              <Check className="h-4 w-4" />
              Aplicar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
