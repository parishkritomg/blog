export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] w-full">
      <div className="relative flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-100 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-black rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-sm text-gray-500 font-medium animate-pulse">Loading...</p>
      </div>
    </div>
  );
}
