import React, { useState, useRef, useEffect } from 'react'
import './MyRetoolComponent.css'

/**
 * This is a custom Retool component that uses the Retool API to get the count state.
 *
 * FOR LOCAL DEVELOPMENT WITH `npm run start`:
 * 1. Comment out the next line (real Retool import)
 * 2. Uncomment the mock import line below
 *
 * FOR PRODUCTION/DEPLOYMENT TO RETOOL:
 * 1. Comment out the mock import line
 * 2. Uncomment the real Retool import line
 */

import { Retool } from '@tryretool/custom-component-support';
// import { Retool } from './mocks/retool'

const MyRetoolComponent = () => {
  const [count, setCountState] =
    Retool.useStateNumber?.({
      name: 'count',
      initialValue: 0
    }) || useState(0)

  const runQuery = Retool.useEventCallback?.({
    name: 'incrementQuery',
  }) || (() => { console.log('runQuery') });

  const [returnedData, _] = Retool.useStateObject?.({
    name: 'returnedData',
  }) || [null, () => { console.log('returnedData set') }]

  const returnedDataRef = useRef(returnedData)

  useEffect(() => {
    returnedDataRef.current = returnedData
  }, [returnedData]);

  const handleIncrement = () => {
    setCountState(count + 1)
  }

  return (
    <div className="my-retool-component my-retool-component-container">
      <h1 className="my-retool-component-title">My Custom Retool Component</h1>
      <p className="my-retool-component-text">Count: {count}</p>
      <button
        className="my-retool-component-button glow-button"
        onClick={handleIncrement}
      >
        <span data-glow aria-hidden="true"></span>
        Increment
      </button>
      <button
        className="my-retool-component-button glow-button"
        onClick={() => {
            runQuery()
            setTimeout(() => {
                console.log('Returned data:', returnedDataRef.current)
            }, 1000)
        }}
      >
        <span data-glow aria-hidden="true"></span>
        Run Query
      </button>
      <p>
          {JSON.stringify(returnedDataRef.current, null, 2)}
      </p>
    </div>
  )
}

export default MyRetoolComponent
