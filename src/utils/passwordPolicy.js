export const PASSWORD_REQUIREMENTS = {
  minimumLength: 8,
};

export function isStrongPassword(password) {
  return (
    typeof password === "string" &&
    password.length >= PASSWORD_REQUIREMENTS.minimumLength &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}
