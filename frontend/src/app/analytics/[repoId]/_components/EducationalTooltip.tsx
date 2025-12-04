"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  FiHelpCircle,
  FiBook,
  FiChevronDown,
  FiChevronRight,
  FiX,
} from "react-icons/fi";
import { TERM_GLOSSARY } from "./constants/glossary";

interface TooltipProps {
  termKey: string;
  children: React.ReactNode;
}

interface TooltipPosition {
  top: number;
  left: number;
}

export function EducationalTooltip({ termKey, children }: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDetailed, setShowDetailed] = useState(false);
  const [position, setPosition] = useState<TooltipPosition>({
    top: 0,
    left: 0,
  });
  const term = TERM_GLOSSARY[termKey];
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const calculatePosition = useCallback(() => {
    if (!wrapperRef.current) return;

    const triggerRect = wrapperRef.current.getBoundingClientRect();
    const tooltipWidth = 320;
    const tooltipHeight = tooltipRef.current?.offsetHeight || 300;
    const padding = 16;

    let top = triggerRect.bottom + 8;
    let left = triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2;

    if (left < padding) {
      left = padding;
    }
    if (left + tooltipWidth > window.innerWidth - padding) {
      left = window.innerWidth - tooltipWidth - padding;
    }

    if (top + tooltipHeight > window.innerHeight - padding) {
      top = triggerRect.top - tooltipHeight - 8;
    }

    if (top < padding) {
      top = padding;
    }

    setPosition({ top, left });
  }, []);

  useEffect(() => {
    if (isOpen) {
      calculatePosition();
      window.addEventListener("scroll", calculatePosition, true);
      window.addEventListener("resize", calculatePosition);
    }
    return () => {
      window.removeEventListener("scroll", calculatePosition, true);
      window.removeEventListener("resize", calculatePosition);
    };
  }, [isOpen, calculatePosition]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setShowDetailed(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!term) return <>{children}</>;

  return (
    <span className="edu-tooltip-wrapper" ref={wrapperRef}>
      <span className="edu-tooltip-trigger" onClick={() => setIsOpen(!isOpen)}>
        {children}
        <FiHelpCircle className="edu-tooltip-icon" />
      </span>
      {isOpen && (
        <div
          ref={tooltipRef}
          className="edu-tooltip-content"
          style={{ top: position.top, left: position.left }}
        >
          <div className="edu-tooltip-header">
            <span className="edu-tooltip-term-icon">{term.icon}</span>
            <h4>{term.title}</h4>
            <button
              onClick={() => setIsOpen(false)}
              className="edu-tooltip-close"
            >
              <FiX size={14} />
            </button>
          </div>
          <p className="edu-tooltip-simple">{term.simple}</p>
          <div className="edu-tooltip-analogy">
            <FiBook size={12} />
            <span>{term.analogy}</span>
          </div>
          <button
            className="edu-tooltip-expand !border-none"
            onClick={() => setShowDetailed(!showDetailed)}
          >
            {showDetailed ? "Hide details" : "Learn more"}
            {showDetailed ? (
              <FiChevronDown size={14} />
            ) : (
              <FiChevronRight size={14} />
            )}
          </button>
          {showDetailed && (
            <p className="edu-tooltip-detailed">{term.detailed}</p>
          )}
        </div>
      )}
    </span>
  );
}
