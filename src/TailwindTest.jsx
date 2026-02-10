import React from 'react';

/**
 * Tailwind CSS Test Page
 * This component tests various Tailwind utilities to verify proper installation
 */
function TailwindTest() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-[#F7D047] animate-pulse">
            🎨 Tailwind CSS Test
          </h1>
          <p className="text-xl text-gray-300">
            Verifying Tailwind CSS installation with black & yellow theme
          </p>
        </div>

        {/* Test Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 - Colors */}
          <div className="bg-gradient-to-br from-zinc-900 to-black border-2 border-[#F7D047]/30 rounded-2xl p-6 hover:scale-105 transition-transform duration-300 shadow-lg shadow-[#F7D047]/20">
            <h2 className="text-2xl font-bold text-[#F7D047] mb-4">Colors</h2>
            <div className="space-y-2">
              <div className="w-full h-8 bg-[#F7D047] rounded"></div>
              <div className="w-full h-8 bg-black rounded"></div>
              <div className="w-full h-8 bg-zinc-900 rounded"></div>
              <div className="w-full h-8 bg-zinc-700 rounded"></div>
            </div>
          </div>

          {/* Card 2 - Typography */}
          <div className="bg-gradient-to-br from-zinc-900 to-black border-2 border-[#F7D047]/30 rounded-2xl p-6 hover:scale-105 transition-transform duration-300 shadow-lg shadow-[#F7D047]/20">
            <h2 className="text-2xl font-bold text-[#F7D047] mb-4">Typography</h2>
            <p className="text-sm text-gray-400">Small text</p>
            <p className="text-base text-gray-300">Base text</p>
            <p className="text-lg text-gray-200">Large text</p>
            <p className="text-xl font-bold text-white">Extra large</p>
          </div>

          {/* Card 3 - Spacing */}
          <div className="bg-gradient-to-br from-zinc-900 to-black border-2 border-[#F7D047]/30 rounded-2xl p-6 hover:scale-105 transition-transform duration-300 shadow-lg shadow-[#F7D047]/20">
            <h2 className="text-2xl font-bold text-[#F7D047] mb-4">Spacing</h2>
            <div className="space-y-2">
              <div className="p-2 bg-zinc-800 rounded">p-2</div>
              <div className="p-4 bg-zinc-800 rounded">p-4</div>
              <div className="p-6 bg-zinc-800 rounded">p-6</div>
            </div>
          </div>
        </div>

        {/* Buttons Section */}
        <div className="bg-gradient-to-br from-zinc-900 to-black border-2 border-[#F7D047]/30 rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-[#F7D047] mb-6">Interactive Elements</h2>
          <div className="flex flex-wrap gap-4">
            <button className="px-6 py-3 bg-gradient-to-r from-[#F7D047] to-[#f5c842] text-black font-bold rounded-xl hover:scale-105 active:scale-95 transition-transform duration-300 shadow-lg shadow-[#F7D047]/30">
              Primary Button
            </button>
            <button className="px-6 py-3 bg-zinc-800 text-white font-bold rounded-xl border-2 border-zinc-700 hover:border-[#F7D047]/50 hover:scale-105 active:scale-95 transition-all duration-300">
              Secondary Button
            </button>
            <button className="px-6 py-3 bg-transparent text-[#F7D047] font-bold rounded-xl border-2 border-[#F7D047] hover:bg-[#F7D047] hover:text-black hover:scale-105 active:scale-95 transition-all duration-300">
              Outline Button
            </button>
          </div>
        </div>

        {/* Flexbox & Grid Test */}
        <div className="bg-gradient-to-br from-zinc-900 to-black border-2 border-[#F7D047]/30 rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-[#F7D047] mb-6">Layout Systems</h2>
          
          {/* Flex */}
          <div className="mb-6">
            <h3 className="text-xl text-gray-300 mb-3">Flexbox</h3>
            <div className="flex justify-between items-center gap-4 p-4 bg-zinc-800/50 rounded-xl">
              <div className="w-20 h-20 bg-[#F7D047] rounded-lg flex items-center justify-center text-black font-bold">1</div>
              <div className="w-20 h-20 bg-[#F7D047] rounded-lg flex items-center justify-center text-black font-bold">2</div>
              <div className="w-20 h-20 bg-[#F7D047] rounded-lg flex items-center justify-center text-black font-bold">3</div>
            </div>
          </div>

          {/* Grid */}
          <div>
            <h3 className="text-xl text-gray-300 mb-3">Grid</h3>
            <div className="grid grid-cols-4 gap-4 p-4 bg-zinc-800/50 rounded-xl">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <div key={num} className="aspect-square bg-[#F7D047] rounded-lg flex items-center justify-center text-black font-bold text-xl">
                  {num}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Responsive Design Test */}
        <div className="bg-gradient-to-br from-zinc-900 to-black border-2 border-[#F7D047]/30 rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-[#F7D047] mb-6">Responsive Design</h2>
          <div className="bg-zinc-800/50 p-6 rounded-xl">
            <p className="text-center text-sm md:text-base lg:text-lg xl:text-xl text-white font-medium">
              This text changes size: sm→md→lg→xl
            </p>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="bg-[#F7D047] p-4 rounded-lg text-black text-center font-bold">1 col</div>
              <div className="bg-[#F7D047] p-4 rounded-lg text-black text-center font-bold">2 sm+</div>
              <div className="bg-[#F7D047] p-4 rounded-lg text-black text-center font-bold">3 md+</div>
              <div className="bg-[#F7D047] p-4 rounded-lg text-black text-center font-bold">4 lg+</div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500/50 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-2xl">
              ✓
            </div>
            <div>
              <h3 className="text-2xl font-bold text-green-400">Tailwind CSS is Working!</h3>
              <p className="text-green-300">All utilities are functioning correctly with the Vite plugin.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm py-4">
          <p>Using @tailwindcss/vite plugin with Vite + React</p>
        </div>
      </div>
    </div>
  );
}

export default TailwindTest;
