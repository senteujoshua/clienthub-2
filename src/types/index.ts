export type ClientType = "individual" | "company";

export interface Client {
  id: string;
  type: ClientType;
  name: string;
  idNumber: string | null;
  registrationNumber: string | null;
  contactPerson: string | null;
  email: string;
  phone: string;
  address: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    documents: number;
  };
  documents?: Document[];
}

export interface Document {
  id: string;
  clientId: string;
  fileName: string;
  fileKey: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  documentType: string;
  expiryDate: string | null;
  createdAt: string;
  updatedAt: string;
  client?: Pick<Client, "id" | "name">;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface DashboardStats {
  totalClients: number;
  individualClients: number;
  companyClients: number;
  totalDocuments: number;
  documentsThisMonth: number;
  expiringDocuments: number;
  recentUploads: Document[];
  recentClients: Client[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ClientFilters {
  search?: string;
  type?: ClientType | "all";
  page?: number;
  pageSize?: number;
  sortBy?: "name" | "createdAt" | "email";
  sortOrder?: "asc" | "desc";
}

export interface DocumentFilters {
  clientId?: string;
  documentType?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}
