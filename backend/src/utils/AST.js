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
  
  let loc = lines.length;
  let sloc = 0;
  let cloc = 0;
  let blank = 0;
  
  let inMultiLineComment = false;
  
  for (let line of lines) {
    const trimmed = line.trim();
    
    // Blank line
    if (trimmed === "") {
      blank++;
      continue;
    }
    
    let hasCode = false;
    let hasComment = false;
    let workingLine = trimmed;
    
    // Handle multi-line comments
    if (inMultiLineComment) {
      hasComment = true;
      const endIdx = workingLine.indexOf("*/");
      if (endIdx !== -1) {
        inMultiLineComment = false;
        workingLine = workingLine.substring(endIdx + 2).trim();
        if (workingLine.length > 0 && !workingLine.startsWith("//")) {
          hasCode = true;
        }
      }
    } else {
      // Check for multi-line comment start
      const startIdx = workingLine.indexOf("/*");
      if (startIdx !== -1) {
        hasComment = true;
        // Check if there's code before the comment
        if (startIdx > 0) {
          hasCode = true;
        }
        
        const endIdx = workingLine.indexOf("*/", startIdx + 2);
        if (endIdx !== -1) {
          // Single-line /* */ comment
          const after = workingLine.substring(endIdx + 2).trim();
          if (after.length > 0 && !after.startsWith("//")) {
            hasCode = true;
          }
        } else {
          // Multi-line comment starts
          inMultiLineComment = true;
        }
      } else if (workingLine.startsWith("//")) {
        // Single-line comment
        hasComment = true;
      } else if (workingLine.includes("//")) {
        // Code with inline comment
        hasCode = true;
        hasComment = true;
      } else {
        // Pure code line
        hasCode = true;
      }
    }
    
    if (hasComment) cloc++;
    if (hasCode) sloc++;
  }
  
  return {
    loc,
    sloc,
    lloc: sloc, // Approximation
    cloc,
    blank,
    multi: cloc
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