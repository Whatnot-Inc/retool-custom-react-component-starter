import React, { useState } from 'react'
import { ComparisonExpression, ComparisonExpressionOperator, CompoundExpressionOperator, Expression, ExpressionType } from './types'

// ExpressionComponent

interface ExpressionComponentProps {
    expression: Expression
    mode: "edit" | "view"
    onExpressionChange: (newExpression: Expression) => void
    onDelete?: () => void
    onComparisonExpressionSelected?: (comparisonExpression: ComparisonExpression, path: string) => void
    selectedComparisonExpressionAndPath?: {comparisonExpression: ComparisonExpression, path: string} | null
    path: string
}

const ExpressionComponent: React.FC<ExpressionComponentProps> = ({
    expression,
    mode,
    onExpressionChange,
    onDelete,
    onComparisonExpressionSelected,
    selectedComparisonExpressionAndPath,
    path
}) => {
    const [isAddingExpression, setIsAddingExpression] = useState(false)

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

    // Style constants
    const comparisonExpressionStyles = {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: selectedComparisonExpressionAndPath?.path === path ? 'blue' : 'white',
        cursor: 'pointer',
        padding: '4px 8px',
        borderRadius: '4px'
    }
    const compoundHeaderStyles = {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '10px'
    }
    const nestedExpressionsStyles = {
        marginLeft: '20px'
    }

    const handleComparisonClick = () => {
        if (expression.type === ExpressionType.COMPARISON) {
            onComparisonExpressionSelected?.(expression as ComparisonExpression, path)
        }
    }
    const handleOperatorChange = (newOperator: CompoundExpressionOperator) => {
        if (expression.type === ExpressionType.COMPOUND) {
            onExpressionChange({
                ...expression,
                operator: newOperator
            })
        }
    }
    const handleAddExpressionComplete = (newExpression: Expression) => {
        addExpression(newExpression)
        setIsAddingExpression(false)
    }

    if (expression.type === ExpressionType.COMPARISON) {
        return (
            <div style={comparisonExpressionStyles} onClick={handleComparisonClick}>
                <div>
                    {expression.signalName} {expression.operator} {expression.value}
                </div>
                {mode === "edit" && onDelete && (
                    <AddDeleteButton onClick={onDelete} mode="delete" />
                )}
            </div>
        )
    }

    return (
        <div>
            <div style={compoundHeaderStyles}>
                {mode === "edit" ? (
                    <select 
                        value={expression.operator} 
                        onChange={(e) => handleOperatorChange(e.target.value as CompoundExpressionOperator)}
                    >
                        {Object.values(CompoundExpressionOperator).map((op) => (
                            <option value={op} key={op}>
                                {op}
                            </option>
                        ))}
                    </select>
                ) : (
                    <div>{expression.operator}</div>
                )}
                {mode === "edit" && onDelete && (
                    <AddDeleteButton onClick={onDelete} mode="delete" />
                )}
            </div>
            
            <div style={nestedExpressionsStyles}>
                {expression.expressions.map((e, index) => (
                    <div key={index}>
                        <ExpressionComponent 
                            expression={e} 
                            mode={mode} 
                            onExpressionChange={(newExpr) => handleChildExpressionChange(index, newExpr)}
                            onDelete={() => deleteExpression(index)}
                            path={`${path}.${index}`}
                            selectedComparisonExpressionAndPath={selectedComparisonExpressionAndPath}
                            onComparisonExpressionSelected={onComparisonExpressionSelected}
                        />
                    </div>
                ))}
                {mode === "edit" && !isAddingExpression && (
                    <AddDeleteButton 
                        onClick={() => setIsAddingExpression(true)} 
                        mode="add" 
                    />
                )}
            </div>
            
            {isAddingExpression && (
                <AddExpressionMenu onExpressionAdded={handleAddExpressionComplete} />
            )}
        </div>
    )
}

// ComparisonExpressionComponent

interface ComparisonExpressionComponentProps {
    mode: "edit" | "view"
    expression: ComparisonExpression
    onExpressionChange: (newExpression: ComparisonExpression) => void
    signalNames: string[]
}

const ComparisonExpressionComponent: React.FC<ComparisonExpressionComponentProps> = ({
    mode,
    expression,
    onExpressionChange,
    signalNames
}) => {
    const viewStyles = {
        display: 'flex',
        alignItems: 'center'
    }
    const editContainerStyles = {
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    }

    const handleSignalChange = (newSignalName: string) => {
        const updatedExpression = {
            ...expression,
            signalName: newSignalName
        }
        onExpressionChange(updatedExpression)
    }
    const handleOperatorChange = (newOperator: ComparisonExpressionOperator) => {
        const updatedExpression = {
            ...expression,
            operator: newOperator
        }
        onExpressionChange(updatedExpression)
    }
    const handleValueChange = (newValue: string) => {
        const updatedExpression = {
            ...expression,
            value: newValue
        }
        onExpressionChange(updatedExpression)
    }

    if (mode === "view") {
        return (
            <div style={viewStyles}>
                <div>
                    {expression.signalName} {expression.operator} {expression.value}
                </div>
            </div>
        )
    }

    return (
        <div>
            <p>Comparison Expression</p>
            <div style={editContainerStyles}>
                <select 
                    value={expression.signalName} 
                    onChange={(e) => handleSignalChange(e.target.value)}
                >
                    {signalNames.map((signalName) => (
                        <option value={signalName} key={signalName}>
                            {signalName}
                        </option>
                    ))}
                </select>
                
                <select 
                    value={expression.operator} 
                    onChange={(e) => handleOperatorChange(e.target.value as ComparisonExpressionOperator)}
                >
                    {Object.values(ComparisonExpressionOperator).map((op) => (
                        <option value={op} key={op}>
                            {op}
                        </option>
                    ))}
                </select>
                
                <input 
                    type="text" 
                    value={expression.value.toString()} 
                    onChange={(e) => handleValueChange(e.target.value)}
                    placeholder="Enter value"
                />
            </div>
        </div>
    )
}

// AddExpressionMenu

interface AddExpressionMenuProps {
    onExpressionAdded: (newExpression: Expression) => void
}

const AddExpressionMenu: React.FC<AddExpressionMenuProps> = ({ onExpressionAdded }) => {
    const testComparisonExpression: Expression = {
        type: ExpressionType.COMPARISON,
        signalName: "test",
        operator: ComparisonExpressionOperator.EQUALS,
        value: "test",
    }
    const testCompoundExpression: Expression = {
        type: ExpressionType.COMPOUND,
        operator: CompoundExpressionOperator.AND,
        expressions: [],
    }
    return (
        <div>
            <button onClick={() => onExpressionAdded(testComparisonExpression)}>Add Comparison Expression</button>
            <button onClick={() => onExpressionAdded(testCompoundExpression)}>Add Compound Expression</button>
        </div>
    )
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
    const [selectedComparisonExpressionAndPath, setSelectedComparisonExpressionAndPath] = useState<{comparisonExpression: ComparisonExpression, path: string} | null>(null)

    const handleExpressionChange = (newExpression: Expression) => {
        setCurrentExpression(newExpression)
        onExpressionChange(newExpression)
    }

    return (
        <div>
            <ExpressionComponent
                expression={currentExpression}
                mode={mode}
                onExpressionChange={handleExpressionChange}
                onComparisonExpressionSelected={(comparisonExpression, path) => setSelectedComparisonExpressionAndPath({comparisonExpression, path})} 
                selectedComparisonExpressionAndPath={selectedComparisonExpressionAndPath}
                path=""
            />
        </div>
    )
}

export default ExpressionContainer;
export { ComparisonExpressionComponent };