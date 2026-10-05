// Reuse the server's entitlement resolver for both class and personal access.
// Fail closed on network, authentication, and account errors.
export async function studentHasProgramAccess(checkProgramAccess, programId) {
  const response = await checkProgramAccess({ programId });
  if (typeof response.data?.hasAccess !== 'boolean') {
    throw new Error('Could not verify program access.');
  }
  return response.data.hasAccess;
}
