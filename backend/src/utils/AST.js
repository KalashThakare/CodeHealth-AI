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

function calculateLOC(code) {
  const lines = code.split("\n");
  
  let loc = lines.length; // Total lines
  let sloc = 0; // Source lines of code (non-empty, non-comment)
  let cloc = 0; // Comment lines
  let blank = 0; // Blank lines
  
  let inMultiLineComment = false;
  
  for (let line of lines) {
    const trimmed = line.trim();
    
    // Check for blank lines
    if (trimmed === "") {
      blank++;
      continue;
    }
    
    // Check for multi-line comment start
    if (trimmed.startsWith("/*")) {
      inMultiLineComment = true;
      cloc++;
      continue;
    }
    
    // Check for multi-line comment end
    if (inMultiLineComment) {
      cloc++;
      if (trimmed.includes("*/")) {
        inMultiLineComment = false;
      }
      continue;
    }
    
    // Check for single-line comments
    if (trimmed.startsWith("//")) {
      cloc++;
      continue;
    }
    
    // If we reach here, it's a source line
    sloc++;
  }
  
  // Logical LOC (approximate - lines with actual code statements)
  const lloc = sloc;
  
  return {
    loc,      // Total lines
    sloc,     // Source lines (non-blank, non-comment)
    lloc,     // Logical lines (statements)
    cloc,     // Comment lines
    blank,    // Blank lines
    multi: cloc // Multi-line comments included in cloc
  };
}

// -------------------- Analyzer --------------------
export function analyzeFile(code) {
  try {
    // First calculate LOC (doesn't require AST)
    const locMetrics = calculateLOC(code);
    
    // Then parse AST
    const ast = generateAST(code);
    
    // Calculate metrics
    const cc = calculateCyclomatic(ast);
    const halstead = calculateHalstead(ast);
    const mi = calculateMaintainabilityIndex(halstead, cc, locMetrics.sloc || 1);

    return { 
      cc, 
      halstead, 
      loc: locMetrics, 
      mi 
    };
  } catch (error) {
    console.error("[ast] Error in analyzeFile:", error.message);
    
    // Return default metrics even if parsing fails
    const locMetrics = calculateLOC(code);
    return {
      cc: 1,
      halstead: {
        n1: 0,
        n2: 0,
        N1: 0,
        N2: 0,
        vocabulary: 0,
        length: 0,
        volume: 0
      },
      loc: locMetrics,
      mi: 0,
      error: error.message
    };
  }
}