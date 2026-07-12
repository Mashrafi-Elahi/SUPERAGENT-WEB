'use client';

import { useSyncExternalStore } from 'react';

export type Language = 'en' | 'bn';

const STORAGE_KEY = 'mfsa-lang';
const CHANGE_EVENT = 'mfsa-language-change';

const dictionary = {
  overview: { en: 'Overview', bn: 'সারসংক্ষেপ' },
  agents: { en: 'Agents', bn: 'এজেন্ট' },
  alerts: { en: 'Alerts', bn: 'সতর্কতা' },
  cases: { en: 'Cases', bn: 'কেস' },
  auditTrail: { en: 'Audit Trail', bn: 'অডিট ট্রেইল' },
  home: { en: 'Home', bn: 'হোম' },
  apiChecking: { en: 'Checking API', bn: 'API যাচাই হচ্ছে' },
  backendApi: { en: 'Backend API', bn: 'ব্যাকএন্ড API' },
  mockFallback: { en: 'Mock fallback', bn: 'মক ফলব্যাক' },
  providerFeeds: { en: 'Provider feeds', bn: 'প্রোভাইডার ফিড' },
  missing: { en: 'Missing', bn: 'অনুপস্থিত' },
  conflict: { en: 'Conflict', bn: 'সংঘাত' },
  delayed: { en: 'Delayed', bn: 'বিলম্বিত' },
  fresh: { en: 'Fresh', bn: 'সতেজ' },
  noFeed: { en: 'No feed', bn: 'ফিড নেই' },
  waitingForSync: { en: 'Waiting for sync', bn: 'সিঙ্কের অপেক্ষা' },
  casesCount: { en: 'cases', bn: 'কেস' },
  agent: { en: 'Agent', bn: 'এজেন্ট' },
  fieldOfficer: { en: 'Field Officer', bn: 'ফিল্ড অফিসার' },
  providerOperations: { en: 'Provider Operations', bn: 'প্রোভাইডার অপারেশনস' },
  riskReviewer: { en: 'Risk Reviewer', bn: 'রিস্ক রিভিউয়ার' },
  liquidityRiskIntelligence: { en: 'Liquidity & Risk Intelligence', bn: 'লিকুইডিটি ও রিস্ক ইন্টেলিজেন্স' },
  boundary: { en: 'Boundary:', bn: 'সীমা:' },
  boundaryText: {
    en: 'advisory signals only. No transfer, refill, block, or fraud decision is executed.',
    bn: 'শুধু পরামর্শমূলক সংকেত। কোনো ট্রান্সফার, রিফিল, ব্লক বা জালিয়াতির সিদ্ধান্ত নেওয়া হয় না।',
  },
  mockFallbackActive: { en: 'Mock fallback active', bn: 'মক ফলব্যাক চালু' },
  sharedPhysicalCash: { en: 'Shared Physical Cash', bn: 'শেয়ার্ড নগদ টাকা' },
  acrossSimulatedOutlets: { en: 'Across simulated outlets', bn: 'সিমুলেটেড আউটলেটজুড়ে' },
  providerEMoney: { en: 'Provider E-Money', bn: 'প্রোভাইডার ই-মানি' },
  viewOnlyNotConvertible: { en: 'View only · not convertible', bn: 'শুধু দেখা যাবে · রূপান্তরযোগ্য নয়' },
  providersUnderPressure: { en: 'Providers Under Pressure', bn: 'চাপে থাকা প্রোভাইডার' },
  withinMinutes: { en: 'Within {minutes} min', bn: '{minutes} মিনিটের মধ্যে' },
  openAlerts: { en: 'Open Alerts', bn: 'খোলা সতর্কতা' },
  explainableEvidence: { en: 'Explainable evidence', bn: 'ব্যাখ্যাযোগ্য প্রমাণ' },
  highPriorityCases: { en: 'High-Priority Cases', bn: 'উচ্চ অগ্রাধিকার কেস' },
  humanOwnedWorkflow: { en: 'Human-owned workflow', bn: 'মানব-নিয়ন্ত্রিত ওয়ার্কফ্লো' },
  dataConfidence: { en: 'Data Confidence', bn: 'ডেটা আস্থা' },
  fallbackAware: { en: 'Fallback-aware', bn: 'ফলব্যাক সচেতন' },
  outletPrioritization: { en: 'Outlet prioritization', bn: 'আউটলেট অগ্রাধিকার' },
  multiProviderAgentPositions: { en: 'Multi-provider agent positions', bn: 'মাল্টি-প্রোভাইডার এজেন্ট অবস্থান' },
  syntheticOutlets: { en: '{count} synthetic outlets · scenario time {time}', bn: '{count} সিমুলেটেড আউটলেট · সিনারিও সময় {time}' },
  agentOperations: { en: 'Agent operations', bn: 'এজেন্ট অপারেশনস' },
  superAgentOutlets: { en: 'Super Agent Outlets', bn: 'সুপার এজেন্ট আউটলেট' },
  prioritizeOutlets: { en: 'Prioritize simulated outlets by area, provider and feed quality.', bn: 'এলাকা, প্রোভাইডার ও ফিড মান অনুযায়ী সিমুলেটেড আউটলেট অগ্রাধিকার দিন।' },
  searchAgents: { en: 'Search agent or outlet...', bn: 'এজেন্ট বা আউটলেট খুঁজুন...' },
  allAreas: { en: 'All areas', bn: 'সব এলাকা' },
  allProviders: { en: 'All providers', bn: 'সব প্রোভাইডার' },
  allDataStates: { en: 'All data states', bn: 'সব ডেটা অবস্থা' },
  stale: { en: 'Stale', bn: 'পুরোনো' },
  conflicting: { en: 'Conflicting', bn: 'সংঘাতপূর্ণ' },
  showingOutlets: { en: 'Showing {shown} of {total} outlets', bn: '{total}টির মধ্যে {shown}টি আউটলেট' },
  currentDemoPeriod: { en: 'Current demo period', bn: 'বর্তমান ডেমো সময়' },
  explainableReviewQueue: { en: 'Explainable review queue', bn: 'ব্যাখ্যাযোগ্য রিভিউ সারি' },
  liquidityUnusualAlerts: { en: 'Liquidity & Unusual-Activity Alerts', bn: 'লিকুইডিটি ও অস্বাভাবিক কার্যকলাপ সতর্কতা' },
  alertsDescription: { en: 'Evidence, uncertainty and a safe next step are visible for every high-impact alert.', bn: 'প্রতিটি গুরুত্বপূর্ণ সতর্কতায় প্রমাণ, অনিশ্চয়তা ও নিরাপদ পরবর্তী পদক্ষেপ দেখা যায়।' },
  advisoryBoundary: { en: 'Advisory boundary:', bn: 'পরামর্শ সীমা:' },
  advisoryBoundaryText: {
    en: 'a statistical signal is not a final determination. This prototype never restricts an account or executes a financial action.',
    bn: 'পরিসংখ্যানগত সংকেত চূড়ান্ত সিদ্ধান্ত নয়। এই প্রোটোটাইপ কোনো অ্যাকাউন্ট সীমাবদ্ধ করে না বা আর্থিক কাজ চালায় না।',
  },
  searchAlert: { en: 'Search alert or outlet...', bn: 'সতর্কতা বা আউটলেট খুঁজুন...' },
  allSeverities: { en: 'All severities', bn: 'সব গুরুত্ব' },
  critical: { en: 'Critical', bn: 'ক্রিটিক্যাল' },
  high: { en: 'High', bn: 'উচ্চ' },
  medium: { en: 'Medium', bn: 'মাঝারি' },
  low: { en: 'Low', bn: 'নিম্ন' },
  allConfidenceLevels: { en: 'All confidence levels', bn: 'সব আস্থা স্তর' },
  confidenceHigh: { en: 'High >=80%', bn: 'উচ্চ >=৮০%' },
  confidenceModerate: { en: 'Moderate 50-79%', bn: 'মাঝারি ৫০-৭৯%' },
  confidenceLow: { en: 'Low <50%', bn: 'নিম্ন <৫০%' },
  alertsSummary: { en: '{count} alerts · Last 12 scenario minutes · scenario time 4:35 PM', bn: '{count} সতর্কতা · শেষ ১২ সিনারিও মিনিট · সিনারিও সময় ৪:৩৫ PM' },
  whyReview: { en: 'Why this needs review', bn: 'কেন রিভিউ দরকার' },
  uncertainty: { en: 'Uncertainty', bn: 'অনিশ্চয়তা' },
  confidence: { en: 'Confidence', bn: 'আস্থা' },
  safeNextStep: { en: 'Safe next step:', bn: 'নিরাপদ পরবর্তী পদক্ষেপ:' },
  owner: { en: 'Owner:', bn: 'মালিক:' },
  data: { en: 'Data:', bn: 'ডেটা:' },
  acknowledgeReview: { en: 'Acknowledge for review', bn: 'রিভিউর জন্য গ্রহণ করুন' },
  acknowledged: { en: 'Acknowledged', bn: 'গৃহীত' },
  humanOwnedCoordination: { en: 'Human-owned coordination', bn: 'মানব-নিয়ন্ত্রিত সমন্বয়' },
  caseCoordination: { en: 'Case Coordination', bn: 'কেস সমন্বয়' },
  casesDescription: { en: 'Trace routing, ownership, acknowledgement, escalation and documented resolution.', bn: 'রাউটিং, মালিকানা, গ্রহণ, এসকেলেশন ও নথিভুক্ত সমাধান ট্র্যাক করুন।' },
  caseActionsBoundary: {
    en: 'Case actions record review decisions only. Provider balances remain separate and the prototype executes no transfer, refill or account action.',
    bn: 'কেস অ্যাকশন শুধু রিভিউ সিদ্ধান্ত সংরক্ষণ করে। প্রোভাইডার ব্যালেন্স আলাদা থাকে এবং প্রোটোটাইপ কোনো ট্রান্সফার, রিফিল বা অ্যাকাউন্ট অ্যাকশন চালায় না।',
  },
  localDemoFallback: { en: 'Local demo fallback', bn: 'লোকাল ডেমো ফলব্যাক' },
  allProviderScopes: { en: 'All provider scopes', bn: 'সব প্রোভাইডার স্কোপ' },
  sharedCash: { en: 'Shared cash', bn: 'শেয়ার্ড নগদ' },
  bkashOnly: { en: 'bKash only', bn: 'শুধু bKash' },
  nagadOnly: { en: 'Nagad only', bn: 'শুধু Nagad' },
  rocketOnly: { en: 'Rocket only', bn: 'শুধু Rocket' },
  allCaseStatuses: { en: 'All case statuses', bn: 'সব কেস অবস্থা' },
  new: { en: 'New', bn: 'নতুন' },
  assigned: { en: 'Assigned', bn: 'অ্যাসাইনড' },
  underReview: { en: 'Under Review', bn: 'রিভিউ চলছে' },
  escalated: { en: 'Escalated', bn: 'এসকেলেটেড' },
  resolved: { en: 'Resolved', bn: 'সমাধান হয়েছে' },
  closed: { en: 'Closed', bn: 'বন্ধ' },
  last12ScenarioMinutes: { en: 'Last 12 scenario minutes', bn: 'শেষ ১২ সিনারিও মিনিট' },
  last30ScenarioMinutes: { en: 'Last 30 scenario minutes', bn: 'শেষ ৩০ সিনারিও মিনিট' },
  fullSimulatedDay: { en: 'Full simulated day', bn: 'পুরো সিমুলেটেড দিন' },
  routingOwnership: { en: 'Routing & ownership', bn: 'রাউটিং ও মালিকানা' },
  receives: { en: 'Receives', bn: 'গ্রহণকারী' },
  assignedTo: { en: 'Assigned to', bn: 'অ্যাসাইনড টু' },
  recommendedNextStep: { en: 'Recommended next step', bn: 'প্রস্তাবিত পরবর্তী পদক্ষেপ' },
  advisoryOnly: { en: 'Advisory only · authorized human action required', bn: 'শুধু পরামর্শ · অনুমোদিত মানব পদক্ষেপ দরকার' },
  evidenceConfidence: { en: 'Evidence & confidence', bn: 'প্রমাণ ও আস্থা' },
  caseNote: { en: 'Case note', bn: 'কেস নোট' },
  resolution: { en: 'Resolution:', bn: 'সমাধান:' },
  traceableHistory: { en: 'Traceable history', bn: 'ট্রেসযোগ্য ইতিহাস' },
  markUnderReview: { en: 'Mark under review', bn: 'রিভিউতে দিন' },
  escalateReview: { en: 'Escalate review', bn: 'রিভিউ এসকেলেট করুন' },
  documentResolution: { en: 'Document resolution', bn: 'সমাধান নথিভুক্ত করুন' },
  resolutionDocumented: { en: 'Resolution documented', bn: 'সমাধান নথিভুক্ত' },
  accountability: { en: 'Accountability', bn: 'জবাবদিহি' },
  auditTrailTitle: { en: 'Audit Trail', bn: 'অডিট ট্রেইল' },
  auditDescription: { en: 'Trace ownership, acknowledgement, review, escalation and resolution events.', bn: 'মালিকানা, গ্রহণ, রিভিউ, এসকেলেশন ও সমাধান ইভেন্ট ট্র্যাক করুন।' },
  syntheticHistoryOnly: { en: 'Synthetic case history only; no credentials or customer identities are stored.', bn: 'শুধু সিমুলেটেড কেস ইতিহাস; কোনো ক্রেডেনশিয়াল বা গ্রাহক পরিচয় সংরক্ষণ করা হয় না।' },
  importantWorkflowEvents: { en: 'Important workflow events', bn: 'গুরুত্বপূর্ণ ওয়ার্কফ্লো ইভেন্ট' },
  traceableEvents: { en: '{count} traceable demo events', bn: '{count}টি ট্রেসযোগ্য ডেমো ইভেন্ট' },
  commonLoading: { en: 'Loading scenario data...', bn: 'সিনারিও ডেটা লোড হচ্ছে...' },
  noMatchingAgents: { en: 'No matching agents', bn: 'মিল থাকা এজেন্ট নেই' },
  ready: { en: 'Ready', bn: 'প্রস্তুত' },
  area: { en: 'Area', bn: 'এলাকা' },
  responsePosture: { en: 'Response posture', bn: 'রেসপন্স অবস্থান' },
} as const;

