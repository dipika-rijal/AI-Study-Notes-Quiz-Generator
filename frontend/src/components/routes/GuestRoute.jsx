export default function GuestRoute({ children }) {
  // Sign-in navigation is handled explicitly after the auth session has been
  // established. Redirecting from an auth-state listener can otherwise
  // unmount the sign-up form while the user is entering credentials.
  return children;
}
