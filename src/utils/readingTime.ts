/**
 * 記事の読了時間を推定する
 * @param content - 記事の本文
 * @param lang - 言語（'ja' または 'en'）
 * @returns 読了時間（分）
 */
export function estimateReadingTime(content: string, lang: 'ja' | 'en'): number {
  // コードブロックを抽出して別カウント
  const codeBlocks: string[] = [];
  const textWithoutCode = content.replace(/```[\s\S]*?```/g, (match) => {
    codeBlocks.push(match);
    return '';
  });

  // HTMLタグとMarkdown記法を除去（本文のみ）
  const text = textWithoutCode
    .replace(/<[^>]*>/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/[#*_\[\]()]/g, '');

  // コードブロックの行数を合計（読解速度: 約10行/分）
  const codeLines = codeBlocks.reduce((sum, block) => {
    const lines = block.split('\n').length - 2; // ``` の開始・終了行を除く
    return sum + Math.max(0, lines);
  }, 0);
  const codeMinutes = codeLines / 10;

  let textMinutes: number;
  if (lang === 'ja') {
    // 日本語: 400-600文字/分
    const chars = text.length;
    textMinutes = chars / 500;
  } else {
    // 英語: 200-250単語/分
    const words = text.trim().split(/\s+/).length;
    textMinutes = words / 225;
  }

  return Math.max(1, Math.ceil(textMinutes + codeMinutes));
}

/**
 * カテゴリーに対応するアイコンSVGを返す
 */
export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    htb: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>`,
    'daily-alpacahack': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>`,
    lang: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
    misc: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`,
  };
  return icons[category] || icons.misc;
}
