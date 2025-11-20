// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

export interface ChangeCredentialsData {
  newUsername?: string;
  newPassword?: string;
  securityKey: string;
}

// Supplier types
export interface Supplier {
  id: string;
  name: string;
  deliveryDate: string;
  deliveryTime: string;
  quantity: number;
  barrels: number;
  kgQuantity: number;
  stockLevel: number;
  createdAt: string;
}

export interface SupplierTransaction {
  id: string;
  supplierId: string;
  date: string;
  quantity?: number;
  quantityType?: 'cm' | 'kg';
  pricePerKg?: number;
  service?: string;
  price?: number;
  totalPrice: number;
  createdAt: string;
  description?: string;
}

export interface SupplierPayment {
  id: string;
  supplierId: string;
  date: string;
  description: string;
  amount: number;
  createdAt: string;
}

// Client tracking types
export interface ClientTransaction {
  id: string;
  clientId: string;
  date: string;
  entryType: 'invoice' | 'quantity';
  invoiceNumber?: string;
  quantity?: number;
  pricePerKg?: number;
  totalAmount: number;
  description?: string;
  createdAt: string;
}

export interface ClientPayment {
  id: string;
  clientId: string;
  paymentDate: string;
  paymentMethod: 'effect' | 'cheque' | 'virement';
  collectionDate: string;
  amount: number;
  createdAt: string;
}

// Tank types
export interface Tank {
  id: string;
  name: string;
  productType: string;
  quantity: number;
  isLoading: boolean;
  description?: string;
  date: string;
  time: string;
}

export interface TankOrder {
  id: string;
  tankId: string;
  clientName: string;
  quantity: number;
  description?: string;
  date: string;
  time: string;
  createdAt: string;
}

// Order types
export interface Order {
  id: string;
  date: string;
  time: string;
  clientName: string;
  deliveryAddress: string;
  product: string;
  quantity: number;
  pricePerKg: number;
  totalPriceExclTax: number;
  totalPriceInclTax: number;
  vatRate: number;
  cargoPlacement: string;
  quantityCm?: number;
  tankName?: string;
  tankQuantity?: number;
  blNumber: string;
  createdAt: string;
}

export interface BigSupplier {
  id: string;
  date: string;
  time: string;
  supplierName: string;
  product: string;
  quantity: number;
  pricePerKg: number;
  totalPrice: number;
  location: string;
  tankName?: string;
  description?: string;
  createdAt: string;
}

// Client types
export interface Client {
  id: string;
  name: string;
  logo: string;
  city: string;
  createdAt: string;
  isFavorite?: boolean;
}

// Truck maintenance types
export interface TruckOilChange {
  id: string;
  truckId: string;
  dateVidange: string;
  kmActuel: number;
  intervalVidangeKm: number;
  description?: string;
  createdAt: string;
}

export interface TruckDocument {
  id: string;
  truckId: string;
  nomDocument: string;
  dateExpiration: string;
  createdAt: string;
}

export interface MaintenanceStatus {
  status: 'pas_encore' | 'proche' | 'expire';
  kmRestants?: number;
  joursRestants?: number;
  nomDocument?: string;
}

// Tracking types
export interface TrackedSupplier {
  id: string;
  name: string;
  isFavorite?: boolean;
}

export interface TrackedClient {
  id: string;
  name: string;
  isFavorite?: boolean;
}

// Invoice types
export interface InvoiceProduct {
  id: string;
  product: string;
  productPrice: number;
  quantity: number;
  subtotal: number;
}

export interface ClientData {
  id: string;
  name: string;
  address: string;
  ice: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  clientName: string;
  clientAddress: string;
  clientICE: string;
  products: InvoiceProduct[];
  date: string;
  vatRate: number;
  subtotal: number;
  vatAmount: number;
  totalAmount: number;
  totalAmountInWords: string;
  invoiceNumber: string;
  createdAt: string;
}

// Barrel types
export interface Barrel {
  id: string;
  barrelNumber: string;
  product: string;
  supplier: string;
  quantity: string;
  status: 'Stock' | 'Vendu Complet' | 'Vendu Quantité';
  quantitySold?: number;
  date: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}