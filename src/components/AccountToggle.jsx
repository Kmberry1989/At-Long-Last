import { useFirebaseApp } from '../features/couple/FirebaseAppContext.jsx'

export function AccountToggle() {
  const { authWorking, enabled, isSignedIn, signOutUser } = useFirebaseApp()

  if (!enabled || !isSignedIn) {
    return null
  }

  return (
    <button
      aria-label="Sign out of At Long Last"
      className="account-toggle"
      disabled={authWorking}
      onClick={signOutUser}
      type="button"
    >
      Sign Out
    </button>
  )
}
