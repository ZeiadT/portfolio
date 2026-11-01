import { describe, it, expect } from 'vitest';
import { tokenizeCode } from '../codeTokenizer';

describe('codeTokenizer Utility', () => {
  it('escapes raw HTML to prevent XSS injection', () => {
    const input = 'val tag = "<script>alert(1)</script>" & a < b';
    const output = tokenizeCode(input, 'kotlin');
    expect(output).not.toContain('<script>');
    expect(output).toContain('&lt;script&gt;');
    expect(output).toContain('&amp;');
  });

  it('tokenizes Kotlin keywords and annotations', () => {
    const code = '@Composable\nsuspend fun loadWeather(): Flow<Forecast> = flow { emit(data) }';
    const output = tokenizeCode(code, 'kotlin');
    expect(output).toContain('text-amber-400'); // annotation
    expect(output).toContain('text-sky-400'); // keyword
    expect(output).toContain('Flow');
  });

  it('tokenizes Swift keywords and comments', () => {
    const code = '// Fetch fixtures\nfunc fetchFixtures() async throws -> [Fixture]';
    const output = tokenizeCode(code, 'swift');
    expect(output).toContain('text-neutral-500'); // comment
    expect(output).toContain('text-sky-400'); // func, async
  });

  it('handles empty code or unknown language gracefully', () => {
    expect(tokenizeCode('', 'kotlin')).toBe('');
    expect(tokenizeCode('val x = 10', 'unknown')).toContain('val x = 10');
  });

  it('tokenizes Dart and C# languages properly', () => {
    const dartCode = '@override\nWidget build(BuildContext context) {\n  // build widget\n  return Container();\n}';
    const dartOutput = tokenizeCode(dartCode, 'dart');
    expect(dartOutput).toContain('text-amber-400'); // @override
    expect(dartOutput).toContain('text-sky-400'); // return
    expect(dartOutput).toContain('text-neutral-500'); // comment

    const csharpCode = 'public async Task<int> CalculateAsync() { return 42; }';
    const csharpOutput = tokenizeCode(csharpCode, 'csharp');
    expect(csharpOutput).toContain('text-sky-400'); // public, async, return
    expect(csharpOutput).toContain('text-emerald-400'); // numbers or strings
  });

  it('tokenizes string literals with quotes', () => {
    const code = 'val greeting = "Hello, World!"';
    const output = tokenizeCode(code, 'kotlin');
    expect(output).toContain('text-emerald-400');
    expect(output).toContain('&quot;Hello, World!&quot;');
  });

  it('handles multi-line comments and strings properly', () => {
    const code = '/* multi\n * line\n * comment */\nval multi = """hello\nworld"""';
    const output = tokenizeCode(code, 'kotlin');
    expect(output).toContain('text-neutral-500');
    expect(output).toContain('text-emerald-400');
  });

  it('escapes HTML special characters even in unknown languages', () => {
    const untrusted = '<script>evil()</script> & 1 < 2';
    const output = tokenizeCode(untrusted, 'brainfuck');
    expect(output).not.toContain('<script>');
    expect(output).toContain('&lt;script&gt;');
    expect(output).toContain('&amp;');
    expect(output).toContain('&lt;');
  });

  it('handles hex numbers and floats', () => {
    const code = 'val mask = 0xFF; val pi = 3.14f';
    const output = tokenizeCode(code, 'kotlin');
    expect(output).toContain('0xFF');
    expect(output).toContain('3.14f');
    expect(output).toContain('text-emerald-400');
  });
});
