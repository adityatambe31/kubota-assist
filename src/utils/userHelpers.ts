/**
 * Extracts a clean username from an email address
 * Examples:
 * - john.doe@company.com -> John Doe
 * - jdoe@xyz.com -> jdoe
 * - firstname.lastname@domain.co -> Firstname Lastname
 * - admin@kubota.com -> admin
 */
export function extractUsernameFromEmail(email: string): string {
  if (!email) return "";

  // Get the part before @ symbol
  const username = email.split("@")[0];

  // If username contains dots, split and capitalize each part
  if (username.includes(".")) {
    return username
      .split(".")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ");
  }

  // If it's a simple username, return as is
  return username;
}

/**
 * Gets display name from user data (firstName + lastName) or falls back to email username
 */
export function getUserDisplayName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  email: string
): string {
  // If we have both first and last name, use them
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }

  // If we have only first name, use it
  if (firstName) {
    return firstName;
  }

  // Fall back to extracting username from email
  return extractUsernameFromEmail(email);
}
