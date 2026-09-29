'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AlignLeft, Check, Copy, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

export type JsonProblem = { index: number; line: number; col: number; message: string };

/**
 * Reads the text the way JSON.parse does, but stops at the first mistake and says where it is.
 * Browsers disagree on what JSON.parse's error message contains, so the position comes from here
 * and the value itself still comes from JSON.parse.
 */
export function locateJsonError(src: string): JsonProblem | null {
  let i = 0;
  const bail: (message: string) => never = (message) => {
    throw { index: i, message };
  };
  const ws = () => {
    while (i < src.length && ' \t\n\r'.includes(src[i])) i++;
  };
  const str = () => {
    i++;
    for (;;) {
      const c = src[i];
      if (c === undefined) bail('Unterminated string');
      if (c === '\n') bail('Line break inside a string (use \\n)');
      if (c === '\\') {
        const n = src[i + 1] ?? '';
        if (n === 'u') {
          if (!/^[0-9a-fA-F]{4}$/.test(src.slice(i + 2, i + 6))) bail('Bad \\u escape');
          i += 6;
          continue;
        }
        if (!'"\\/bfnrt'.includes(n)) bail(`Bad escape \\${n}`);
        i += 2;
        continue;
      }
      i++;
      if (c === '"') return;
    }
  };
  const afterComma = (close: string) => {
    i++;
    ws();
    if (src[i] === close) bail(`Trailing comma before ${close}`);
  };
  const value = (): void => {
    ws();
    const c = src[i];
    if (c === undefined) bail('Unexpected end of the document');
    if (c === '{') {
      i++;
      ws();
      if (src[i] === '}') return void i++;
      for (;;) {
        ws();
        if (src[i] !== '"') bail(src[i] === "'" ? 'Keys need double quotes' : 'Expected a quoted key');
        str();
        ws();
        if (src[i] !== ':') bail("Expected ':' after the key");
        i++;
        value();
        ws();
        if (src[i] === ',') {
          afterComma('}');
          continue;
        }
        if (src[i] === '}') return void i++;
        bail("Expected ',' or '}'");
      }
    }
    if (c === '[') {
      i++;
      ws();
      if (src[i] === ']') return void i++;
      for (;;) {
        value();
        ws();
        if (src[i] === ',') {
          afterComma(']');
          continue;
        }
        if (src[i] === ']') return void i++;
        bail("Expected ',' or ']'");
      }
    }
    if (c === '"') return str();
    if (c === "'") bail('Strings need double quotes');
    if (c === '-' || (c >= '0' && c <= '9')) {
      const m = /^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/.exec(src.slice(i));
      if (!m) bail('Malformed number');
      i += m[0].length;
      return;
    }
    for (const w of ['true', 'false', 'null']) {
      if (src.startsWith(w, i)) return void (i += w.length);
    }
    bail(`Unexpected character '${c}'`);
  };
  try {
    value();
    ws();
    if (i < src.length) bail('Unexpected text after the end of the document');
    return null;
  } catch (e) {
    const { index, message } = e as { index: number; message: string };
    const before = src.slice(0, index);
    const line = before.split('\n').length;
    const col = index - before.lastIndexOf('\n');
    return { index, line, col, message };
  }
}

/** Parsed value and, when the text is not JSON, where it stops being one. */
export function useJson(text: string) {
  return useMemo(() => {
    const problem = locateJsonError(text);
    if (problem) return { value: undefined, problem, warnings: [] as string[] };
    try {
      return { value: JSON.parse(text) as unknown, problem: null, warnings: [] as string[] };
    } catch (e) {
      return { value: undefined, problem: { index: 0, line: 1, col: 1, message: (e as Error).message }, warnings: [] as string[] };
    }
  }, [text]);
}

/**
 * A JSON text editor: line numbers, the first error named with its line and column, semantic
 * warnings from `validate`, a Format button, two-space Tab, indentation kept on Enter, Ctrl+S to save.
 */
