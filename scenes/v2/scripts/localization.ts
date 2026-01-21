/**
 * Localization Review Tool
 *
 * Checks all JSON files for:
 * - Complete ru/en translations
 * - Consistent translation quality
 * - Missing translations
 */

// Types
export interface LocalizationIssue {
  file: string;
  path: string;
  type: 'missing_ru' | 'missing_en' | 'empty' | 'mismatch_length';
  details: string;
}

export interface LocalizationReport {
  totalFields: number;
  completeFields: number;
  issues: LocalizationIssue[];
  byType: {
    missing_ru: number;
    missing_en: number;
    empty: number;
    mismatch_length: number;
  };
}

/**
 * Check a localized string object
 */
function checkLocalizedString(
  obj: any,
  file: string,
  path: string
): LocalizationIssue[] {
  const issues: LocalizationIssue[] = [];

  if (!obj || typeof obj !== 'object') {
    return issues;
  }

  // Check for missing translations
  if (!('ru' in obj)) {
    issues.push({
      file,
      path,
      type: 'missing_ru',
      details: 'Russian translation missing',
    });
  } else if (!obj.ru || obj.ru.trim() === '') {
    issues.push({
      file,
      path,
      type: 'empty',
      details: 'Russian translation is empty',
    });
  }

  if (!('en' in obj)) {
    issues.push({
      file,
      path,
      type: 'missing_en',
      details: 'English translation missing',
    });
  } else if (!obj.en || obj.en.trim() === '') {
    issues.push({
      file,
      path,
      type: 'empty',
      details: 'English translation is empty',
    });
  }

  // Check for significant length mismatch (might indicate incomplete translation)
  if (obj.ru && obj.en) {
    const ruLen = obj.ru.length;
    const enLen = obj.en.length;
    // Allow for language differences, but flag if one is much shorter
    if (ruLen > 0 && enLen > 0) {
      const ratio = Math.max(ruLen, enLen) / Math.min(ruLen, enLen);
      // Russian is often longer, but if ratio > 3, might be an issue
      if (ratio > 3 && Math.abs(ruLen - enLen) > 50) {
        issues.push({
          file,
          path,
          type: 'mismatch_length',
          details: `Significant length difference: ru=${ruLen}, en=${enLen}`,
        });
      }
    }
  }

  return issues;
}

/**
 * Recursively find all localized strings in an object
 */
function findLocalizedStrings(
  obj: any,
  file: string,
  path: string = ''
): { fields: number; issues: LocalizationIssue[] } {
  let fields = 0;
  let issues: LocalizationIssue[] = [];

  if (!obj || typeof obj !== 'object') {
    return { fields, issues };
  }

  // Check if this is a localized string object
  if ('ru' in obj || 'en' in obj) {
    fields++;
    issues = issues.concat(checkLocalizedString(obj, file, path));
    return { fields, issues };
  }

  // Recursively check nested objects and arrays
  if (Array.isArray(obj)) {
    obj.forEach((item, idx) => {
      const result = findLocalizedStrings(item, file, `${path}[${idx}]`);
      fields += result.fields;
      issues = issues.concat(result.issues);
    });
  } else {
    for (const [key, value] of Object.entries(obj)) {
      if (key.startsWith('_')) continue; // Skip commented fields

      const newPath = path ? `${path}.${key}` : key;

      // Known localized fields
      const localizedKeys = [
        'title', 'subtitle', 'description', 'label', 'question',
        'instruction', 'text', 'name', 'insight', 'potential',
      ];

      if (localizedKeys.includes(key) && typeof value === 'object') {
        fields++;
        issues = issues.concat(checkLocalizedString(value, file, newPath));
      } else if (typeof value === 'object') {
        const result = findLocalizedStrings(value, file, newPath);
        fields += result.fields;
        issues = issues.concat(result.issues);
      }
    }
  }

  return { fields, issues };
}

/**
 * Check a single file for localization issues
 */
export function checkFile(content: any, filename: string): LocalizationReport {
  const { fields, issues } = findLocalizedStrings(content, filename);

  return {
    totalFields: fields,
    completeFields: fields - issues.filter(i =>
      i.type === 'missing_ru' || i.type === 'missing_en' || i.type === 'empty'
    ).length,
    issues,
    byType: {
      missing_ru: issues.filter(i => i.type === 'missing_ru').length,
      missing_en: issues.filter(i => i.type === 'missing_en').length,
      empty: issues.filter(i => i.type === 'empty').length,
      mismatch_length: issues.filter(i => i.type === 'mismatch_length').length,
    },
  };
}

/**
 * Merge multiple reports
 */
export function mergeReports(reports: LocalizationReport[]): LocalizationReport {
  return reports.reduce((acc, report) => ({
    totalFields: acc.totalFields + report.totalFields,
    completeFields: acc.completeFields + report.completeFields,
    issues: acc.issues.concat(report.issues),
    byType: {
      missing_ru: acc.byType.missing_ru + report.byType.missing_ru,
      missing_en: acc.byType.missing_en + report.byType.missing_en,
      empty: acc.byType.empty + report.byType.empty,
      mismatch_length: acc.byType.mismatch_length + report.byType.mismatch_length,
    },
  }), {
    totalFields: 0,
    completeFields: 0,
    issues: [],
    byType: { missing_ru: 0, missing_en: 0, empty: 0, mismatch_length: 0 },
  });
}

