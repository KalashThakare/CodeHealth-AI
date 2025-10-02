import { parse } from "@babel/parser";
import pkg from "@babel/traverse";
const traverse = pkg.default || pkg;

function generateAST(code) {
  return parse(code, {
    sourceType: "module",
    plugins: [
      "jsx",
      "typescript",
      "classProperties",
      "dynamicImport",
      "decorators-legacy",
    ],
  });
}

// Cyclomatic Complexity
function calculateCyclomatic(ast) {
  let complexity = 1;
  traverse(ast, {
    IfStatement() { complexity++; },
    ForStatement() { complexity++; },
    WhileStatement() { complexity++; },
    DoWhileStatement() { complexity++; },
    SwitchCase(path) {
      if (path.node.test) complexity++;
    },
    LogicalExpression(path) {
      if (path.node.operator === "&&" || path.node.operator === "||") {
        complexity++;
      }
    },
    ConditionalExpression() { complexity++; },
  });
  return complexity;
}

// Halstead Metrics
function calculateHalstead(ast) {
  let operators = new Set();
  let operands = new Set();
  let N1 = 0, N2 = 0;

  traverse(ast, {
    BinaryExpression(path) {
      operators.add(path.node.operator); N1++;
    },
    LogicalExpression(path) {
      operators.add(path.node.operator); N1++;
    },
    AssignmentExpression(path) {
      operators.add(path.node.operator); N1++;
    },
    UpdateExpression(path) {
      operators.add(path.node.operator); N1++;
    },
    Identifier(path) {
      operands.add(path.node.name); N2++;
    },
    StringLiteral(path) {
      operands.add(path.node.value); N2++;
    },
    NumericLiteral(path) {
      operands.add(path.node.value); N2++;
    },
    BooleanLiteral(path) {
      operands.add(path.node.value); N2++;
    },
  });

  const n1 = operators.size;
  const n2 = operands.size;
  const vocabulary = n1 + n2;
  const length = N1 + N2;
  const volume = length * (Math.log2(vocabulary || 1));

  return { n1, n2, N1, N2, vocabulary, length, volume };
}

// Maintainability Index
function calculateMaintainabilityIndex(halstead, cc, loc) {
  const volume = halstead.volume || 0;
  return Math.max(
    0,
    (171 - 5.2 * Math.log(volume || 1) - 0.23 * cc - 16.2 * Math.log(loc || 1)) * 100 / 171
  );
}

// -------------------- Analyzer --------------------
export function analyzeFile(code) {
  const ast = generateAST(code);

  const cc = calculateCyclomatic(ast);
  const halstead = calculateHalstead(ast);
  const loc = code.split("\n").length;
  const mi = calculateMaintainabilityIndex(halstead, cc, loc);

  return { cc, halstead, loc, mi };
}