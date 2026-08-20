import { BrandVerificationApplication } from './BrandVerificationReviewDashboard'

export const sampleApplications: BrandVerificationApplication[] = [
  {
    id: 'bva_1042', status: 'pending', submittedAt: '2026-08-18T16:44:00Z',
    seller: { userId: '28490117', username: 'auroraskin', aggregateRating: 4.9, activeSevereViolations: 0 },
    business: {
      brandName: 'Aurora Skin', legalBusinessName: 'Aurora Skin Labs, Inc.',
      legalAddress: '620 Mateo Street, Los Angeles, CA 90021',
      website: 'https://auroraskin.example', taxId: '12-3456789',
      trademarkNumber: 'US 7,184,322', annualRevenue: '$1M – $5M'
    },
    eligibility: [
      { label: 'Owns trademark / IP', detail: 'Active USPTO registration supplied', passed: true },
      { label: 'Certified brand products', detail: 'First-party catalog attested', passed: true },
      { label: 'Seller rating', detail: '4.9 aggregate rating', passed: true },
      { label: 'Severe violations', detail: 'No active counterfeit actions', passed: true }
    ]
  },
  {
    id: 'bva_1041', status: 'pending', submittedAt: '2026-08-17T19:15:00Z',
    seller: { userId: '19840261', username: 'northstarcoffee', aggregateRating: 4.8, activeSevereViolations: 0 },
    business: {
      brandName: 'Northstar Coffee', legalBusinessName: 'Northstar Coffee Company LLC',
      legalAddress: '1436 NW Flanders Street, Portland, OR 97209',
      website: 'https://northstarcoffee.example', taxId: '93-1284420',
      trademarkNumber: 'US 6,920,184', annualRevenue: '$500K – $1M'
    },
    eligibility: [
      { label: 'Owns trademark / IP', detail: 'Active USPTO registration supplied', passed: true },
      { label: 'Certified brand products', detail: 'First-party catalog attested', passed: true },
      { label: 'Seller rating', detail: '4.8 aggregate rating', passed: true },
      { label: 'Severe violations', detail: 'No active counterfeit actions', passed: true }
    ]
  },
  {
    id: 'bva_1037', status: 'approved', submittedAt: '2026-08-12T17:08:00Z',
    seller: { userId: '11830942', username: 'forgeandfield', aggregateRating: 4.9, activeSevereViolations: 0 },
    business: {
      brandName: 'Forge & Field', legalBusinessName: 'Forge and Field Goods, Inc.',
      legalAddress: '88 Commercial Street, Brooklyn, NY 11222',
      website: 'https://forgeandfield.example', taxId: '82-3419055',
      trademarkNumber: 'US 7,042,901', annualRevenue: '$5M – $10M'
    },
    eligibility: [
      { label: 'Owns trademark / IP', detail: 'Active USPTO registration supplied', passed: true },
      { label: 'Certified brand products', detail: 'First-party catalog attested', passed: true },
      { label: 'Seller rating', detail: '4.9 aggregate rating', passed: true },
      { label: 'Severe violations', detail: 'No active counterfeit actions', passed: true }
    ]
  },
  {
    id: 'bva_1032', status: 'rejected', submittedAt: '2026-08-08T14:25:00Z',
    seller: { userId: '44301984', username: 'rivertradingco', aggregateRating: 3.7, activeSevereViolations: 1 },
    business: {
      brandName: 'River Trading Co.', legalBusinessName: 'River Trading Company LLC',
      legalAddress: '410 River Road, Austin, TX 78701',
      website: 'https://rivertrading.example', taxId: '74-3321844',
      trademarkNumber: 'Pending', annualRevenue: 'Under $500K'
    },
    eligibility: [
      { label: 'Owns trademark / IP', detail: 'Registration not verified', passed: false },
      { label: 'Certified brand products', detail: 'First-party catalog not confirmed', passed: false },
      { label: 'Seller rating', detail: '3.7 aggregate rating', passed: false },
      { label: 'Severe violations', detail: '1 active severe action', passed: false }
    ]
  }
]
