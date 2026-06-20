const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001";

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

// Clients
export const getClients = () => req<Client[]>("/clients");
export const getClient = (id: string) => req<Client>(`/clients/${id}`);
export const createClient = (body: Partial<Client>) =>
  req<Client>("/clients", { method: "POST", body: JSON.stringify(body) });
export const updateClient = (id: string, body: Partial<Client>) =>
  req<Client>(`/clients/${id}`, { method: "PATCH", body: JSON.stringify(body) });
export const getChatHistory = (id: string) =>
  req<{ client_id: string; messages: Message[] }>(`/clients/${id}/chat-history`);
export const addOpportunity = (id: string, description: string) =>
  req(`/clients/${id}/opportunities`, { method: "POST", body: JSON.stringify({ description }) });

// Projects
export const getProjects = () => req<Project[]>("/projects");
export const getProject = (id: string) => req<Project>(`/projects/${id}`);
export const getCurrentProject = () => req<Project>("/projects/current");
export const updateProjectClient = (
  projectId: string,
  clientId: string,
  body: Partial<ProjectClient>
) =>
  req(`/projects/${projectId}/clients/${clientId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
export const enrichProject = (id: string) =>
  req(`/projects/${id}/enrich`, { method: "POST" });

// Advisor
export const suggestAngle = (clientId: string) =>
  req<{ angle: string; reasoning: string }>("/advisor/suggest-angle", {
    method: "POST",
    body: JSON.stringify({ client_id: clientId }),
  });

// Workers
export const scanLinkedIn = () => req("/workers/scan-linkedin", { method: "POST" });
export const scanInstagram = () => req("/workers/scan-instagram", { method: "POST" });
export const scanLegacy = () => req("/workers/scan-legacy", { method: "POST" });
export const generateBatch = () => req("/workers/generate-batch", { method: "POST" });

// Types
export type Client = {
  _id: string;
  first_name: string;
  last_name: string;
  age: number;
  nationality: string;
  income_range: string;
  number: string;
  email: string;
  marital_status: "single" | "married" | "divorced" | "engaged";
  dependents: Dependent[];
  existing_policies: Policy[];
  socials: Social[];
  sales_opportunities: Opportunity[];
  persona?: Persona;
  recent_signals: RecentSignal[];
  created_at: number;
};

export type Dependent = {
  relationship: string;
  first_name: string;
  last_name: string;
  age?: number;
};

export type Policy = {
  policy_id: string;
  name: string;
  type: string;
  start_date: string;
  end_date?: string;
  beneficiaries: { relationship: string; first_name: string; last_name: string }[];
};

export type Social = { type: "instagram" | "linkedin" | "website"; value: string };

export type Opportunity = { created_at: number; description: string };

export type Persona = { tags: string[]; summary: string; updated_at: number };

export type RecentSignal = {
  platform: "linkedin" | "instagram" | "legacy";
  date_fetched: number;
  content: string;
};

export type Message = { sender: "client" | "advisor"; message: string; timestamp: number };

export type Project = {
  _id: string;
  batch_sales_angle: string;
  created_at: number;
  clients: ProjectClient[];
};

export type ProjectClient = {
  client_id: string;
  notes?: string;
  status: "to_follow_up" | "meeting_rescheduled" | "stale" | "help_me_out";
  next_follow_up_scheduled?: string;
  next_meeting_scheduled?: string;
};
