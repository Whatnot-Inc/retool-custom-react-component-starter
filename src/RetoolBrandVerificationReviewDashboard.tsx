import React, { FC } from 'react'
import { Retool } from '@tryretool/custom-component-support'

import { BrandVerificationReviewDashboardView } from './BrandVerificationReviewDashboard'
import {
  readApplications,
  ReviewDecision
} from './brandVerificationModel'

export const BrandVerificationReviewDashboard: FC = () => {
  Retool.useComponentSettings({ defaultWidth: 12, defaultHeight: 18 })
  const [applicationData] = Retool.useStateObject({
    name: 'applicationData',
    initialValue: { items: [] },
    inspector: 'text',
    label: 'Applications',
    description:
      'Bind to an authorized query result. Supply taxIdLastFour only; never expose a full tax identifier.'
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
