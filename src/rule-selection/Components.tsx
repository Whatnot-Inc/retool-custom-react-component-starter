import React, { useState } from 'react'
import { ComparisonExpressionOperator, CompoundExpressionOperator, Expression, ExpressionType } from './types'

// ExpressionComponent

interface ExpressionComponentProps {
    expression: Expression
    mode: "edit" | "view"
    onExpressionChange: (newExpression: Expression) => void
}

const ExpressionComponent: React.FC<ExpressionComponentProps> = (
    { expression, mode, onExpressionChange }
) => {
    const addExpression = (newExpression: Expression) => {
        if (mode === "view") return
        if (expression.type === ExpressionType.COMPARISON) return
        onExpressionChange({
            ...expression,
            expressions: [...expression.expressions, newExpression]
        })
    }
    const deleteExpression = (index: number) => {
        if (mode === "view") return
        if (expression.type === ExpressionType.COMPARISON) return
        onExpressionChange({
            ...expression,
            expressions: expression.expressions.filter((_, i) => i !== index)
        })
    }
    const handleChildExpressionChange = (index: number, newExpression: Expression) => {
        if (mode === "view") return
        if (expression.type === ExpressionType.COMPARISON) return
        onExpressionChange({
            ...expression,
            expressions: expression.expressions.map((e, i) => i === index ? newExpression : e)
        })
    }

    const TestExpression: Expression = {
        type: ExpressionType.COMPARISON,
        signalName: "test",
        operator: ComparisonExpressionOperator.EQUALS,
        value: "test",
    }

    if (expression.type === ExpressionType.COMPARISON) {
        return <div>{expression.signalName} {expression.operator} {expression.value}</div>
    } else {
        return (
            <div>
                {mode === "edit" ? (
                    <select>
                        {Object.values(CompoundExpressionOperator).map((op) => (
                            <option value={op} key={op}>{op}</option>
                        ))}
                    </select>
                ) : (
                    <div>{expression.operator}</div>
                )}
                
                <div style={{ marginLeft: '20px' }}>
                    {expression.expressions.map((e, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                            <ExpressionComponent 
                                expression={e} 
                                mode={mode} 
                                onExpressionChange={(newExpr) => handleChildExpressionChange(index, newExpr)} 
                            />
                            {mode === "edit" && <AddDeleteButton onClick={() => deleteExpression(index)} mode="delete" />}
                        </div>
                    ))}
                    {mode === "edit" && <AddDeleteButton onClick={() => addExpression(TestExpression)} mode="add" />}
                </div>
            </div>
        )
    }
}

// AddDeleteButton

interface AddDeleteButtonProps {
    onClick: () => void
    mode: "add" | "delete"
}

const AddDeleteButton: React.FC<AddDeleteButtonProps> = ({ onClick, mode }) => {
    return <button onClick={onClick}>{mode}</button>
}

// ExpressionComponent

interface ExpressionContainerProps {
    mode: "edit" | "view"
    expression: Expression
    onExpressionChange: (newExpression: Expression) => void
}

const ExpressionContainer: React.FC<ExpressionContainerProps> = (
    { mode, expression, onExpressionChange }
) => {
    const [currentExpression, setCurrentExpression] = useState<Expression>(expression)
    const handleExpressionChange = (newExpression: Expression) => {
        setCurrentExpression(newExpression)
        onExpressionChange(newExpression)
    }

    return (
        <div>
            <ExpressionComponent expression={currentExpression} mode={mode} onExpressionChange={handleExpressionChange} />
        </div>
    )
}

export default ExpressionContainer;