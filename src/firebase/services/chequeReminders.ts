import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where
} from 'firebase/firestore';
import { db } from '../config';
import { ChequeHistoryEntry, ChequeReminder, ChequeReminderInput, ChequeReminderStatus, User } from '../../types';
import { getNextId, initializeCollections, findDocByCustomId } from '../services';

const chequeRemindersCollection = collection(db, 'chequeReminders');
export const DEFAULT_ENTREPRISE_ID = 'comagal-energy';

export const getEntrepriseId = (user?: User | null) => user?.entrepriseId || DEFAULT_ENTREPRISE_ID;

const userLabel = (user?: User | null) => user?.name || user?.email || 'Administrateur';

const buildHistoryEntry = (user: User | null, action: string, details?: string): ChequeHistoryEntry => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  date: new Date().toISOString(),
  userId: user?.id || 'system',
  userName: userLabel(user),
  action,
  details
});

export async function getChequeReminders(entrepriseId: string): Promise<ChequeReminder[]> {
  try {
    await initializeCollections();
    const q = query(chequeRemindersCollection, where('entrepriseId', '==', entrepriseId));
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map((document) => ({
        id: document.data().id || document.id,
        ...document.data(),
        history: document.data().history || []
      } as ChequeReminder))
      .sort((a, b) => new Date(a.dateEcheance).getTime() - new Date(b.dateEcheance).getTime());
  } catch (error) {
    console.error('Error getting cheque reminders:', error);
    throw error;
  }
}

export async function addChequeReminder(
  entrepriseId: string,
  input: ChequeReminderInput,
  user: User | null
): Promise<ChequeReminder> {
  try {
    await initializeCollections();
    const nextId = await getNextId('chequeReminders');
    const now = new Date().toISOString();
    const newCheque: ChequeReminder = {
      id: `cheque-${nextId}`,
      entrepriseId,
      type: input.type,
      fournisseurId: input.type === 'fournisseur' ? input.fournisseurId || null : null,
      fournisseurNom: input.type === 'fournisseur' ? input.fournisseurNom || null : null,
      clientId: input.type === 'client' ? input.clientId || null : null,
      clientNom: input.type === 'client' ? input.clientNom || null : null,
      numeroCheque: input.numeroCheque.trim(),
      banque: input.banque.trim(),
      montant: Number(input.montant),
      dateEmission: input.type === 'fournisseur' ? input.dateEmission || null : null,
      dateReception: input.type === 'client' ? input.dateReception || null : null,
      dateEcheance: input.dateEcheance,
      dateTraitementReelle: input.dateTraitementReelle || null,
      reference: input.reference?.trim() || null,
      notes: input.notes?.trim() || null,
      statut: input.statut,
      history: [buildHistoryEntry(user, 'Création du chèque', `Statut initial : ${input.statut}`)],
      createdAt: now,
      updatedAt: now,
      createdBy: user?.id || 'system',
      updatedBy: null
    };

    await addDoc(chequeRemindersCollection, newCheque);
    return newCheque;
  } catch (error) {
    console.error('Error adding cheque reminder:', error);
    throw error;
  }
}

export async function updateChequeReminder(
  entrepriseId: string,
  id: string,
  updates: Partial<ChequeReminderInput>,
  user: User | null,
  details = 'Modification des informations du chèque'
): Promise<void> {
  try {
    const existing = await findDocByCustomId(chequeRemindersCollection, id);
    if (!existing) throw new Error('Chèque introuvable');
    if (existing.data.entrepriseId !== entrepriseId) throw new Error('Accès refusé');

    const currentHistory = (existing.data.history || []) as ChequeHistoryEntry[];
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    );

    await updateDoc(doc(chequeRemindersCollection, existing.id), {
      ...cleanUpdates,
      updatedAt: new Date().toISOString(),
      updatedBy: user?.id || null,
      history: [...currentHistory, buildHistoryEntry(user, 'Modification', details)]
    });
  } catch (error) {
    console.error('Error updating cheque reminder:', error);
    throw error;
  }
}

export async function updateChequeStatus(
  entrepriseId: string,
  id: string,
  statut: ChequeReminderStatus,
  dateTraitementReelle: string | null,
  user: User | null
): Promise<void> {
  await updateChequeReminder(
    entrepriseId,
    id,
    { statut, dateTraitementReelle },
    user,
    `Changement de statut vers ${statut}${dateTraitementReelle ? `, date réelle : ${dateTraitementReelle}` : ''}`
  );
}

export async function deleteChequeReminder(entrepriseId: string, id: string): Promise<void> {
  try {
    const existing = await findDocByCustomId(chequeRemindersCollection, id);
    if (!existing) throw new Error('Chèque introuvable');
    if (existing.data.entrepriseId !== entrepriseId) throw new Error('Accès refusé');
    await deleteDoc(doc(chequeRemindersCollection, existing.id));
  } catch (error) {
    console.error('Error deleting cheque reminder:', error);
    throw error;
  }
}
