import { ChequeReminder, ChequeReminderStatus, ChequeReminderType } from '../types';

export type ChequeUrgency = 'overdue' | 'today' | 'tomorrow' | 'three_days' | 'seven_days' | 'none';

const closedStatuses: ChequeReminderStatus[] = ['paye', 'depose', 'encaisse', 'annule', 'rejete'];

const startOfDay = (date: Date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

export const formatMad = (amount: number) =>
  new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD',
    maximumFractionDigits: 2
  }).format(amount || 0);

export const formatDateFr = (date?: string | null) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('fr-FR');
};

export const isChequeClosed = (cheque: Pick<ChequeReminder, 'statut'>) =>
  closedStatuses.includes(cheque.statut);

export const getDaysUntilDue = (dateEcheance: string, today = new Date()) => {
  const due = startOfDay(new Date(dateEcheance));
  const base = startOfDay(today);
  return Math.round((due.getTime() - base.getTime()) / (24 * 60 * 60 * 1000));
};

export const getDaysLabel = (cheque: ChequeReminder) => {
  if (isChequeClosed(cheque)) return 'Traité';
  const days = getDaysUntilDue(cheque.dateEcheance);
  if (days === 0) return "Aujourd'hui";
  if (days > 0) return `Dans ${days} jour${days > 1 ? 's' : ''}`;
  return `En retard de ${Math.abs(days)} jour${Math.abs(days) > 1 ? 's' : ''}`;
};

export const getUrgency = (cheque: ChequeReminder): ChequeUrgency => {
  if (isChequeClosed(cheque)) return 'none';
  const days = getDaysUntilDue(cheque.dateEcheance);
  if (days < 0) return 'overdue';
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (days <= 3) return 'three_days';
  if (days <= 7) return 'seven_days';
  return 'none';
};

export const getUrgencyRank = (urgency: ChequeUrgency) => {
  const ranks: Record<ChequeUrgency, number> = {
    overdue: 1,
    today: 2,
    tomorrow: 3,
    three_days: 4,
    seven_days: 5,
    none: 99
  };
  return ranks[urgency];
};

export const sortChequeAlerts = (cheques: ChequeReminder[]) =>
  [...cheques]
    .filter((cheque) => getUrgency(cheque) !== 'none')
    .sort((a, b) => {
      const urgencyDiff = getUrgencyRank(getUrgency(a)) - getUrgencyRank(getUrgency(b));
      if (urgencyDiff !== 0) return urgencyDiff;
      return new Date(a.dateEcheance).getTime() - new Date(b.dateEcheance).getTime();
    });

export const getChequePartyName = (cheque: ChequeReminder) =>
  cheque.type === 'fournisseur' ? cheque.fournisseurNom || 'Fournisseur' : cheque.clientNom || 'Client';

export const getAlertMessage = (cheque: ChequeReminder) => {
  const days = getDaysUntilDue(cheque.dateEcheance);
  const party = getChequePartyName(cheque);
  const amount = formatMad(cheque.montant);
  const direction = cheque.type === 'fournisseur'
    ? `fournisseur n°${cheque.numeroCheque} de ${amount} pour ${party} doit être payé`
    : `client n°${cheque.numeroCheque} de ${amount} reçu de ${party} doit être déposé`;

  if (days < 0) {
    return `Urgent : le chèque ${cheque.type} n°${cheque.numeroCheque} de ${amount} est en retard de ${Math.abs(days)} jour${Math.abs(days) > 1 ? 's' : ''}.`;
  }
  if (days === 0) return `Attention : le chèque ${direction} aujourd'hui.`;
  if (days === 1) return `Rappel : le chèque ${direction} demain.`;
  return `Rappel : le chèque ${direction} dans ${days} jours.`;
};

export const getStatusLabel = (status: ChequeReminderStatus) => {
  const labels: Record<ChequeReminderStatus, string> = {
    a_venir: 'À venir',
    paye: 'Payé / débité',
    annule: 'Annulé',
    rejete: 'Rejeté',
    a_deposer: 'À déposer',
    depose: 'Déposé',
    encaisse: 'Encaissé'
  };
  return labels[status];
};

export const getTypeLabel = (type: ChequeReminderType) =>
  type === 'fournisseur' ? 'Chèque fournisseur' : 'Chèque client';

export const calculateChequeStats = (cheques: ChequeReminder[]) => {
  const active = cheques.filter((cheque) => !isChequeClosed(cheque));
  return {
    totalFournisseursAPayer: active
      .filter((cheque) => cheque.type === 'fournisseur')
      .reduce((sum, cheque) => sum + cheque.montant, 0),
    totalClientsAEncaisser: active
      .filter((cheque) => cheque.type === 'client')
      .reduce((sum, cheque) => sum + cheque.montant, 0),
    echeanceAujourdhui: active.filter((cheque) => getDaysUntilDue(cheque.dateEcheance) === 0).length,
    enRetard: active.filter((cheque) => getDaysUntilDue(cheque.dateEcheance) < 0).length,
    aPayer7Jours: active
      .filter((cheque) => cheque.type === 'fournisseur')
      .filter((cheque) => {
        const days = getDaysUntilDue(cheque.dateEcheance);
        return days >= 0 && days <= 7;
      })
      .reduce((sum, cheque) => sum + cheque.montant, 0),
    aEncaisser7Jours: active
      .filter((cheque) => cheque.type === 'client')
      .filter((cheque) => {
        const days = getDaysUntilDue(cheque.dateEcheance);
        return days >= 0 && days <= 7;
      })
      .reduce((sum, cheque) => sum + cheque.montant, 0)
  };
};
