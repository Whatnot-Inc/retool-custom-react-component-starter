import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import { BrandVerificationReviewDashboardView } from './BrandVerificationReviewDashboard'
import { readApplications } from './brandVerificationModel'
import { sampleApplications } from './sampleApplications'

describe('BrandVerificationReviewDashboardView', () => {
  it('hides sensitive application data from unauthorized reviewers', () => {
    render(
      <BrandVerificationReviewDashboardView allowedReviewer={false} applications={sampleApplications} onDecision={jest.fn()} />
    )
    expect(screen.getByText('Restricted tool')).toBeInTheDocument()
    expect(screen.queryByText('Aurora Skin Labs, Inc.')).not.toBeInTheDocument()
    expect(screen.queryByText('••-•••6789')).not.toBeInTheDocument()
  })

  it('submits an approval decision for the selected application', () => {
    const onDecision = jest.fn()
    render(
      <BrandVerificationReviewDashboardView allowedReviewer applications={sampleApplications} onDecision={onDecision} />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Approve brand' }))
    fireEvent.change(screen.getByPlaceholderText('Add an internal note'), {
      target: { value: 'Trademark record confirmed.' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Confirm approval' }))
    expect(onDecision).toHaveBeenCalledWith({
      applicationId: 'bva_1042', decision: 'approve', reason: 'Trademark record confirmed.'
    })
    expect(screen.getByText('Decision submitted: Approved')).toBeInTheDocument()
  })

  it('requires a reviewer reason before rejection', () => {
    const onDecision = jest.fn()
    render(
      <BrandVerificationReviewDashboardView allowedReviewer applications={sampleApplications} onDecision={onDecision} />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Reject' }))
    const confirm = screen.getByRole('button', { name: 'Confirm rejection' })
    expect(confirm).toBeDisabled()
    fireEvent.change(screen.getByPlaceholderText('Explain why the application is being rejected'), {
      target: { value: 'Trademark ownership could not be verified.' }
    })
    fireEvent.click(confirm)
    expect(onDecision).toHaveBeenCalledWith({
      applicationId: 'bva_1042', decision: 'reject',
      reason: 'Trademark ownership could not be verified.'
    })
  })

  it('does not render an unsafe public website as a link', () => {
    const unsafeApplications = [
      {
        ...sampleApplications[0],
        business: {
          ...sampleApplications[0].business,
          website: 'javascript:alert(1)'
        }
      }
    ]

    render(
      <BrandVerificationReviewDashboardView
        allowedReviewer
        applications={unsafeApplications}
        onDecision={jest.fn()}
      />
    )

    expect(screen.getByText('Not provided')).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})

describe('readApplications', () => {
  it('accepts an authorized-query payload containing tax ID last four only', () => {
    expect(readApplications({ items: sampleApplications })).toEqual(
      sampleApplications
    )
  })

  it('rejects records containing a full tax identifier', () => {
    const { taxIdLastFour, ...business } = sampleApplications[0].business
    const applicationWithFullTaxId = {
      ...sampleApplications[0],
      business: { ...business, taxId: `12-345${taxIdLastFour}` }
    }

    expect(readApplications({ items: [applicationWithFullTaxId] })).toEqual([])
  })

  it('rejects malformed timestamps and unsafe public websites', () => {
    const malformedApplications = [
      {
        ...sampleApplications[0],
        submittedAt: 'not-a-date'
      },
      {
        ...sampleApplications[0],
        business: {
          ...sampleApplications[0].business,
          website: 'javascript:alert(1)'
        }
      }
    ]

    expect(readApplications({ items: malformedApplications })).toEqual([])
  })
})
