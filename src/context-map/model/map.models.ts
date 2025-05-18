export interface Domain {
  name: string;
  type: 'Core' | 'Supporting' | 'Generic' | 'External';
  contexts: string[]; // names of contexts
}

export type IntegrationType = 'U' | 'D' | 'ACL' | 'CF' | 'OHS' | 'PL' | 'OSH-PL' | 'CONFORMIST';
export type RelationshipType = 'Upstream' | 'Downstream' | 'Partnership' | 'SharedKernel';

export interface ContextMapModel {
  name: string;
  layoutMode?: 'auto' | 'manual' | 'hybrid' | 'grid';
  domains: Domain[];
  contexts: BoundedContext[];
  relationships: ContextRelationship[];
}

export interface BoundedContext {
  name: string;
  type?: 'Core' | 'Supporting' | 'External';
  description?: string;
  shape?: 'rectangle' | 'rounded';
  domainTags?: string[];
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  style?: {
    fill?: string;
    stroke?: string;
    dash?: string;
  };
  details?: {
    systemName?: string;         // np. "CorporateLending-DecisionService"
    documentationLinks?: {
      label: string;
      url: string;
    }[];
    owningTeams?: string[];         // np. "Credit Squad"
    technologies?: string[];     // np. ["Java", "Spring Boot", "Drools"]
    repository?: string;         // opcjonalnie link do Git repo
    lastUpdated?: string;        // np. "2025-05-15"
  };
}


export interface ContextRelationship {
  from: string;
  to: string;
  type?: RelationshipType;
  fromIntegrations: IntegrationType[];
  toIntegrations: IntegrationType[];
  labels?: string[];
  style?: {
    color?: string;
    marker?: 'arrow' | 'dot';
    dash?: string;
  };
}
