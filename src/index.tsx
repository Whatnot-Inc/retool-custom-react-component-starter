import React from 'react'
import ReactDOM from 'react-dom/client'

import {
  BrandVerificationReviewDashboardView
} from './BrandVerificationReviewDashboard'
import { sampleApplications } from './sampleApplications'

export { BrandVerificationReviewDashboardView }

const rootElement = document.getElementById('root')

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <BrandVerificationReviewDashboardView
        allowedReviewer
        applications={sampleApplications}
        onDecision={(decision) => console.info('Review decision', decision)}
      />
    </React.StrictMode>
  )
}
