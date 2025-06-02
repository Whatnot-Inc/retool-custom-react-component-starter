export enum ComparisonExpressionOperator {
  EQUALS = "==",
  NOT_EQUALS = "!=",
  GREATER_THAN = ">",
  LESS_THAN = "<",
  GREATER_THAN_OR_EQUALS = ">=",
  LESS_THAN_OR_EQUALS = "<=",
}

export enum ExpressionType {
  COMPARISON = "comparison",
  COMPOUND = "compound",
}

export type ComparisonValue = string | number | boolean;

export interface ComparisonExpression {
  type: ExpressionType.COMPARISON;
  signalName: string;
  operator: ComparisonExpressionOperator;
  value: ComparisonValue;
}

export enum CompoundExpressionOperator {
  AND = "AND",
  OR = "OR",
}

export interface CompoundExpression {
  type: ExpressionType.COMPOUND;
  operator: CompoundExpressionOperator;
  expressions: Expression[];
}

export type Expression = ComparisonExpression | CompoundExpression;
