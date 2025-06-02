import React from 'react'
import { Expression, ExpressionType } from './types'

interface ExpressionComponentProps {
    expression: Expression
}

const ExpressionComponent: React.FC<ExpressionComponentProps> = ({ expression }) => {
    if (expression.type === ExpressionType.COMPARISON) {
        return <div>{expression.signalName} {expression.operator} {expression.value}</div>
    } else {
        return (
            <div>
                <div>{expression.operator}</div>
                <div style={{ marginLeft: '20px' }}>
                    {expression.expressions.map((e, index) => (
                        <ExpressionComponent expression={e} key={index} />
                    ))}
                </div>
            </div>
        )
    }
}

export default ExpressionComponent;