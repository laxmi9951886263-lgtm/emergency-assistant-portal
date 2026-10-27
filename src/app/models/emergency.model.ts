/* ==========================================================================
   TypeScript topics covered in this file
   - Enums, interfaces (duck typing), optional properties, type aliases
   - Classes, constructors, access modifiers, static members, inheritance
   - Abstract classes, polymorphism
   - Namespaces, optional / default / rest parameters
   - Generics and generic constraints
   - Modules (export / import)
   ========================================================================== */

// ---------- Enums ----------
export enum EmergencyType {
  Medical = 'Medical',
  Fire = 'Fire',
  Police = 'Police',
  Accident = 'Accident',
  Disaster = 'Disaster'
}

export enum Severity {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical'
}

// ---------- Interfaces (duck typing: any object with this shape is accepted) ----------
export interface GeoPoint {
  latitude: number;
  longitude: number;
  address?: string; // optional property
}

export type RequestStatus = 'Pending' | 'Dispatched' | 'Resolved';

export interface EmergencyRequest {
  id?: number;
  name: string;
  phone: string;
  type: EmergencyType;
  severity: Severity;
  address: string;
  description: string;
  location?: GeoPoint;
  createdAt: string;
  status: RequestStatus;
}

/** What the form supplies; the service adds id, createdAt and status. */
export type NewEmergencyRequest = Omit<EmergencyRequest, 'id' | 'createdAt' | 'status'>;

export interface EmergencyContact {
  id: string;
  name: string;
  category: string;
  phone: string;
  available: string;
}

export interface FirstAidGuide {
  id: number;
  title: string;
  icon: string;
  severity: Severity;
  summary: string;
  steps: string[];
  warnings?: string[];
}

/** Generic interface */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ---------- Classes: abstract base class + inheritance ----------
export abstract class Report {
  private static counter = 0; // static member shared by all reports
  readonly ref: string;

  // `protected` parameter property: visible in this class and subclasses only
  constructor(protected readonly request: EmergencyRequest, prefix = 'ER') {
    Report.counter += 1;
    this.ref = `${prefix}-${new Date().getFullYear()}-${String(Report.counter).padStart(4, '0')}`;
  }

  /** Each subclass supplies its own advice (polymorphism). */
  abstract instructions(): string;

  describe(): string {
    const r = this.request;
    const score = EmergencyUtils.priorityScore(r.severity);
    return `${r.type} emergency (${r.severity}, priority ${score}) reported by ${r.name} at ${r.address}.`;
  }
}

export class MedicalReport extends Report {
  constructor(request: EmergencyRequest) {
    super(request, 'MED');
  }
  instructions(): string {
    return 'Keep the patient calm and still, do not give food or drink, and keep your phone free for the ambulance (108).';
  }
}

export class FireReport extends Report {
  constructor(request: EmergencyRequest) {
    super(request, 'FIRE');
  }
  instructions(): string {
    return 'Leave the building, stay low under smoke, do not use lifts, and wait at a safe distance for the fire service (101).';
  }
}

export class GeneralReport extends Report {
  constructor(request: EmergencyRequest) {
    super(request, 'GEN');
  }
  instructions(): string {
    return 'Move to a safe place, keep your phone on, and stay reachable on the number you provided.';
  }
}

/** Factory: returns the right subclass for the emergency type. */
export function createReport(request: EmergencyRequest): Report {
  switch (request.type) {
    case EmergencyType.Medical:
      return new MedicalReport(request);
    case EmergencyType.Fire:
      return new FireReport(request);
    default:
      return new GeneralReport(request);
  }
}

// ---------- Namespace with optional, default and rest parameters ----------
export namespace EmergencyUtils {
  const weights: Record<Severity, number> = {
    [Severity.Low]: 1,
    [Severity.Medium]: 2,
    [Severity.High]: 3,
    [Severity.Critical]: 4
  };

  /** Default parameter: countryCode */
  export function formatPhone(raw: string, countryCode = '+91'): string {
    const digits = raw.replace(/\D/g, '');
    return digits.length === 10 ? `${countryCode} ${digits.slice(0, 5)} ${digits.slice(5)}` : raw;
  }

  /** Optional parameter: minutesWaiting */
  export function priorityScore(severity: Severity, minutesWaiting?: number): number {
    const waitBonus = minutesWaiting ? Math.floor(minutesWaiting / 10) : 0;
    return weights[severity] * 10 + waitBonus;
  }

  /** Rest parameter: any number of tags */
  export function joinTags(separator: string, ...tags: string[]): string {
    return tags.filter(Boolean).join(separator);
  }
}

// ---------- Generics and generic constraints ----------
/** K must be a real key of T, so sortBy(guides, 'title') is checked at compile time. */
export function sortBy<T, K extends keyof T>(items: readonly T[], key: K, descending = false): T[] {
  const sorted = [...items].sort((a, b) =>
    String(a[key]).localeCompare(String(b[key]), undefined, { numeric: true })
  );
  return descending ? sorted.reverse() : sorted;
}

/** Constraint: T must have an optional id. */
export function findById<T extends { id?: number | string }>(items: readonly T[], id: number | string): T | undefined {
  return items.find((item) => item.id === id);
}

/** Generic class used as an offline fallback store (localStorage). */
export class LocalStore<T extends { id?: number }> {
  constructor(private readonly key: string) {}

  getAll(): T[] {
    try {
      return JSON.parse(localStorage.getItem(this.key) ?? '[]') as T[];
    } catch {
      return [];
    }
  }

  add(item: T): T {
    const saved = { ...item, id: Date.now() } as T;
    try {
      localStorage.setItem(this.key, JSON.stringify([...this.getAll(), saved]));
    } catch {
      /* storage may be unavailable (private mode); ignore */
    }
    return saved;
  }
}
