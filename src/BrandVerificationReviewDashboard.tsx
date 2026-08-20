import React, { FC, useMemo, useState } from 'react'

import './MyRetoolComponent.css'

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
    taxId: string
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

type DashboardProps = {
  applications: BrandVerificationApplication[]
  allowedReviewer: boolean
  onDecision: (decision: ReviewDecision) => void
}

const statusLabels: Record<ApplicationStatus, string> = {
  pending: 'Pending review',
  approved: 'Approved',
  rejected: 'Rejected'
}

const maskTaxId = (taxId: string): string => {
  const visible = taxId.replace(/\D/g, '').slice(-4)
  return visible ? `••-•••${visible}` : 'Not provided'
}

const formatSubmittedAt = (submittedAt: string): string =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(submittedAt))

const StatusBadge: FC<{ status: ApplicationStatus }> = ({ status }) => (
  <span className={`status-badge status-badge--${status}`}>
    <span className="status-badge__dot" />
    {statusLabels[status]}
  </span>
)

const EmptyState: FC = () => (
  <section className="empty-state">
    <div className="empty-state__icon" aria-hidden="true">
      ✓
    </div>
    <h2>No applications to review</h2>
    <p>New brand verification submissions will appear here.</p>
  </section>
)

export const BrandVerificationReviewDashboardView: FC<DashboardProps> = ({
  applications,
  allowedReviewer,
  onDecision
}) => {
  const [selectedId, setSelectedId] = useState(applications[0]?.id ?? '')
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus>('pending')
  const [search, setSearch] = useState('')
  const [decision, setDecision] = useState<'approve' | 'reject' | null>(null)
  const [reason, setReason] = useState('')
  const [submittedDecision, setSubmittedDecision] =
    useState<ReviewDecision | null>(null)

  const counts = useMemo(
    () => ({
      pending: applications.filter(({ status }) => status === 'pending').length,
      approved: applications.filter(({ status }) => status === 'approved').length,
      rejected: applications.filter(({ status }) => status === 'rejected').length
    }),
    [applications]
  )

  const filteredApplications = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    return applications.filter((application) => {
      const matchesStatus = application.status === statusFilter
      const matchesSearch =
        !normalizedSearch ||
        application.business.brandName.toLowerCase().includes(normalizedSearch) ||
        application.business.legalBusinessName
          .toLowerCase()
          .includes(normalizedSearch) ||
        application.seller.username.toLowerCase().includes(normalizedSearch)
      return matchesStatus && matchesSearch
    })
  }, [applications, search, statusFilter])

  const selectedApplication =
    applications.find(({ id }) => id === selectedId) ??
    filteredApplications[0] ??
    applications[0]

  const selectStatus = (status: ApplicationStatus): void => {
    setStatusFilter(status)
    const firstMatch = applications.find(
      (application) => application.status === status
    )
    if (firstMatch) setSelectedId(firstMatch.id)
  }

  const openDecision = (nextDecision: 'approve' | 'reject'): void => {
    setReason('')
    setDecision(nextDecision)
  }

  const submitDecision = (): void => {
    if (!selectedApplication || !decision) return
    const request = {
      applicationId: selectedApplication.id,
      decision,
      reason: reason.trim()
    }
    onDecision(request)
    setSubmittedDecision(request)
    setDecision(null)
  }

  if (!allowedReviewer) {
    return (
      <main className="review-dashboard access-denied">
        <section className="access-denied__card">
          <div className="access-denied__lock" aria-hidden="true">
            <span />
          </div>
          <span className="eyebrow">Restricted tool</span>
          <h1>Brand verification review</h1>
          <p>
            This dashboard contains sensitive business and tax information.
            Access is limited to approved brand verification reviewers.
          </p>
        </section>
      </main>
    )
  }

  return (
    <main className="review-dashboard">
      <header className="dashboard-header">
        <div className="dashboard-header__title-row">
          <div className="brand-mark" aria-hidden="true">
            W
          </div>
          <div>
            <span className="eyebrow">Trust &amp; authenticity</span>
            <h1>Brand verification</h1>
          </div>
        </div>
        <div className="reviewer-access">
          <span className="reviewer-access__icon" aria-hidden="true">
            ✓
          </span>
          Reviewer access
        </div>
      </header>

      <div className="dashboard-layout">
        <aside className="review-queue">
          <div className="review-queue__header">
            <div>
              <span className="eyebrow">Work queue</span>
              <h2>Applications</h2>
            </div>
            <span className="queue-count">{counts.pending} pending</span>
          </div>

          <label className="search-field">
            <span aria-hidden="true">⌕</span>
            <input
              aria-label="Search applications"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search brand or seller"
              type="search"
              value={search}
            />
          </label>

          <div className="status-tabs" role="tablist" aria-label="Status filter">
            {(['pending', 'approved', 'rejected'] as const).map((status) => (
              <button
                aria-selected={statusFilter === status}
                className={statusFilter === status ? 'is-active' : ''}
                key={status}
                onClick={() => selectStatus(status)}
                role="tab"
                type="button"
              >
                {status === 'pending' ? 'Pending' : statusLabels[status]}
                <span>{counts[status]}</span>
              </button>
            ))}
          </div>

          <div className="application-list">
            {filteredApplications.map((application) => (
              <button
                className={`application-row ${
                  selectedApplication?.id === application.id ? 'is-selected' : ''
                }`}
                key={application.id}
                onClick={() => setSelectedId(application.id)}
                type="button"
              >
                <span className="application-row__avatar">
                  {application.business.brandName.charAt(0)}
                </span>
                <span className="application-row__content">
                  <strong>{application.business.brandName}</strong>
                  <span>@{application.seller.username}</span>
                  <small>{formatSubmittedAt(application.submittedAt)}</small>
                </span>
                <span className="application-row__arrow" aria-hidden="true">
                  ›
                </span>
              </button>
            ))}
            {!filteredApplications.length && (
              <p className="queue-empty">No matching applications</p>
            )}
          </div>
        </aside>

        {selectedApplication ? (
          <section className="application-detail">
            {submittedDecision?.applicationId === selectedApplication.id && (
              <div className="success-banner" role="status">
                <span aria-hidden="true">✓</span>
                Decision submitted:{' '}
                {submittedDecision.decision === 'approve'
                  ? 'Approved'
                  : 'Rejected'}
              </div>
            )}

            <div className="detail-hero">
              <div className="detail-hero__identity">
                <div className="brand-avatar">
                  {selectedApplication.business.brandName.charAt(0)}
                </div>
                <div>
                  <StatusBadge status={selectedApplication.status} />
                  <h2>{selectedApplication.business.brandName}</h2>
                  <p>
                    @{selectedApplication.seller.username} · User ID{' '}
                    {selectedApplication.seller.userId}
                  </p>
                </div>
              </div>
              <div className="submitted-date">
                <span>Submitted</span>
                <strong>
                  {formatSubmittedAt(selectedApplication.submittedAt)}
                </strong>
              </div>
            </div>

            <div className="detail-grid">
              <section className="detail-card detail-card--business">
                <div className="detail-card__header">
                  <div>
                    <span className="eyebrow">Applicant &amp; KYB</span>
                    <h3>Business details</h3>
                  </div>
                  <span className="section-icon" aria-hidden="true">
                    ◇
                  </span>
                </div>
                <dl className="field-grid">
                  <div>
                    <dt>Legal business name</dt>
                    <dd>{selectedApplication.business.legalBusinessName}</dd>
                  </div>
                  <div>
                    <dt>Brand name</dt>
                    <dd>{selectedApplication.business.brandName}</dd>
                  </div>
                  <div className="field-grid__wide">
                    <dt>Legal business address</dt>
                    <dd>{selectedApplication.business.legalAddress}</dd>
                  </div>
                  <div>
                    <dt>Public brand website</dt>
                    <dd>
                      <a
                        href={selectedApplication.business.website}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {selectedApplication.business.website.replace(
                          /^https?:\/\//,
                          ''
                        )}
                        <span aria-hidden="true"> ↗</span>
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt>Annual revenue</dt>
                    <dd>{selectedApplication.business.annualRevenue}</dd>
                  </div>
                </dl>
              </section>

              <section className="detail-card detail-card--documents">
                <div className="detail-card__header">
                  <div>
                    <span className="eyebrow">Sensitive information</span>
                    <h3>Verification records</h3>
                  </div>
                  <span className="section-icon" aria-hidden="true">
                    ▣
                  </span>
                </div>
                <dl className="record-list">
                  <div>
                    <dt>EIN / TIN</dt>
                    <dd>{maskTaxId(selectedApplication.business.taxId)}</dd>
                  </div>
                  <div>
                    <dt>Trademark number</dt>
                    <dd>{selectedApplication.business.trademarkNumber}</dd>
                  </div>
                </dl>
                <p className="privacy-note">
                  Tax identifiers stay masked in the review surface. Use the
                  secured source record only when full-value verification is
                  required.
                </p>
              </section>
            </div>

            <section className="detail-card eligibility-card">
              <div className="detail-card__header">
                <div>
                  <span className="eyebrow">Policy checks</span>
                  <h3>Eligibility signals</h3>
                </div>
                <span className="eligibility-summary">
                  {
                    selectedApplication.eligibility.filter(
                      ({ passed }) => passed
                    ).length
                  }
                  /{selectedApplication.eligibility.length} passed
                </span>
              </div>
              <div className="eligibility-grid">
                {selectedApplication.eligibility.map((signal) => (
                  <article
                    className={`eligibility-signal eligibility-signal--${
                      signal.passed ? 'pass' : 'fail'
                    }`}
                    key={signal.label}
                  >
                    <span className="eligibility-signal__icon" aria-hidden="true">
                      {signal.passed ? '✓' : '!'}
                    </span>
                    <div>
                      <strong>{signal.label}</strong>
                      <span>{signal.detail}</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {selectedApplication.status === 'pending' && (
              <footer className="decision-bar">
                <div>
                  <strong>Ready to make a decision?</strong>
                  <span>The applicant will be notified after submission.</span>
                </div>
                <div className="decision-bar__actions">
                  <button
                    className="button button--secondary"
                    onClick={() => openDecision('reject')}
                    type="button"
                  >
                    Reject
                  </button>
                  <button
                    className="button button--primary"
                    onClick={() => openDecision('approve')}
                    type="button"
                  >
                    Approve brand
                  </button>
                </div>
              </footer>
            )}
          </section>
        ) : (
          <EmptyState />
        )}
      </div>

      {decision && selectedApplication && (
        <div className="modal-backdrop" role="presentation">
          <section
            aria-labelledby="decision-title"
            aria-modal="true"
            className="decision-modal"
            role="dialog"
          >
            <button
              aria-label="Close"
              className="modal-close"
              onClick={() => setDecision(null)}
              type="button"
            >
              ×
            </button>
            <div
              className={`decision-modal__icon decision-modal__icon--${decision}`}
              aria-hidden="true"
            >
              {decision === 'approve' ? '✓' : '!'}
            </div>
            <span className="eyebrow">Confirm decision</span>
            <h2 id="decision-title">
              {decision === 'approve' ? 'Approve' : 'Reject'}{' '}
              {selectedApplication.business.brandName}?
            </h2>
            <p>
              {decision === 'approve'
                ? 'This will grant the verified brand badge to the seller.'
                : 'This will close the application without granting a badge.'}
            </p>
            <label className="reason-field">
              <span>
                Reviewer note{' '}
                {decision === 'reject' ? '(required)' : '(optional)'}
              </span>
              <textarea
                autoFocus
                onChange={(event) => setReason(event.target.value)}
                placeholder={
                  decision === 'approve'
                    ? 'Add an internal note'
                    : 'Explain why the application is being rejected'
                }
                rows={4}
                value={reason}
              />
            </label>
            <div className="decision-modal__actions">
              <button
                className="button button--secondary"
                onClick={() => setDecision(null)}
                type="button"
              >
                Cancel
              </button>
              <button
                className={`button ${
                  decision === 'approve'
                    ? 'button--primary'
                    : 'button--danger'
                }`}
                disabled={decision === 'reject' && !reason.trim()}
                onClick={submitDecision}
                type="button"
              >
                Confirm {decision === 'approve' ? 'approval' : 'rejection'}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
