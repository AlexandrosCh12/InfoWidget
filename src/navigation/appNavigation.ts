/**
 * Single place for app screen IDs and shell transition resolution.
 * Screens: onboarding → first-run; compact → widget strip; expanded → feed or detail; settings → overlay.
 */
export type AppScreen = 'onboarding' | 'compact' | 'expanded' | 'settings'

export type ShellTransition = 'toSettings' | 'fromSettings' | 'default'

export function resolveShellTransition(
  previous: AppScreen | null,
  next: AppScreen,
): ShellTransition {
  if (previous !== 'settings' && next === 'settings') return 'toSettings'
  if (previous === 'settings' && next !== 'settings') return 'fromSettings'
  return 'default'
}

/** Expanded area is feed vs detail; driven by `selectedItem` in the store, not `viewMode`. */
export type ExpandedSubView = 'feed' | 'detail'
