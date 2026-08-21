export type ApplicationStatus = 'pending' | 'approved' | 'rejected'

export type EligibilitySignal = {
  label: string
  detail: string
  passed: boolean
}

export type BrandVerificationApplication = {
  id: string
  status: ApplicationStatus
  submittedAt: string
  seller: {
    userId: string
    username: string
    avatarUrl?: string
    aggregateRating: number
    activeSevereViolations: number
  }
  business: {
    brandName: string
    legalBusinessName: string
    legalAddress: string
    website: string
    taxIdLastFour: string
    trademarkNumber: string
    annualRevenue: string
  }
  eligibility: EligibilitySignal[]
}

export type ReviewDecision = {
  applicationId: string
  decision: 'approve' | 'reject'
  reason: string
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isApplicationStatus = (value: unknown): value is ApplicationStatus =>
  value === 'pending' || value === 'approved' || value === 'rejected'

const isSafeWebsite = (value: string): boolean => {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export const readApplications = (
  value: unknown
): BrandVerificationApplication[] => {
  if (!isRecord(value) || !Array.isArray(value.items)) return []

  return value.items.filter(
    (item): item is BrandVerificationApplication =>
      isRecord(item) &&
      typeof item.id === 'string' &&
      isApplicationStatus(item.status) &&
      typeof item.submittedAt === 'string' &&
      !Number.isNaN(Date.parse(item.submittedAt)) &&
      isRecord(item.seller) &&
      typeof item.seller.userId === 'string' &&
      typeof item.seller.username === 'string' &&
      (item.seller.avatarUrl === undefined ||
        typeof item.seller.avatarUrl === 'string') &&
      typeof item.seller.aggregateRating === 'number' &&
      Number.isFinite(item.seller.aggregateRating) &&
      typeof item.seller.activeSevereViolations === 'number' &&
      Number.isFinite(item.seller.activeSevereViolations) &&
      isRecord(item.business) &&
      typeof item.business.brandName === 'string' &&
      typeof item.business.legalBusinessName === 'string' &&
      typeof item.business.legalAddress === 'string' &&
      typeof item.business.website === 'string' &&
      isSafeWebsite(item.business.website) &&
      typeof item.business.taxIdLastFour === 'string' &&
      /^\d{4}$/.test(item.business.taxIdLastFour) &&
      typeof item.business.trademarkNumber === 'string' &&
      typeof item.business.annualRevenue === 'string' &&
      Array.isArray(item.eligibility) &&
      item.eligibility.every(
        (signal) =>
          isRecord(signal) &&
          typeof signal.label === 'string' &&
          typeof signal.detail === 'string' &&
          typeof signal.passed === 'boolean'
      )
  )
}
