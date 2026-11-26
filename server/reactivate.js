// Put a deleted profile back on the live list with the same profile ID.
export function reactivateDeleted(state, id) {
  const deleted = state.deletedProfiles || [];
  const current = deleted.find((item) => item.id === id);
  if (!current) return { error: 'not-found' };
  const live = state.profiles || [];
  const taken = live.some((item) => item.id === current.id || (current.profileId && item.profileId === current.profileId));
  if (taken) return { error: 'already-active' };
  const restored = { ...current };
  delete restored.deletedAt;
  delete restored.deletedBy;
  if (restored.profileId) {
    restored.approvalStatus = 'approved';
    restored.showInSearch = true;
    restored.rejectedReason = null;
  } else {
    restored.approvalStatus = 'pending';
    restored.showInSearch = false;
  }
  return {
    profile: restored,
    state: {
      ...state,
      profiles: [...live, restored],
      deletedProfiles: deleted.filter((item) => item.id !== current.id)
    }
  };
}