export function CodeEditor({
  value,
  onChange,
  onSave,
  validate,
  placeholder,
  minHeight = 360,
  allowEmpty = false,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  onSave?: () => void;
  /** Checks a parsed document; the strings come back as warnings under the editor. */
  validate?: (parsed: unknown) => string[];
  placeholder?: string;
  minHeight?: number;
  /** Blank text counts as valid (a nullable document). */
  allowEmpty?: boolean;
  className?: string;
}) {
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const empty = value.trim() === '';
  const parsed = useJson(value);
  const problem = empty && allowEmpty ? null : parsed.problem;
  const warnings = useMemo(() => (!problem && !empty && validate ? validate(parsed.value) : []), [problem, empty, validate, parsed.value]);
  const lines = useMemo(() => value.split('\n').length, [value]);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1400);
    return () => clearTimeout(t);
  }, [copied]);

  const syncScroll = () => {
    if (gutterRef.current && areaRef.current) gutterRef.current.scrollTop = areaRef.current.scrollTop;
  };

  const format = () => {
    if (problem || empty) return;
    onChange(JSON.stringify(parsed.value, null, 2));
  };

  const goToProblem = () => {
    const el = areaRef.current;
    if (!el || !problem) return;
    el.focus();
    el.setSelectionRange(problem.index, Math.min(problem.index + 1, value.length));
    // Scroll the line into view: one line of text is 20px here.
    el.scrollTop = Math.max(0, (problem.line - 4) * 20);
    syncScroll();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    const { selectionStart: s, selectionEnd: en } = el;
    const edit = (next: string, cursor: number) => {
      onChange(next);
      requestAnimationFrame(() => el.setSelectionRange(cursor, cursor));
    };
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      onSave?.();
      return;
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        const lineStart = value.lastIndexOf('\n', s - 1) + 1;
        if (value.startsWith('  ', lineStart)) edit(value.slice(0, lineStart) + value.slice(lineStart + 2), Math.max(lineStart, s - 2));
        return;
      }
      edit(value.slice(0, s) + '  ' + value.slice(en), s + 2);
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      const lineStart = value.lastIndexOf('\n', s - 1) + 1;
      const indent = /^[ \t]*/.exec(value.slice(lineStart, s))?.[0] ?? '';
      const prev = value.slice(0, s).trimEnd().slice(-1);
      const next = value[en] ?? '';
      const opens = prev === '{' || prev === '[';
      const closes = (prev === '{' && next === '}') || (prev === '[' && next === ']');
      const insert = '\n' + indent + (opens ? '  ' : '') + (closes ? '\n' + indent : '');
      edit(value.slice(0, s) + insert + value.slice(en), s + 1 + indent.length + (opens ? 2 : 0));
    }
  };

  return (
    <div className={cn('overflow-hidden rounded-xl border-2 border-[#1c1633]/15 bg-white', className)}>
      <div className="flex flex-wrap items-center gap-2 border-b-2 border-[#1c1633]/10 bg-[#1c1633]/[0.03] px-3 py-1.5 text-xs">
        {problem ? (
          <button type="button" onClick={goToProblem} className="inline-flex items-center gap-1.5 font-bold text-red-700 hover:underline">
            <TriangleAlert size={13} /> Line {problem.line}, column {problem.col}: {problem.message}
          </button>
        ) : (
          <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700">
            <Check size={13} /> {empty ? 'Empty' : 'Valid JSON'}
            <span className="font-medium text-[#1c1633]/50">
              · {lines} line{lines === 1 ? '' : 's'}
            </span>
          </span>
        )}
        <span className="ml-auto flex items-center gap-1">
          <button type="button" onClick={format} disabled={!!problem || empty} className="adm-btn !py-1 !text-[0.7rem] !shadow-none disabled:opacity-40">
            <AlignLeft size={12} /> Format
          </button>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(value).then(() => setCopied(true), () => {})}
            className="adm-btn !py-1 !text-[0.7rem] !shadow-none"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? 'Copied' : 'Copy'}
          </button>
        </span>
      </div>

      <div className="relative flex" style={{ minHeight }}>
        <div ref={gutterRef} aria-hidden="true" className="w-12 shrink-0 select-none overflow-hidden border-r-2 border-[#1c1633]/10 bg-[#1c1633]/[0.03] py-3 text-right font-mono text-xs leading-5 text-[#1c1633]/40">
          {Array.from({ length: lines }, (_, n) => (
            <div key={n} className={cn('pr-2', problem && problem.line === n + 1 && 'bg-red-100 font-bold text-red-700')}>
              {n + 1}
            </div>
          ))}
          <div className="h-full" />
        </div>
        <textarea
          ref={areaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={syncScroll}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          wrap="off"
          className="min-w-0 flex-1 resize-y bg-transparent px-3 py-3 font-mono text-xs leading-5 text-[#1c1633] outline-none placeholder:text-[#1c1633]/35"
          style={{ minHeight, tabSize: 2 }}
        />
      </div>

      {warnings.length > 0 && (
        <ul className="space-y-1 border-t-2 border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900">
          {warnings.map((w) => (
            <li key={w} className="flex gap-1.5">
              <TriangleAlert size={13} className="mt-0.5 shrink-0" /> {w}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
