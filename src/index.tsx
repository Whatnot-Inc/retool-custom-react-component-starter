import React from 'react'
import ReactDOM from 'react-dom/client'
import { ComparisonExpressionOperator, CompoundExpressionOperator, Expression, ExpressionType } from './rule-selection/types'
import ExpressionContainer, { ComparisonExpressionComponent } from './rule-selection/Components'

// Export the component for use as a module
export { default as MyRetoolComponent } from './MyRetoolComponent'

const TestExpression: Expression = {
  type: ExpressionType.COMPARISON,
  signalName: "test",
  operator: ComparisonExpressionOperator.EQUALS,
  value: "test",
}

const TestCompoundExpression: Expression = {
  type: ExpressionType.COMPOUND,
  operator: CompoundExpressionOperator.AND,
  expressions: [TestExpression, TestExpression],
}

const TestCompoundExpression2: Expression = {
  type: ExpressionType.COMPOUND,
  operator: CompoundExpressionOperator.AND,
  expressions: [TestCompoundExpression, TestCompoundExpression, TestExpression],
}

// For development
if (document.getElementById('root')) {
  const root = ReactDOM.createRoot(document.getElementById('root')!)
  const mode = "edit"
  root.render(
    <React.StrictMode>
      <div>
        <ComparisonExpressionComponent
          mode={mode}
          expression={TestExpression}
          onExpressionChange={(newExpression) => console.log(newExpression)}
          signalNames={["test", "test2", "test3"]}
        />
        <ExpressionContainer
          mode={mode}
          expression={TestCompoundExpression2}
          onExpressionChange={(newExpression) => console.log(newExpression)}
        />
      </div>
    </React.StrictMode>
  )
}
