# Brand Verification Review Dashboard

A Retool custom component for restricted, manual review of brand verification
applications. The component is backend-agnostic: Retool provides application
records through a query binding, then handles approve and reject events with
the selected decision payload.

## Retool contract

Bind `applicationData` to an object with an `items` array. Each item must use
this shape:

```ts
type BrandVerificationApplication = {
  id: string
  status: 'pending' | 'approved' | 'rejected'
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
    taxId: string
    trademarkNumber: string
    annualRevenue: string
  }
  eligibility: Array<{ label: string; detail: string; passed: boolean }>
}
```

Bind `allowedReviewer` to the Retool page permission check. When false, the
component renders no applicant, KYB, tax, or trademark details.

The component exposes `approve` and `reject` events. Before either event fires,
`decisionRequest` is set to:

```ts
{
  applicationId: string
  decision: 'approve' | 'reject'
  reason: string
}
```

Wire each event to the corresponding authenticated Admin2 mutation. A rejection
requires a reason. Tax identifiers are masked in the review UI.

## Development

```sh
npm install
npm start
```

The local preview uses representative, non-production sample records. It never
calls an application endpoint.

## Deployment

Initialize the library once with `npm run init`, selecting the staging Admin2
instance, then use `npm run deploy`. In Retool, bind `applicationData`,
`allowedReviewer`, and both decision events before making the page available to
reviewers.
