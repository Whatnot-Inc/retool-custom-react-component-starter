import React, { FC } from 'react'
import { Retool } from '@tryretool/custom-component-support'

import {
  ApplicationStatus,
  BrandVerificationApplication,
  BrandVerificationReviewDashboardView,
  ReviewDecision
} from './BrandVerificationReviewDashboard'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isApplicationStatus = (value: unknown): value is ApplicationStatus =>
  value === 'pending' || value === 'approved' || value === 'rejected'

const readApplications = (value: unknown): BrandVerificationApplication[] => {
  if (!isRecord(value) || !Array.isArray(value.items)) return []

  return value.items.filter(
    (item): item is BrandVerificationApplication =>
      isRecord(item) &&
      typeof item.id === 'string' &&
      isApplicationStatus(item.status) &&
      typeof item.submittedAt === 'string' &&
      isRecord(item.seller) &&
      typeof item.seller.userId === 'string' &&
      typeof item.seller.username === 'string' &&
      typeof item.seller.aggregateRating === 'number' &&
      typeof item.seller.activeSevereViolations === 'number' &&
      isRecord(item.business) &&
      typeof item.business.brandName === 'string' &&
      typeof item.business.legalBusinessName === 'string' &&
      typeof item.business.legalAddress === 'string' &&
      typeof item.business.website === 'string' &&
      typeof item.business.taxId === 'string' &&
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

export const BrandVerificationReviewDashboard: FC = () => {
  Retool.useComponentSettings({ defaultWidth: 12, defaultHeight: 18 })
  const [applicationData] = Retool.useStateObject({
    name: 'applicationData',
    initialValue: { items: [] },
    inspector: 'text',
    label: 'Applications',
    description:
      'Bind to a query result shaped as { items: BrandVerificationApplication[] }.'
  })
  const [allowedReviewer] = Retool.useStateBoolean({
    name: 'allowedReviewer',
    initialValue: false,
    inspector: 'checkbox',
    label: 'Allowed reviewer',
    description:
      'Bind to the Retool page permission check. Sensitive data stays hidden when false.'
  })
  const [, setDecisionRequest] = Retool.useStateObject({
    name: 'decisionRequest',
    initialValue: {},
    inspector: 'hidden'
  })
  const onApprove = Retool.useEventCallback({ name: 'approve' })
  const onReject = Retool.useEventCallback({ name: 'reject' })

  const handleDecision = (reviewDecision: ReviewDecision): void => {
    setDecisionRequest(reviewDecision)
    if (reviewDecision.decision === 'approve') onApprove()
    else onReject()
  }

  return (
    <BrandVerificationReviewDashboardView
      allowedReviewer={allowedReviewer}
      applications={readApplications(applicationData)}
      onDecision={handleDecision}
    />
  )
}
