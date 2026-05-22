import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  BellRing,
  CalendarClock,
  CheckCircle,
  Download,
  Eye,
  FileSpreadsheet,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useSuppliers } from '../context/SupplierContext';
import { useClients } from '../context/ClientContext';
import {
  addChequeReminder,
  deleteChequeReminder,
  getChequeReminders,
  getEntrepriseId,
  updateChequeReminder,
  updateChequeStatus
} from '../firebase/services/chequeReminders';
import {
  ChequeReminder,
  ChequeReminderInput,
  ChequeReminderStatus,
  ChequeReminderType,
  ClientChequeStatus,
  FournisseurChequeStatus
} from '../types';
import {
  calculateChequeStats,
  formatDateFr,
  formatMad,
  getAlertMessage,
  getChequePartyName,
  getDaysLabel,
  getDaysUntilDue,
  getStatusLabel,
  getTypeLabel,
  getUrgency,
  isChequeClosed,
  sortChequeAlerts
} from '../utils/chequeReminders';

type TabType = ChequeReminderType;
type ModalMode = 'create' | 'edit' | 'status' | 'details' | null;
type PeriodFilter = 'all' | 'today' | 'week' | 'month' | 'custom';
type StateFilter = 'all' | 'overdue' | 'soon' | 'processed';

interface Filters {
  search: string;
  status: string;
  bank: string;
  period: PeriodFilter;
  startDate: string;
  endDate: string;
  state: StateFilter;
}

const emptyFilters: Filters = {
  search: '',
  status: 'all',
  bank: 'all',
  period: 'all',
  startDate: '',
  endDate: '',
  state: 'all'
};

const fournisseurStatuses: FournisseurChequeStatus[] = ['a_venir', 'paye', 'annule', 'rejete'];
const clientStatuses: ClientChequeStatus[] = ['a_deposer', 'depose', 'encaisse', 'annule', 'rejete'];

const defaultForm = (type: ChequeReminderType): ChequeReminderInput => ({
  type,
  fournisseurId: null,
  fournisseurNom: null,
  clientId: null,
  clientNom: null,
  numeroCheque: '',
  banque: '',
  montant: 0,
  dateEmission: '',
  dateReception: '',
  dateEcheance: '',
  dateTraitementReelle: '',
  reference: '',
  notes: '',
  statut: type === 'fournisseur' ? 'a_venir' : 'a_deposer'
});

const statusClass = (cheque: ChequeReminder) => {
  const urgency = getUrgency(cheque);
  if (cheque.statut === 'rejete') return 'bg-red-900 text-white dark:bg-red-800';
  if (cheque.statut === 'annule') return 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200';
  if (['paye', 'depose', 'encaisse'].includes(cheque.statut)) return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300';
  if (urgency === 'overdue') return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
  if (['today', 'tomorrow', 'three_days', 'seven_days'].includes(urgency)) return 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300';
  return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
};

const getStatusOptions = (type: ChequeReminderType) => type === 'fournisseur' ? fournisseurStatuses : clientStatuses;

const isRealTreatmentRequired = (status: ChequeReminderStatus) => ['paye', 'depose', 'encaisse'].includes(status);

const isInPeriod = (date: string, filters: Filters) => {
  if (filters.period === 'all') return true;
  const due = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  if (filters.period === 'today') return due.getTime() === today.getTime();
  if (filters.period === 'week') {
    const end = new Date(today);
    end.setDate(today.getDate() + 7);
    return due >= today && due <= end;
  }
  if (filters.period === 'month') {
    return due.getMonth() === today.getMonth() && due.getFullYear() === today.getFullYear();
  }
  const startOk = filters.startDate ? due >= new Date(filters.startDate) : true;
  const endOk = filters.endDate ? due <= new Date(filters.endDate) : true;
  return startOk && endOk;
};

