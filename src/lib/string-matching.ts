// ============================================================
// Smart String Matching Engine
// Uses Levenshtein distance to accept near-correct answers
// and distinguish typos from wrong answers.
// ============================================================

/**
 * Normalises a string for comparison: lowercases, strips
 * punctuation, and collapses whitespace.
 */
export function normalizeString(str: string): string {
    return str
        .toLowerCase()
        .replace(/[.,;:!?¿¡'"'""«»()[\]{}\-–—…]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

/**
 * Classic Levenshtein distance (DP matrix).
 * Returns the minimum number of single-character edits
 * (insertions, deletions, substitutions) to transform `a` into `b`.
 */
export function levenshteinDistance(a: string, b: string): number {
    const m = a.length;
    const n = b.length;

    // Fast exits
    if (m === 0) return n;
    if (n === 0) return m;

    const dp: number[][] = Array.from({ length: m + 1 }, () =>
        Array(n + 1).fill(0)
    );

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            dp[i][j] = Math.min(
                dp[i - 1][j] + 1,       // deletion
                dp[i][j - 1] + 1,       // insertion
                dp[i - 1][j - 1] + cost  // substitution
            );
        }
    }

    return dp[m][n];
}

type MatchResult = {
    isCorrect: boolean;
    isTypo: boolean;
};

/**
 * Determines whether a user's typed answer is acceptable.
 *
 * - Exact match (after normalisation) → correct, no typo.
 * - Edit distance ≤ 1 → accepted as typo.
 * - Edit distance ≤ 2 for words longer than 7 chars → accepted as typo.
 * - Otherwise → incorrect.
 */
export function isAnswerAcceptable(
    userInput: string,
    correctAnswer: string
): MatchResult {
    const a = normalizeString(userInput);
    const b = normalizeString(correctAnswer);

    // Exact match
    if (a === b) {
        return { isCorrect: true, isTypo: false };
    }

    const distance = levenshteinDistance(a, b);
    const maxTypoDistance = b.length > 7 ? 2 : 1;

    if (distance <= maxTypoDistance) {
        return { isCorrect: true, isTypo: true };
    }

    return { isCorrect: false, isTypo: false };
}
