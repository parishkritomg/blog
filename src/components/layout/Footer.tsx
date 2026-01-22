export function Footer() {
  return (
    <footer className="w-full py-12 mt-auto">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <p className="text-sm text-gray-400">
          &copy; {new Date().getFullYear()} Parishkrit Bastakoti. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