const exportRows = (cheques: ChequeReminder[]) => cheques.map((cheque) => [
  getTypeLabel(cheque.type),
  getChequePartyName(cheque),
  cheque.numeroCheque,
  cheque.banque,
  formatMad(cheque.montant),
  formatDateFr(cheque.dateEcheance),
  getDaysLabel(cheque),
  getStatusLabel(cheque.statut)
]);

const ChequeRemindersPage: React.FC = () => {
  const { user } = useAuth();
  const { suppliers } = useSuppliers();
  const { clients } = useClients();
  const entrepriseId = getEntrepriseId(user);

  const [activeTab, setActiveTab] = useState<TabType>('fournisseur');
  const [cheques, setCheques] = useState<ChequeReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedCheque, setSelectedCheque] = useState<ChequeReminder | null>(null);
  const [formData, setFormData] = useState<ChequeReminderInput>(defaultForm('fournisseur'));
  const [filters, setFilters] = useState<Record<TabType, Filters>>({
    fournisseur: emptyFilters,
    client: emptyFilters
  });

  const activeFilters = filters[activeTab];

  const loadCheques = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getChequeReminders(entrepriseId);
      setCheques(data);
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement des rappels chèques.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCheques();
  }, [entrepriseId]);

  const stats = useMemo(() => calculateChequeStats(cheques), [cheques]);
  const alerts = useMemo(() => sortChequeAlerts(cheques), [cheques]);

  const banks = useMemo(() => {
    const values = cheques
      .filter((cheque) => cheque.type === activeTab)
      .map((cheque) => cheque.banque)
      .filter(Boolean);
    return Array.from(new Set(values)).sort();
  }, [cheques, activeTab]);

  const filteredCheques = useMemo(() => {
    return cheques
      .filter((cheque) => cheque.type === activeTab)
      .filter((cheque) => {
        const text = `${getChequePartyName(cheque)} ${cheque.numeroCheque}`.toLowerCase();
        const matchesSearch = activeFilters.search ? text.includes(activeFilters.search.toLowerCase()) : true;
        const matchesStatus = activeFilters.status === 'all' || cheque.statut === activeFilters.status;
        const matchesBank = activeFilters.bank === 'all' || cheque.banque === activeFilters.bank;
        const matchesPeriod = isInPeriod(cheque.dateEcheance, activeFilters);
        const days = getDaysUntilDue(cheque.dateEcheance);
        const matchesState =
          activeFilters.state === 'all' ||
          (activeFilters.state === 'overdue' && !isChequeClosed(cheque) && days < 0) ||
          (activeFilters.state === 'soon' && !isChequeClosed(cheque) && days >= 0 && days <= 7) ||
          (activeFilters.state === 'processed' && isChequeClosed(cheque));
        return matchesSearch && matchesStatus && matchesBank && matchesPeriod && matchesState;
      });
  }, [cheques, activeTab, activeFilters]);

  const updateFilter = (key: keyof Filters, value: string) => {
    setFilters((current) => ({
      ...current,
      [activeTab]: { ...current[activeTab], [key]: value }
    }));
  };

  const openCreate = (type: ChequeReminderType) => {
    setActiveTab(type);
    setSelectedCheque(null);
    setFormData(defaultForm(type));
    setModalMode('create');
  };

  const openEdit = (cheque: ChequeReminder) => {
    setSelectedCheque(cheque);
    setFormData({
      type: cheque.type,
      fournisseurId: cheque.fournisseurId,
      fournisseurNom: cheque.fournisseurNom,
      clientId: cheque.clientId,
      clientNom: cheque.clientNom,
      numeroCheque: cheque.numeroCheque,
      banque: cheque.banque,
      montant: cheque.montant,
      dateEmission: cheque.dateEmission || '',
      dateReception: cheque.dateReception || '',
      dateEcheance: cheque.dateEcheance,
      dateTraitementReelle: cheque.dateTraitementReelle || '',
      reference: cheque.reference || '',
      notes: cheque.notes || '',
      statut: cheque.statut
    });
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedCheque(null);
    setSaving(false);
  };

  const validateForm = () => {
    if (formData.type === 'fournisseur' && !formData.fournisseurNom?.trim()) return 'Le fournisseur est obligatoire.';
    if (formData.type === 'client' && !formData.clientNom?.trim()) return 'Le client est obligatoire.';
    if (!formData.numeroCheque.trim()) return 'Le numéro du chèque est obligatoire.';
    if (!formData.dateEcheance) return "La date prévue est obligatoire.";
    if (!formData.montant || Number(formData.montant) <= 0) return 'Le montant doit être supérieur à 0.';
    if (isRealTreatmentRequired(formData.statut) && !formData.dateTraitementReelle) return 'La date réelle est obligatoire pour ce statut.';
    return null;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (modalMode === 'create') {
        await addChequeReminder(entrepriseId, formData, user);
        setSuccess('Chèque ajouté avec succès.');
      } else if (selectedCheque) {
        await updateChequeReminder(entrepriseId, selectedCheque.id, formData, user);
        setSuccess('Chèque modifié avec succès.');
      }
      await loadCheques();
      closeModal();
    } catch (err) {
      console.error(err);
      setError("Impossible d'enregistrer le chèque.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedCheque) return;
    if (isRealTreatmentRequired(formData.statut) && !formData.dateTraitementReelle) {
      setError('La date réelle est obligatoire pour ce statut.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await updateChequeStatus(entrepriseId, selectedCheque.id, formData.statut, formData.dateTraitementReelle || null, user);
      await loadCheques();
      setSuccess('Statut modifié avec succès.');
      closeModal();
    } catch (err) {
      console.error(err);
      setError('Impossible de modifier le statut.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cheque: ChequeReminder) => {
    if (!window.confirm(`Supprimer le chèque n°${cheque.numeroCheque} ? Cette action est définitive.`)) return;
    try {
      await deleteChequeReminder(entrepriseId, cheque.id);
      await loadCheques();
      setSuccess('Chèque supprimé.');
    } catch (err) {
      console.error(err);
      setError('Impossible de supprimer le chèque.');
    }
  };

  const exportPdf = (rows: ChequeReminder[], reportTitle: string) => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text('COMAGAL ENERGY', 14, 16);
    doc.setFontSize(11);
    doc.text(reportTitle, 14, 24);
    doc.text(`Date d'export : ${new Date().toLocaleDateString('fr-FR')}`, 14, 31);
    doc.text(`Total : ${formatMad(rows.reduce((sum, cheque) => sum + cheque.montant, 0))}`, 14, 38);
    autoTable(doc, {
      startY: 45,
      head: [['Type', 'Nom', 'N° chèque', 'Banque', 'Montant', 'Date prévue', 'Jours restants', 'Statut']],
      body: exportRows(rows)
    });
    doc.save(`${reportTitle.replace(/\s+/g, '-').toLowerCase()}.pdf`);
  };

  const exportExcel = (rows: ChequeReminder[], reportTitle: string) => {
    const tableRows = exportRows(rows)
      .map((row) => `<tr>${row.map((cell) => `<td>${String(cell).replace(/</g, '&lt;')}</td>`).join('')}</tr>`)
      .join('');
    const html = `
      <html><head><meta charset="UTF-8"></head><body>
      <h2>COMAGAL ENERGY</h2>
      <p>${reportTitle}</p>
      <p>Date d'export : ${new Date().toLocaleDateString('fr-FR')}</p>
      <p>Total : ${formatMad(rows.reduce((sum, cheque) => sum + cheque.montant, 0))}</p>
      <table border="1">
        <thead><tr><th>Type</th><th>Nom</th><th>N° chèque</th><th>Banque</th><th>Montant</th><th>Date prévue</th><th>Jours restants</th><th>Statut</th></tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
      </body></html>`;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportTitle.replace(/\s+/g, '-').toLowerCase()}.xls`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const visibleRowsTitle = activeTab === 'fournisseur' ? 'Liste des chèques fournisseurs' : 'Liste des chèques clients';
  const overdueRows = filteredCheques.filter((cheque) => !isChequeClosed(cheque) && getDaysUntilDue(cheque.dateEcheance) < 0);
  const dueRows = filteredCheques.filter((cheque) => !isChequeClosed(cheque) && getDaysUntilDue(cheque.dateEcheance) >= 0 && getDaysUntilDue(cheque.dateEcheance) <= 7);
  const monthlyProcessed = cheques.filter((cheque) => {
    const date = cheque.dateTraitementReelle || cheque.dateEcheance;
    const current = new Date();
    const rowDate = new Date(date);
    return isChequeClosed(cheque) && rowDate.getMonth() === current.getMonth() && rowDate.getFullYear() === current.getFullYear();
  });

  return (
    <Layout>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion et rappels des chèques</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Suivi des chèques fournisseurs à payer et des chèques clients à déposer ou encaisser.
          </p>
        </div>
        <Button onClick={loadCheques} variant="outline" disabled={loading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualiser
        </Button>
      </div>

      {(error || success) && (
        <div className={`mb-4 rounded-md border p-3 text-sm ${
          error
            ? 'border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300'
            : 'border-green-300 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300'
        }`}>
          {error || success}
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard icon={<ArrowUpRight />} label="Chèques fournisseurs à payer" value={formatMad(stats.totalFournisseursAPayer)} color="red" />
        <StatCard icon={<ArrowDownLeft />} label="Chèques clients à encaisser" value={formatMad(stats.totalClientsAEncaisser)} color="green" />
        <StatCard icon={<CalendarClock />} label="Échéances aujourd'hui" value={stats.echeanceAujourdhui.toString()} color="orange" />
        <StatCard icon={<AlertTriangle />} label="Chèques en retard" value={stats.enRetard.toString()} color="red" />
        <StatCard icon={<Banknote />} label="À payer dans 7 jours" value={formatMad(stats.aPayer7Jours)} color="orange" />
        <StatCard icon={<CheckCircle />} label="À encaisser dans 7 jours" value={formatMad(stats.aEncaisser7Jours)} color="blue" />
      </div>

      <Card className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <BellRing className="mr-2 h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Alertes importantes</h2>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">{alerts.length} alerte(s)</span>
        </div>
        {alerts.length === 0 ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">Aucune échéance urgente pour le moment.</p>
        ) : (
          <div className="space-y-3">
            {alerts.map((cheque) => (
              <div key={cheque.id} className="rounded-md border border-gray-200 p-3 dark:border-gray-700">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                        {getTypeLabel(cheque.type)}
                      </span>
                      <span className={statusClass(cheque) + ' rounded-full px-2 py-1 text-xs font-medium'}>
                        {getDaysLabel(cheque)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">{getAlertMessage(cheque)}</p>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {formatDateFr(cheque.dateEcheance)} · {formatMad(cheque.montant)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="inline-flex rounded-md border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">
          <button
            onClick={() => setActiveTab('fournisseur')}
            className={`rounded px-4 py-2 text-sm font-medium ${activeTab === 'fournisseur' ? 'bg-comagal-blue text-white' : 'text-gray-700 dark:text-gray-200'}`}
          >
            Chèques fournisseurs
          </button>
          <button
            onClick={() => setActiveTab('client')}
            className={`rounded px-4 py-2 text-sm font-medium ${activeTab === 'client' ? 'bg-comagal-blue text-white' : 'text-gray-700 dark:text-gray-200'}`}
          >
            Chèques clients
          </button>
        </div>
        <Button onClick={() => openCreate(activeTab)}>
          <Plus className="mr-2 h-4 w-4" />
          {activeTab === 'fournisseur' ? 'Ajouter un chèque fournisseur' : 'Ajouter un chèque client'}
        </Button>
      </div>

      <Card className="mb-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {activeTab === 'fournisseur' ? 'Chèques fournisseurs' : 'Chèques clients'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {activeTab === 'fournisseur'
              ? 'Chèques émis par l’entreprise au profit de ses fournisseurs.'
              : 'Chèques remis par les clients à déposer ou encaisser.'}
          </p>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              value={activeFilters.search}
              onChange={(event) => updateFilter('search', event.target.value)}
              placeholder="Nom ou numéro de chèque"
              className="w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </label>
          <select value={activeFilters.status} onChange={(event) => updateFilter('status', event.target.value)} className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white">
            <option value="all">Tous les statuts</option>
            {getStatusOptions(activeTab).map((status) => <option key={status} value={status}>{getStatusLabel(status)}</option>)}
          </select>
          <select value={activeFilters.bank} onChange={(event) => updateFilter('bank', event.target.value)} className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white">
            <option value="all">Toutes les banques</option>
            {banks.map((bank) => <option key={bank} value={bank}>{bank}</option>)}
          </select>
          <select value={activeFilters.period} onChange={(event) => updateFilter('period', event.target.value)} className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white">
            <option value="all">Toutes les périodes</option>
            <option value="today">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="custom">Période personnalisée</option>
          </select>
          {activeFilters.period === 'custom' && (
            <>
              <input type="date" value={activeFilters.startDate} onChange={(event) => updateFilter('startDate', event.target.value)} className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              <input type="date" value={activeFilters.endDate} onChange={(event) => updateFilter('endDate', event.target.value)} className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
            </>
          )}
          <select value={activeFilters.state} onChange={(event) => updateFilter('state', event.target.value)} className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white">
            <option value="all">Tous les chèques</option>
            <option value="overdue">En retard</option>
            <option value="soon">Arrivant bientôt</option>
            <option value="processed">Déjà traités</option>
          </select>
          <Button variant="outline" onClick={() => setFilters((current) => ({ ...current, [activeTab]: emptyFilters }))}>
            Réinitialiser les filtres
          </Button>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => exportPdf(filteredCheques, visibleRowsTitle)}><Download className="mr-2 h-4 w-4" />PDF</Button>
          <Button variant="outline" size="sm" onClick={() => exportExcel(filteredCheques, visibleRowsTitle)}><FileSpreadsheet className="mr-2 h-4 w-4" />Excel</Button>
          <Button variant="outline" size="sm" onClick={() => exportPdf(dueRows, 'Liste des chèques arrivant à échéance')}>Échéances</Button>
          <Button variant="outline" size="sm" onClick={() => exportPdf(overdueRows, 'Liste des chèques en retard')}>Retards</Button>
          <Button variant="outline" size="sm" onClick={() => exportPdf(monthlyProcessed, 'Rapport mensuel des montants payés et encaissés')}>Rapport mensuel</Button>
        </div>

        {loading ? (
          <div className="py-10 text-center text-gray-600 dark:text-gray-400">Chargement des chèques...</div>
        ) : (
          <ChequeTable
            cheques={filteredCheques}
            type={activeTab}
            onDetails={(cheque) => { setSelectedCheque(cheque); setModalMode('details'); }}
            onEdit={openEdit}
            onStatus={(cheque) => { setSelectedCheque(cheque); setFormData({ ...defaultForm(cheque.type), statut: cheque.statut, dateTraitementReelle: cheque.dateTraitementReelle || '' }); setModalMode('status'); }}
            onDelete={handleDelete}
          />
        )}
      </Card>

      {(modalMode === 'create' || modalMode === 'edit') && (
        <ChequeFormModal
          title={modalMode === 'create' ? (formData.type === 'fournisseur' ? 'Ajouter un chèque fournisseur' : 'Ajouter un chèque client') : 'Modifier le chèque'}
          formData={formData}
          setFormData={setFormData}
          suppliers={suppliers}
          clients={clients}
          saving={saving}
          onSubmit={handleSubmit}
          onClose={closeModal}
        />
      )}

      {modalMode === 'status' && selectedCheque && (
        <StatusModal
          cheque={selectedCheque}
          formData={formData}
          setFormData={setFormData}
          saving={saving}
          onSubmit={handleStatusSubmit}
          onClose={closeModal}
        />
      )}

      {modalMode === 'details' && selectedCheque && (
        <DetailsModal cheque={selectedCheque} onClose={closeModal} />
      )}
    </Layout>
  );
};

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: 'red' | 'green' | 'orange' | 'blue' }) => {
  const colors = {
    red: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    green: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    orange: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
  };
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
          <p className="mt-2 text-xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className={`rounded-full p-3 ${colors[color]}`}>{icon}</div>
      </div>
    </Card>
  );
};

interface ChequeTableProps {
  cheques: ChequeReminder[];
  type: TabType;
  onDetails: (cheque: ChequeReminder) => void;
  onEdit: (cheque: ChequeReminder) => void;
  onStatus: (cheque: ChequeReminder) => void;
  onDelete: (cheque: ChequeReminder) => void;
}

const ChequeTable: React.FC<ChequeTableProps> = ({ cheques, type, onDetails, onEdit, onStatus, onDelete }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-700">
      <thead className="bg-gray-50 dark:bg-gray-700/50">
        <tr>
          <Th>{type === 'fournisseur' ? 'Fournisseur' : 'Client'}</Th>
          <Th>N° chèque</Th>
          <Th>Banque</Th>
          <Th>Montant</Th>
          <Th>{type === 'fournisseur' ? "Date d'émission" : 'Date de réception'}</Th>
          <Th>{type === 'fournisseur' ? 'Date de paiement prévue' : 'Date de dépôt / encaissement prévue'}</Th>
          <Th>Jours restants</Th>
          <Th>Statut</Th>
          <Th>Actions</Th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
        {cheques.length === 0 ? (
          <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">Aucun chèque trouvé.</td></tr>
        ) : cheques.map((cheque) => (
          <tr key={cheque.id}>
            <Td>{getChequePartyName(cheque)}</Td>
            <Td>{cheque.numeroCheque}</Td>
            <Td>{cheque.banque || '-'}</Td>
            <Td>{formatMad(cheque.montant)}</Td>
            <Td>{formatDateFr(type === 'fournisseur' ? cheque.dateEmission : cheque.dateReception)}</Td>
            <Td>{formatDateFr(cheque.dateEcheance)}</Td>
            <Td>{getDaysLabel(cheque)}</Td>
            <Td><span className={statusClass(cheque) + ' rounded-full px-2 py-1 text-xs font-medium'}>{getStatusLabel(cheque.statut)}</span></Td>
            <Td>
              <div className="flex gap-1">
                <IconButton label="Voir les détails" onClick={() => onDetails(cheque)} icon={<Eye size={16} />} />
                <IconButton label="Modifier" onClick={() => onEdit(cheque)} icon={<Pencil size={16} />} />
                <IconButton label="Modifier le statut" onClick={() => onStatus(cheque)} icon={<CheckCircle size={16} />} />
                <IconButton label="Supprimer" onClick={() => onDelete(cheque)} icon={<Trash2 size={16} />} danger />
              </div>
            </Td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Th = ({ children }: { children: React.ReactNode }) => <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">{children}</th>;
const Td = ({ children }: { children: React.ReactNode }) => <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-200">{children}</td>;

const IconButton = ({ label, icon, onClick, danger = false }: { label: string; icon: React.ReactNode; onClick: () => void; danger?: boolean }) => (
  <button
    type="button"
    title={label}
    aria-label={label}
    onClick={onClick}
    className={`rounded-md p-2 ${danger ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}
  >
    {icon}
  </button>
);

interface ChequeFormModalProps {
  title: string;
  formData: ChequeReminderInput;
  setFormData: React.Dispatch<React.SetStateAction<ChequeReminderInput>>;
  suppliers: { id: string; name: string }[];
  clients: { id: string; name: string }[];
  saving: boolean;
  onSubmit: (event: FormEvent) => void;
  onClose: () => void;
}

const ChequeFormModal: React.FC<ChequeFormModalProps> = ({ title, formData, setFormData, suppliers, clients, saving, onSubmit, onClose }) => {
  const parties = formData.type === 'fournisseur' ? suppliers : clients;
  const partyName = formData.type === 'fournisseur' ? formData.fournisseurNom || '' : formData.clientNom || '';
  const listId = formData.type === 'fournisseur' ? 'cheque-supplier-suggestions' : 'cheque-client-suggestions';

  const setPartyName = (name: string) => {
    const party = parties.find((item) => item.name.toLowerCase() === name.trim().toLowerCase());
    setFormData((current) => ({
      ...current,
      fournisseurId: current.type === 'fournisseur' ? party?.id || null : null,
      fournisseurNom: current.type === 'fournisseur' ? name : null,
      clientId: current.type === 'client' ? party?.id || null : null,
      clientNom: current.type === 'client' ? name : null
    }));
  };

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label={formData.type === 'fournisseur' ? 'Fournisseur' : 'Client'}>
            <input
              value={partyName}
              onChange={(event) => setPartyName(event.target.value)}
              list={listId}
              placeholder={formData.type === 'fournisseur' ? 'Nom du fournisseur' : 'Nom du client'}
              className="form-input"
            />
            <datalist id={listId}>
              {parties.map((party) => <option key={party.id} value={party.name} />)}
            </datalist>
          </Field>
          <Field label="Numéro du chèque"><input value={formData.numeroCheque} onChange={(event) => setFormData({ ...formData, numeroCheque: event.target.value })} className="form-input" /></Field>
          <Field label={formData.type === 'fournisseur' ? 'Banque' : 'Banque du client'}><input value={formData.banque} onChange={(event) => setFormData({ ...formData, banque: event.target.value })} className="form-input" /></Field>
          <Field label="Montant en MAD"><input type="number" min="0" step="0.01" value={formData.montant || ''} onChange={(event) => setFormData({ ...formData, montant: Number(event.target.value) })} className="form-input" /></Field>
          <Field label={formData.type === 'fournisseur' ? "Date d'émission" : 'Date de réception'}>
            <input
              type="date"
              value={(formData.type === 'fournisseur' ? formData.dateEmission : formData.dateReception) || ''}
              onChange={(event) => setFormData(formData.type === 'fournisseur'
                ? { ...formData, dateEmission: event.target.value }
                : { ...formData, dateReception: event.target.value }
              )}
              className="form-input"
            />
          </Field>
          <Field label={formData.type === 'fournisseur' ? 'Date prévue de paiement / débit' : 'Date prévue de dépôt ou encaissement'}><input type="date" value={formData.dateEcheance} onChange={(event) => setFormData({ ...formData, dateEcheance: event.target.value })} className="form-input" /></Field>
          <Field label="Statut">
            <select value={formData.statut} onChange={(event) => setFormData({ ...formData, statut: event.target.value as ChequeReminderStatus })} className="form-input">
              {getStatusOptions(formData.type).map((status) => <option key={status} value={status}>{getStatusLabel(status)}</option>)}
            </select>
          </Field>
          {isRealTreatmentRequired(formData.statut) && (
            <Field label="Date réelle de traitement"><input type="date" value={formData.dateTraitementReelle || ''} onChange={(event) => setFormData({ ...formData, dateTraitementReelle: event.target.value })} className="form-input" /></Field>
          )}
          <Field label="Référence facultative"><input value={formData.reference || ''} onChange={(event) => setFormData({ ...formData, reference: event.target.value })} className="form-input" /></Field>
          <Field label="Notes facultatives"><textarea value={formData.notes || ''} onChange={(event) => setFormData({ ...formData, notes: event.target.value })} className="form-input min-h-24" /></Field>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Enregistrement...' : 'Enregistrer'}</Button>
        </div>
      </form>
    </Modal>
  );
};

const StatusModal = ({ cheque, formData, setFormData, saving, onSubmit, onClose }: { cheque: ChequeReminder; formData: ChequeReminderInput; setFormData: React.Dispatch<React.SetStateAction<ChequeReminderInput>>; saving: boolean; onSubmit: (event: FormEvent) => void; onClose: () => void }) => (
  <Modal title={`Modifier le statut du chèque n°${cheque.numeroCheque}`} onClose={onClose}>
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Statut">
        <select value={formData.statut} onChange={(event) => setFormData({ ...formData, statut: event.target.value as ChequeReminderStatus })} className="form-input">
          {getStatusOptions(cheque.type).map((status) => <option key={status} value={status}>{getStatusLabel(status)}</option>)}
        </select>
      </Field>
      {isRealTreatmentRequired(formData.statut) && (
        <Field label="Date réelle"><input type="date" value={formData.dateTraitementReelle || ''} onChange={(event) => setFormData({ ...formData, dateTraitementReelle: event.target.value })} className="form-input" /></Field>
      )}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
        <Button type="submit" disabled={saving}>{saving ? 'Mise à jour...' : 'Modifier le statut'}</Button>
      </div>
    </form>
  </Modal>
);

const DetailsModal = ({ cheque, onClose }: { cheque: ChequeReminder; onClose: () => void }) => (
  <Modal title={`Détails du chèque n°${cheque.numeroCheque}`} onClose={onClose}>
    <div className="space-y-5 text-sm">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Detail label="Type" value={getTypeLabel(cheque.type)} />
        <Detail label="Nom" value={getChequePartyName(cheque)} />
        <Detail label="Banque" value={cheque.banque || '-'} />
        <Detail label="Montant" value={formatMad(cheque.montant)} />
        <Detail label="Date prévue" value={formatDateFr(cheque.dateEcheance)} />
        <Detail label="Date réelle" value={formatDateFr(cheque.dateTraitementReelle)} />
        <Detail label="Statut" value={getStatusLabel(cheque.statut)} />
        <Detail label="Référence" value={cheque.reference || '-'} />
      </div>
      <div>
        <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">Notes</h3>
        <p className="rounded-md bg-gray-50 p-3 text-gray-700 dark:bg-gray-700 dark:text-gray-200">{cheque.notes || 'Aucune note.'}</p>
      </div>
      <div>
        <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">Historique</h3>
        <div className="space-y-2">
          {cheque.history?.length ? cheque.history.map((entry) => (
            <div key={entry.id} className="rounded-md border border-gray-200 p-3 dark:border-gray-700">
              <div className="font-medium text-gray-900 dark:text-white">{entry.action}</div>
              <div className="text-gray-600 dark:text-gray-400">{formatDateFr(entry.date)} · {entry.userName}</div>
              {entry.details && <div className="mt-1 text-gray-600 dark:text-gray-300">{entry.details}</div>}
            </div>
          )) : <p className="text-gray-500 dark:text-gray-400">Aucun historique disponible.</p>}
        </div>
      </div>
    </div>
  </Modal>
);

const Modal = ({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
        <button onClick={onClose} className="rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700" aria-label="Fermer"><X size={20} /></button>
      </div>
      {children}
    </div>
  </div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">{label}</span>
    {children}
  </label>
);

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-md bg-gray-50 p-3 dark:bg-gray-700">
    <div className="text-xs uppercase text-gray-500 dark:text-gray-400">{label}</div>
    <div className="font-medium text-gray-900 dark:text-white">{value}</div>
  </div>
);

export default ChequeRemindersPage;
