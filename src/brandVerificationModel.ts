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

const hasOnlyKeys = (
  value: Record<string, unknown>,
  allowedKeys: readonly string[]
): boolean => {
  const allowed = new Set(allowedKeys)
  return Object.keys(value).every((key) => allowed.has(key))
}

const isApplicationStatus = (value: unknown): value is ApplicationStatus =>
  value === 'pending' || value === 'approved' || value === 'rejected'

const isEligibilitySignal = (value: unknown): value is EligibilitySignal =>
  isRecord(value) &&
  hasOnlyKeys(value, ['label', 'detail', 'passed']) &&
  typeof value.label === 'string' &&
  typeof value.detail === 'string' &&
  typeof value.passed === 'boolean'

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

  return value.items.flatMap((item): BrandVerificationApplication[] => {
    if (
      !isRecord(item) ||
      !hasOnlyKeys(item, [
        'id',
        'status',
        'submittedAt',
        'seller',
        'business',
        'eligibility'
      ]) ||
      typeof item.id !== 'string' ||
      !isApplicationStatus(item.status) ||
      typeof item.submittedAt !== 'string' ||
      Number.isNaN(Date.parse(item.submittedAt)) ||
      !isRecord(item.seller) ||
      !isRecord(item.business) ||
      !Array.isArray(item.eligibility)
    ) {
      return []
    }

    const { seller, business, eligibility } = item
    if (
      !hasOnlyKeys(seller, [
        'userId',
        'username',
        'aggregateRating',
        'activeSevereViolations'
      ]) ||
      typeof seller.userId !== 'string' ||
      typeof seller.username !== 'string' ||
      typeof seller.aggregateRating !== 'number' ||
      !Number.isFinite(seller.aggregateRating) ||
      typeof seller.activeSevereViolations !== 'number' ||
      !Number.isFinite(seller.activeSevereViolations) ||
      !hasOnlyKeys(business, [
        'brandName',
        'legalBusinessName',
        'legalAddress',
        'website',
        'taxIdLastFour',
        'trademarkNumber',
        'annualRevenue'
      ]) ||
      typeof business.brandName !== 'string' ||
      typeof business.legalBusinessName !== 'string' ||
      typeof business.legalAddress !== 'string' ||
      typeof business.website !== 'string' ||
      !isSafeWebsite(business.website) ||
      typeof business.taxIdLastFour !== 'string' ||
      !/^\d{4}$/.test(business.taxIdLastFour) ||
      typeof business.trademarkNumber !== 'string' ||
      typeof business.annualRevenue !== 'string' ||
      !eligibility.every(isEligibilitySignal)
    ) {
      return []
    }

    return [
      {
        id: item.id,
        status: item.status,
        submittedAt: item.submittedAt,
        seller: {
          userId: seller.userId,
          username: seller.username,
          aggregateRating: seller.aggregateRating,
          activeSevereViolations: seller.activeSevereViolations
        },
        business: {
          brandName: business.brandName,
          legalBusinessName: business.legalBusinessName,
          legalAddress: business.legalAddress,
          website: business.website,
          taxIdLastFour: business.taxIdLastFour,
          trademarkNumber: business.trademarkNumber,
          annualRevenue: business.annualRevenue
        },
        eligibility: eligibility.map(({ label, detail, passed }) => ({
          label,
          detail,
          passed
        }))
      }
    ]
  })
}
