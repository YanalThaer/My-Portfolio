/** First letter of the header logo text, then the public name. */
export function monogramLetter(logo?: string, name?: string): string {
  const source = String(logo || name || '').trim();
  const match = source.match(/\p{L}/u);
  if (!match) {
    return '';
  }
  return match[0].toLocaleUpperCase('en-US');
}

export function isWideMonogram(letter: string): boolean {
  return /[MWم]/i.test(letter);
}
