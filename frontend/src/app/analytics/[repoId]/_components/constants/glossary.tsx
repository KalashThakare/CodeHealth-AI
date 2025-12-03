import React from "react";
import {
  FiHeart,
  FiDollarSign,
  FiLayers,
  FiCode,
  FiUsers,
  FiAlertTriangle,
  FiRefreshCw,
  FiTrendingUp,
  FiFileText,
  FiDatabase,
} from "react-icons/fi";

export const TERM_GLOSSARY: Record<
  string,
  {
    title: string;
    simple: string;
    detailed: string;
    analogy: string;
    icon: React.ReactNode;
  }
> = {
  healthScore: {
    title: "Health Score",
    simple: "An overall quality grade combining multiple code metrics",
    detailed:
      "A composite score from 0-100 that combines code quality, maintainability, complexity, and development activity. Higher is better.",
    analogy:
      "Works like a credit score for your codebase—gives stakeholders a quick read on whether this code is a safe bet or a liability.",
    icon: <FiHeart />,
  },
  technicalDebt: {
    title: "Technical Debt",
    simple: "Quick fixes and shortcuts that'll cost you later",
    detailed:
      "Code that was written quickly but isn't ideal. It works now but will slow you down and cost more to fix later.",
    analogy:
      "Just like financial debt, it compounds. That hacky workaround from 6 months ago? It's now blocking three different features and nobody wants to touch it.",
    icon: <FiDollarSign />,
  },
  cyclomaticComplexity: {
    title: "Cyclomatic Complexity",
    simple: "Counts how many different paths code can take",
    detailed:
      "Measures the number of independent paths through code. More if/else statements and loops = higher complexity = harder to understand and test.",
    analogy:
      "Every branch in your code is another test case you need to write. High complexity means more places for bugs to hide and more scenarios to cover in QA.",
    icon: <FiLayers />,
  },
  maintainabilityIndex: {
    title: "Maintainability Index",
    simple: "How painful will it be to change this code",
    detailed:
      "A score from 0-100 measuring how easy code is to maintain. Considers code volume, complexity, and structure. Above 65 is good.",
    analogy:
      "Low scores mean new developers will take longer to ramp up, bug fixes will take 3x as long, and every change risks breaking something else.",
    icon: <FiCode />,
  },
  busFactor: {
    title: "Bus Factor",
    simple: "How many people can leave before you're stuck",
    detailed:
      "The minimum number of people who need to leave before the project stalls. Low = risky (knowledge concentrated in few people).",
    analogy:
      "If Sarah is the only one who understands the payment module and she quits, you've got a problem. That's what this metric catches.",
    icon: <FiUsers />,
  },
  codeSmells: {
    title: "Code Smells",
    simple: "Warning signs of deeper problems",
    detailed:
      "Patterns in code that suggest deeper problems - not bugs, but design issues that make code harder to work with.",
    analogy:
      "They're not breaking anything today, but they're the kind of thing that makes experienced developers say 'this is going to bite us eventually.'",
    icon: <FiAlertTriangle />,
  },
  refactoring: {
    title: "Refactoring",
    simple: "Improving code structure without changing behavior",
    detailed:
      "Restructuring existing code to make it cleaner, more efficient, or easier to understand, while keeping the same functionality.",
    analogy:
      "It's paying down technical debt. The app does the same thing, but now your team can actually work with the code without wanting to quit.",
    icon: <FiRefreshCw />,
  },
  velocity: {
    title: "Development Velocity",
    simple: "How much work the team is shipping",
    detailed:
      "Measures the rate of development through commit frequency, code changes, and team activity patterns.",
    analogy:
      "Steady velocity usually means good processes. Wild swings often point to blockers, unclear requirements, or team churn worth investigating.",
    icon: <FiTrendingUp />,
  },
  linesOfCode: {
    title: "Lines of Code (LOC)",
    simple: "Size of the codebase",
    detailed:
      "A basic size metric. More lines isn't necessarily better - quality matters more than quantity.",
    analogy:
      "More code means more to maintain, more to test, and more places for bugs. The best solution is often the one with fewer lines, not more.",
    icon: <FiFileText />,
  },
  halsteadVolume: {
    title: "Halstead Volume",
    simple: "How dense and complex the logic is",
    detailed:
      "A scientific metric based on operators and operands in code. Higher volume = more mental effort needed to understand.",
    analogy:
      "High volume code takes longer to review, is harder for new team members to understand, and tends to have more bugs slip through code review.",
    icon: <FiDatabase />,
  },
};