type TranslationKey = keyof typeof dictionary;

function readLanguage(): Language {
  return window.localStorage.getItem(STORAGE_KEY) === 'bn' ? 'bn' : 'en';
}

function subscribeLanguage(onChange: () => void) {
  function onLanguageChange() {
    onChange();
  }

  function onStorage(event: StorageEvent) {
    if (event.key === STORAGE_KEY) onChange();
  }

  window.addEventListener(CHANGE_EVENT, onLanguageChange);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onLanguageChange);
    window.removeEventListener('storage', onStorage);
  };
}

export function setAppLanguage(next: Language) {
  window.localStorage.setItem(STORAGE_KEY, next);
  document.documentElement.setAttribute('lang', next);
  window.dispatchEvent(new CustomEvent<Language>(CHANGE_EVENT, { detail: next }));
}

export function useLanguage() {
  const language = useSyncExternalStore(subscribeLanguage, readLanguage, (): Language => 'en');

  return {
    language,
    setLanguage: setAppLanguage,
    t: (key: TranslationKey, values?: Record<string, string | number>) => translate(language, key, values),
  };
}

export function translate(language: Language, key: TranslationKey, values: Record<string, string | number> = {}) {
  let text: string = dictionary[key][language];
  for (const [name, value] of Object.entries(values)) {
    text = text.replaceAll(`{${name}}`, String(value));
  }
  return text;
}
