import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import { BrandVerificationReviewDashboard } from './RetoolBrandVerificationReviewDashboard'
import { sampleApplications } from './sampleApplications'

const mockApplicationData = { items: [] as unknown[] }
const mockSetDecisionRequest = jest.fn()
const mockApprove = jest.fn()
const mockReject = jest.fn()
const mockUseStateObject = jest.fn(({ name }: { name: string }) =>
  name === 'applicationData'
    ? [mockApplicationData, jest.fn()]
    : [{}, mockSetDecisionRequest]
)
const mockUseStateBoolean = jest.fn((_args: { name: string }) => [
  true,
  jest.fn()
])
const mockUseEventCallback = jest.fn(({ name }: { name: string }) =>
  name === 'approve' ? mockApprove : mockReject
)

jest.mock(
  '@tryretool/custom-component-support',
  () => ({
    Retool: {
      useComponentSettings: jest.fn(),
      useStateObject: (args: { name: string }) => mockUseStateObject(args),
      useStateBoolean: (args: { name: string }) => mockUseStateBoolean(args),
      useEventCallback: (args: { name: string }) =>
        mockUseEventCallback(args)
    }
  }),
  { virtual: true }
)

describe('BrandVerificationReviewDashboard Retool contract', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockApplicationData.items = sampleApplications
    mockUseStateObject.mockImplementation(({ name }: { name: string }) =>
      name === 'applicationData'
        ? [mockApplicationData, jest.fn()]
        : [{}, mockSetDecisionRequest]
    )
    mockUseStateBoolean.mockImplementation((_args: { name: string }) => [
      true,
      jest.fn()
    ])
    mockUseEventCallback.mockImplementation(({ name }: { name: string }) =>
      name === 'approve' ? mockApprove : mockReject
    )
  })

  it('sets the hidden decision payload before firing the approve event', () => {
    render(<BrandVerificationReviewDashboard />)

    fireEvent.click(screen.getByRole('button', { name: 'Approve brand' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirm approval' }))

    expect(mockSetDecisionRequest).toHaveBeenCalledWith({
      applicationId: 'bva_1042',
      decision: 'approve',
      reason: ''
    })
    expect(mockApprove).toHaveBeenCalledTimes(1)
    expect(mockReject).not.toHaveBeenCalled()
    expect(mockSetDecisionRequest.mock.invocationCallOrder[0]).toBeLessThan(
      mockApprove.mock.invocationCallOrder[0]
    )
    expect(mockUseStateObject).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'decisionRequest',
        inspector: 'hidden'
      })
    )
  })
})
