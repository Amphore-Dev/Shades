function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-md">
        <h1 className="text-4xl font-bold text-indigo-600 mb-4">Shades</h1>
        <p className="text-gray-600 text-lg mb-6">
          React + TypeScript + Tailwind CSS example
        </p>
        <div className="flex gap-3 justify-center">
          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
            React 19
          </span>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            TypeScript 6
          </span>
          <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">
            Tailwind 4
          </span>
        </div>
      </div>
    </div>
  );
}

export default App;
