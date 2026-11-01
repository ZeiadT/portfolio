/**
 * Zero-dependency syntax tokenizer for code snippets.
 * Supports Kotlin, Swift, Dart, and C# with HTML escaping and Tailwind v4 classes.
 */

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const KOTLIN_KEYWORDS = new Set([
  'actual', 'abstract', 'annotation', 'as', 'break', 'by', 'catch', 'class',
  'companion', 'const', 'constructor', 'continue', 'crossinline', 'data',
  'delegate', 'do', 'dynamic', 'else', 'enum', 'expect', 'external', 'false',
  'field', 'file', 'final', 'finally', 'for', 'fun', 'get', 'if', 'import',
  'in', 'infix', 'init', 'inline', 'inner', 'interface', 'internal', 'is',
  'lateinit', 'noinline', 'null', 'object', 'open', 'operator', 'out',
  'override', 'package', 'param', 'private', 'property', 'protected', 'public',
  'receiver', 'reified', 'return', 'sealed', 'set', 'setparam', 'super',
  'suspend', 'tailrec', 'this', 'throw', 'true', 'try', 'typealias', 'val',
  'var', 'vararg', 'when', 'where', 'while', 'yield', 'flow', 'emit'
]);

const SWIFT_KEYWORDS = new Set([
  'actor', 'any', 'as', 'associatedtype', 'async', 'await', 'break', 'case',
  'catch', 'class', 'continue', 'default', 'defer', 'deinit', 'do', 'else',
  'enum', 'extension', 'fallthrough', 'false', 'fileprivate', 'final', 'for',
  'func', 'guard', 'if', 'import', 'in', 'init', 'inout', 'internal', 'is',
  'isolated', 'lazy', 'let', 'mutating', 'nil', 'nonisolated', 'open',
  'operator', 'override', 'private', 'protocol', 'public', 'repeat', 'required',
  'rethrows', 'return', 'self', 'Self', 'some', 'static', 'struct', 'subscript',
  'super', 'switch', 'throw', 'throws', 'true', 'try', 'typealias', 'var',
  'weak', 'where', 'while'
]);

const DART_KEYWORDS = new Set([
  'abstract', 'as', 'assert', 'async', 'await', 'base', 'break', 'case',
  'catch', 'class', 'const', 'continue', 'covariant', 'default', 'deferred',
  'do', 'dynamic', 'else', 'enum', 'export', 'extends', 'extension', 'external',
  'factory', 'false', 'final', 'finally', 'for', 'Function', 'get', 'hide',
  'if', 'implements', 'import', 'in', 'interface', 'is', 'late', 'library',
  'mixin', 'new', 'null', 'of', 'on', 'operator', 'part', 'required', 'rethrow',
  'return', 'sealed', 'set', 'show', 'static', 'super', 'switch', 'sync',
  'this', 'throw', 'true', 'try', 'typedef', 'var', 'void', 'when', 'while',
  'with', 'yield'
]);

const CSHARP_KEYWORDS = new Set([
  'abstract', 'as', 'async', 'await', 'base', 'bool', 'break', 'byte',
  'case', 'catch', 'char', 'checked', 'class', 'const', 'continue', 'decimal',
  'default', 'delegate', 'do', 'double', 'else', 'enum', 'event', 'explicit',
  'extern', 'false', 'finally', 'fixed', 'float', 'for', 'foreach', 'goto',
  'if', 'implicit', 'in', 'int', 'interface', 'internal', 'is', 'lock',
  'long', 'namespace', 'new', 'null', 'object', 'operator', 'out', 'override',
  'params', 'private', 'protected', 'public', 'readonly', 'record', 'ref',
  'return', 'sbyte', 'sealed', 'short', 'sizeof', 'stackalloc', 'static',
  'string', 'struct', 'switch', 'this', 'throw', 'true', 'try', 'typeof',
  'uint', 'ulong', 'unchecked', 'unsafe', 'ushort', 'using', 'var', 'virtual',
  'void', 'volatile', 'while', 'yield'
]);

const LANGUAGE_KEYWORDS: Record<string, Set<string>> = {
  kotlin: KOTLIN_KEYWORDS,
  swift: SWIFT_KEYWORDS,
  dart: DART_KEYWORDS,
  csharp: CSHARP_KEYWORDS,
};

const LANGUAGE_ALIASES: Record<string, string> = {
  kotlin: 'kotlin',
  kt: 'kotlin',
  swift: 'swift',
  dart: 'dart',
  csharp: 'csharp',
  cs: 'csharp',
  'c#': 'csharp',
};

const TOKEN_REGEX = /(\/\/[^\r\n]*|\/\*[\s\S]*?\*\/)|("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(@[a-zA-Z_][a-zA-Z0-9_]*)|(\b(?:0[xX][0-9a-fA-F]+|0[bB][01]+|\d+(?:\.\d+)?(?:[fFdDlLmMuU])?)\b)|([a-zA-Z_][a-zA-Z0-9_]*)|([\s\S])/g;

/**
 * Tokenize a source code snippet into an HTML string with Tailwind v4 styling spans.
 * Escapes raw HTML entities to strictly prevent XSS.
 */
export function tokenizeCode(code: string, language: string): string {
  if (!code) {
    return '';
  }

  const rawLang = language ? language.toLowerCase().trim() : '';
  const normalizedLang = LANGUAGE_ALIASES[rawLang] || rawLang;
  const keywords = LANGUAGE_KEYWORDS[normalizedLang];

  if (!keywords) {
    return escapeHtml(code);
  }

  return code.replace(
    TOKEN_REGEX,
    (_match, comment, str, annotation, num, ident, other) => {
      if (comment !== undefined) {
        return `<span class="text-neutral-500">${escapeHtml(comment)}</span>`;
      }
      if (str !== undefined) {
        return `<span class="text-emerald-400">${escapeHtml(str)}</span>`;
      }
      if (annotation !== undefined) {
        return `<span class="text-amber-400">${escapeHtml(annotation)}</span>`;
      }
      if (num !== undefined) {
        return `<span class="text-emerald-400">${escapeHtml(num)}</span>`;
      }
      if (ident !== undefined) {
        if (keywords.has(ident)) {
          return `<span class="text-sky-400">${escapeHtml(ident)}</span>`;
        }
        if (/^[A-Z][A-Za-z0-9_]*$/.test(ident)) {
          return `<span class="text-purple-400">${escapeHtml(ident)}</span>`;
        }
        return escapeHtml(ident);
      }
      return escapeHtml(other);
    }
  );
}
