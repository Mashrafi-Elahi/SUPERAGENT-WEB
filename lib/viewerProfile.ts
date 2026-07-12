'use client';

import { useSyncExternalStore } from 'react';

export type ViewerRole =
  | 'AGENT'
  | 'FIELD_OFFICER'
  | 'PROVIDER_OPERATIONS'
  | 'RISK_REVIEWER'
  | 'MANAGEMENT';

export type ViewerScope = {
  viewerRole: ViewerRole;
  viewerAgentId?: string;
  viewerArea?: string;
  viewerProviderId?: 'BKASH' | 'NAGAD' | 'ROCKET';
};

export type ScopedProviderKey = 'bkash' | 'nagad' | 'rocket';

export type CaseActor = {
  actor_id: string;
  display_name: string;
  role: Exclude<ViewerRole, 'MANAGEMENT'>;
  provider_id?: ViewerScope['viewerProviderId'];
};

export type ViewerProfile = {
  id: string;
  label: string;
  description: string;
  scope: ViewerScope;
  actor: CaseActor | null;
  readOnly: boolean;
};

const STORAGE_KEY = 'mfsa-viewer-profile';
const CHANGE_EVENT = 'mfsa-viewer-profile-change';

const operationalProfiles: ViewerProfile[] = [
  {
    id: 'provider-ops-bkash',
    label: 'Provider Operations',
    description: 'bKash provider scope',
    scope: { viewerRole: 'PROVIDER_OPERATIONS', viewerProviderId: 'BKASH' },
    actor: {
      actor_id: 'ui-provider-ops-bkash',
      display_name: 'bKash Provider Operations',
      role: 'PROVIDER_OPERATIONS',
      provider_id: 'BKASH',
    },
    readOnly: false,
  },
  {
    id: 'field-zindabazar',
    label: 'Field Officer',
    description: 'Zindabazar area scope',
    scope: { viewerRole: 'FIELD_OFFICER', viewerArea: 'Zindabazar' },
    actor: {
      actor_id: 'ui-field-zindabazar',
      display_name: 'Zindabazar Field Officer',
      role: 'FIELD_OFFICER',
    },
    readOnly: false,
  },
  {
    id: 'risk-review',
    label: 'Risk Reviewer',
    description: 'Cross-provider review queue',
    scope: { viewerRole: 'RISK_REVIEWER' },
    actor: {
      actor_id: 'ui-risk-reviewer',
      display_name: 'Risk Reviewer',
      role: 'RISK_REVIEWER',
    },
    readOnly: false,
  },
  {
    id: 'management',
    label: 'Management',
    description: 'Read-only full portfolio',
    scope: { viewerRole: 'MANAGEMENT' },
    actor: null,
    readOnly: true,
  },
];

export const agentViewerProfiles: ViewerProfile[] = Array.from({ length: 6 }, (_, index) => {
  const agentId = `AG${String(index + 1).padStart(3, '0')}`;
  return {
    id: `agent-${agentId.toLowerCase()}`,
    label: `Agent · ${agentId}`,
    description: `${agentId} outlet scope`,
    scope: { viewerRole: 'AGENT', viewerAgentId: agentId },
    actor: {
      actor_id: `ui-agent-${agentId.toLowerCase()}`,
      display_name: `${agentId} Agent Operator`,
      role: 'AGENT',
    },
    readOnly: false,
  } satisfies ViewerProfile;
});

export const viewerProfiles: ViewerProfile[] = [
  ...operationalProfiles.slice(0, 2),
  ...agentViewerProfiles,
  ...operationalProfiles.slice(2),
];

export const DEFAULT_VIEWER_PROFILE = viewerProfiles[0];

function readProfile(): ViewerProfile {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return viewerProfiles.find((profile) => profile.id === stored) ?? DEFAULT_VIEWER_PROFILE;
}

function subscribeProfile(onChange: () => void) {
  function onStorage(event: StorageEvent) {
    if (event.key === STORAGE_KEY) onChange();
  }

  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener('storage', onStorage);
  };
}

export function setViewerProfile(profileId: string) {
  window.localStorage.setItem(STORAGE_KEY, profileId);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useViewerProfile(): ViewerProfile {
  return useSyncExternalStore(subscribeProfile, readProfile, () => DEFAULT_VIEWER_PROFILE);
}

export function viewerScopeQuery(scope?: ViewerScope): string {
  if (!scope) return '';

  const params = new URLSearchParams();
  params.set('viewer_role', scope.viewerRole);
  if (scope.viewerAgentId) params.set('viewer_agent_id', scope.viewerAgentId);
  if (scope.viewerArea) params.set('viewer_area', scope.viewerArea);
  if (scope.viewerProviderId) params.set('viewer_provider_id', scope.viewerProviderId);

  return params.toString();
}

export function withViewerScope(path: string, scope?: ViewerScope): string {
  const query = viewerScopeQuery(scope);
  if (!query) return path;

  return `${path}${path.includes('?') ? '&' : '?'}${query}`;
}

export function visibleProviderKeys(scope?: ViewerScope): ScopedProviderKey[] {
  if (scope?.viewerProviderId === 'BKASH') return ['bkash'];
  if (scope?.viewerProviderId === 'NAGAD') return ['nagad'];
  if (scope?.viewerProviderId === 'ROCKET') return ['rocket'];

  return ['bkash', 'nagad', 'rocket'];
}
