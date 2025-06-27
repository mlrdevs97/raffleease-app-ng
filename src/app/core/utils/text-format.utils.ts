/**
 * Capitalizes the first letter of a word while preserving accented characters
 * @param word - The word to capitalize
 * @returns The capitalized word
 */
export function capitalizeWord(word: string): string {
  if (!word) return word;
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/**
 * Formats a name string with proper capitalization
 * Handles special cases like apostrophes, hyphens, and accented characters
 * @param value - The name string to format
 * @returns The properly formatted name
 */
export function formatName(value: string): string {
  if (!value || typeof value !== 'string') {
    return '';
  }

  return value
    .toLowerCase()
    .split(' ')
    .map(word => {
      if (!word) return word;
      
      // Handle words with apostrophes (e.g., O'Connor, D'Angelo)
      if (word.includes("'")) {
        return word
          .split("'")
          .map(part => capitalizeWord(part))
          .join("'");
      }
      
      // Handle words with hyphens (e.g., Mary-Jane, Jean-Pierre)
      if (word.includes('-')) {
        return word
          .split('-')
          .map(part => capitalizeWord(part))
          .join('-');
      }
      
      return capitalizeWord(word);
    })
    .join(' ')
    .trim();
}

/**
 * Formats multiple names at once
 * @param names - Array of name strings to format
 * @returns Array of properly formatted names
 */
export function formatNames(names: string[]): string[] {
  return names.map(name => formatName(name));
}

/**
 * Formats a full name object with firstName and lastName
 * @param nameObject - Object containing firstName and lastName properties
 * @returns Object with formatted firstName and lastName
 */
export function formatNameObject<T extends { firstName: string; lastName: string }>(
  nameObject: T
): T {
  return {
    ...nameObject,
    firstName: formatName(nameObject.firstName),
    lastName: formatName(nameObject.lastName)
  };
} 