/**
 * Print localization report
 */
export function printReport(report: LocalizationReport): void {
  console.log('\n=== Localization Report ===\n');

  const completionRate = report.totalFields > 0
    ? ((report.completeFields / report.totalFields) * 100).toFixed(1)
    : '100';

  console.log(`Total localized fields: ${report.totalFields}`);
  console.log(`Complete fields: ${report.completeFields}`);
  console.log(`Completion rate: ${completionRate}%`);
  console.log('');

  console.log('Issues by type:');
  console.log(`  Missing Russian: ${report.byType.missing_ru}`);
  console.log(`  Missing English: ${report.byType.missing_en}`);
  console.log(`  Empty values: ${report.byType.empty}`);
  console.log(`  Length mismatch: ${report.byType.mismatch_length}`);
  console.log('');

  if (report.issues.length > 0) {
    console.log('Issues found:');
    for (const issue of report.issues.slice(0, 20)) {
      console.log(`  [${issue.type}] ${issue.file}: ${issue.path}`);
      console.log(`    ${issue.details}`);
    }

    if (report.issues.length > 20) {
      console.log(`  ... and ${report.issues.length - 20} more issues`);
    }
  } else {
    console.log('No issues found!');
  }

  console.log('');
}

/**
 * Common translation patterns to check
 */
export const translationPatterns = {
  // Common UI terms
  ui: {
    'Tap on body zones': 'Нажми на зоны тела',
    'What appeals?': 'Что привлекает?',
    'What excites?': 'Что возбуждает?',
    'What scenarios?': 'Какие сценарии?',
    'What actions?': 'Какие действия?',
    'What elements?': 'Какие элементы?',
    'How does it feel?': 'Какие ощущения?',
  },

  // Common scene terms
  scene: {
    'He': 'Он',
    'She': 'Она',
    'Him': 'Его',
    'Her': 'Её',
    'Give': 'Давать',
    'Receive': 'Получать',
    'Dominant': 'Доминант',
    'Submissive': 'Сабмиссив',
  },

  // Intensity labels
  intensity: {
    'Vanilla': 'Ванильный',
    'Light kink': 'Лёгкий кинк',
    'Moderate kink': 'Умеренный кинк',
    'Advanced kink': 'Продвинутый кинк',
    'Extreme': 'Экстрим',
  },
};

/**
 * Check consistency of translations
 */
export function checkConsistency(content: any, patterns: Record<string, string>): {
  consistent: string[];
  inconsistent: { en: string; expected: string; found: string }[];
} {
  const consistent: string[] = [];
  const inconsistent: { en: string; expected: string; found: string }[] = [];

  function check(obj: any) {
    if (!obj || typeof obj !== 'object') return;

    if ('en' in obj && 'ru' in obj) {
      const en = obj.en.trim();
      const ru = obj.ru.trim();

      if (patterns[en]) {
        if (ru === patterns[en]) {
          consistent.push(en);
        } else if (!ru.includes(patterns[en])) {
          inconsistent.push({
            en,
            expected: patterns[en],
            found: ru,
          });
        }
      }
      return;
    }

    if (Array.isArray(obj)) {
      obj.forEach(check);
    } else {
      Object.values(obj).forEach(check);
    }
  }

  check(content);
  return { consistent, inconsistent };
}

/**
 * Export translation strings for external review
 */
export function exportTranslations(
  content: any,
  filename: string
): { path: string; ru: string; en: string }[] {
  const translations: { path: string; ru: string; en: string }[] = [];

  function extract(obj: any, path: string = '') {
    if (!obj || typeof obj !== 'object') return;

    if ('ru' in obj && 'en' in obj) {
      translations.push({
        path,
        ru: obj.ru,
        en: obj.en,
      });
      return;
    }

    if (Array.isArray(obj)) {
      obj.forEach((item, idx) => extract(item, `${path}[${idx}]`));
    } else {
      for (const [key, value] of Object.entries(obj)) {
        if (key.startsWith('_')) continue;
        extract(value, path ? `${path}.${key}` : key);
      }
    }
  }

  extract(content);
  return translations;
}

/**
 * Generate CSV for translation review
 */
export function generateTranslationCSV(
  translations: { path: string; ru: string; en: string }[]
): string {
  const lines = ['Path,English,Russian'];

  for (const t of translations) {
    const en = t.en.replace(/"/g, '""');
    const ru = t.ru.replace(/"/g, '""');
    lines.push(`"${t.path}","${en}","${ru}"`);
  }

  return lines.join('\n');
}

export default {
  checkFile,
  mergeReports,
  printReport,
  translationPatterns,
  checkConsistency,
  exportTranslations,
  generateTranslationCSV,
};
