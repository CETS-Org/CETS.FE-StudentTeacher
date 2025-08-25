export default function Footer() {
  return (
    <footer className="bg-neutral-0 border-t">
      <div className="mx-auto max-w-7xl px-4 py-4 text-sm text-neutral-600 flex items-center justify-between">
        <p>
          &copy; {new Date().getFullYear()} CETS. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-neutral-900">Privacy</a>
          <a href="#" className="hover:text-neutral-900">Terms</a>
          <a href="#" className="hover:text-neutral-900">Support</a>
        </div>
      </div>
    </footer>
  );
}
