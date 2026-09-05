const MAX_EXPRESSION_LENGTH = 200;

class ArithmeticParser {
  private position = 0;
  private readonly input: string;

  constructor(input: string) {
    this.input = input;
  }

  parse(): number {
    const result = this.parseExpression();
    this.skipWhitespace();
    if (this.position !== this.input.length) {
      throw new Error(`Unexpected token at position ${this.position + 1}.`);
    }
    if (!Number.isFinite(result)) {
      throw new Error("The result is not a finite number.");
    }
    return result;
  }

  private parseExpression(): number {
    let value = this.parseTerm();
    while (true) {
      if (this.match("+")) value += this.parseTerm();
      else if (this.match("-")) value -= this.parseTerm();
      else return value;
    }
  }

  private parseTerm(): number {
    let value = this.parseUnary();
    while (true) {
      if (this.match("*")) value *= this.parseUnary();
      else if (this.match("/")) {
        const divisor = this.parseUnary();
        if (divisor === 0) throw new Error("Division by zero is not allowed.");
        value /= divisor;
      } else if (this.match("%")) {
        const divisor = this.parseUnary();
        if (divisor === 0) throw new Error("Modulo by zero is not allowed.");
        value %= divisor;
      } else return value;
    }
  }

  private parseUnary(): number {
    if (this.match("+")) return this.parseUnary();
    if (this.match("-")) return -this.parseUnary();
    return this.parsePower();
  }

  private parsePower(): number {
    const base = this.parsePrimary();
    if (!this.match("^")) return base;
    return base ** this.parseUnary();
  }

  private parsePrimary(): number {
    if (this.match("(")) {
      const value = this.parseExpression();
      if (!this.match(")")) throw new Error("Missing closing parenthesis.");
      return value;
    }

    this.skipWhitespace();
    const remainder = this.input.slice(this.position);
    const numberMatch = remainder.match(/^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/);
    if (!numberMatch) {
      throw new Error(`Expected a number at position ${this.position + 1}.`);
    }
    this.position += numberMatch[0].length;
    return Number(numberMatch[0]);
  }

  private match(token: string): boolean {
    this.skipWhitespace();
    if (!this.input.startsWith(token, this.position)) return false;
    this.position += token.length;
    return true;
  }

  private skipWhitespace(): void {
    while (/\s/.test(this.input[this.position] ?? "")) this.position++;
  }
}

export function evaluateArithmetic(expression: string): string {
  const trimmed = expression
    .trim()
    .replace(/\\(?:times|cdot)/g, "*")
    .replace(/\\div/g, "/")
    .replace(/[×·]/g, "*")
    .replace(/÷/g, "/")
    .replace(/[−–—]/g, "-")
    .replace(/\*\*/g, "^");
  if (!trimmed) throw new Error("The expression is empty.");
  if (trimmed.length > MAX_EXPRESSION_LENGTH) {
    throw new Error(`The expression is limited to ${MAX_EXPRESSION_LENGTH} characters.`);
  }
  if (!/^[\d\s+\-*/%^().eE]+$/.test(trimmed)) {
    throw new Error("The expression contains unsupported characters.");
  }

  const result = new ArithmeticParser(trimmed).parse();
  return Object.is(result, -0) ? "0" : String(result);
}
