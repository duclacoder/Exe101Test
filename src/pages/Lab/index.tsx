import React, { useState, useEffect, useRef } from 'react';

const Lab = () => {
  const [showMolecularModal, setShowMolecularModal] = useState(false);
  const [showAtomModal, setShowAtomModal] = useState(false);
  const [infoPanelVisible, setInfoPanelVisible] = useState(false);
  const [selectedAtom, setSelectedAtom] = useState('potassium');
  const [isRotating, setIsRotating] = useState(true);
  const [reactionStarted, setReactionStarted] = useState(false);
  
  const molecularCanvasRef = useRef<HTMLCanvasElement>(null);
  const atomViewerRef = useRef<HTMLDivElement>(null);

  // Toggle info panel on mount
  useEffect(() => {
    const timer = setTimeout(() => setInfoPanelVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Atom data
  const atomData: Record<string, {
    name: string;
    description: string;
    symbol: string;
    mass: string;
    density: string;
    melting: string;
    boiling: string;
    discoverer: string;
    year: string;
    mainDescription: string;
  }> = {
    potassium: {
      name: 'Kali (K)',
      description: 'Kim loại kiềm, phản ứng mạnh với nước',
      symbol: 'K',
      mass: '39.0983 u',
      density: '0.828 g/cm³',
      melting: '63.5°C',
      boiling: '759°C',
      discoverer: 'Humphry Davy',
      year: '1807',
      mainDescription: 'Kali là kim loại kiềm, phản ứng mạnh với nước, chiếm khoảng 2.6% khối lượng của vỏ trái đất.'
    },
    hydrogen: {
      name: 'Hiđrô (H₂)',
      description: 'Khí nhẹ nhất, dễ cháy',
      symbol: 'H',
      mass: '1.008 u',
      density: '0.08988 g/L',
      melting: '-259.16°C',
      boiling: '-252.87°C',
      discoverer: 'Henry Cavendish',
      year: '1766',
      mainDescription: 'Hiđrô là nguyên tố hóa học nhẹ nhất và phổ biến nhất trong vũ trụ, chiếm khoảng 75% khối lượng nguyên tố.'
    },
    oxygen: {
      name: 'Oxy (O₂)',
      description: 'Khí cần thiết cho sự sống',
      symbol: 'O',
      mass: '15.999 u',
      density: '1.429 g/L',
      melting: '-218.79°C',
      boiling: '-182.96°C',
      discoverer: 'Carl Wilhelm Scheele',
      year: '1772',
      mainDescription: 'Oxy là nguyên tố hóa học cần thiết cho hầu hết các dạng sống, chiếm khoảng 21% thể tích khí quyển Trái Đất.'
    }
  };

  const handleStartReaction = () => {
    setReactionStarted(true);
    // Logic phản ứng sẽ được thêm vào đây
    setTimeout(() => setReactionStarted(false), 3000);
  };

  const handleMolecularAnimation = () => {
    setShowMolecularModal(true);
    // Logic khởi tạo Three.js sẽ được thêm vào đây
  };

  const handleAtomChange = (atom: string) => {
    setSelectedAtom(atom);
    // Logic thay đổi model 3D sẽ được thêm vào đây
  };

  const currentAtom = atomData[selectedAtom];

  return (
    <div className="relative w-full h-screen bg-gray-900 overflow-hidden">
      {/* Back to Home Button */}
      <a
        href="../home/home.html"
        className="fixed top-5 left-5 z-[1002] flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg hover:from-indigo-600 hover:to-purple-700 hover:-translate-y-0.5 transition-all duration-200"
      >
        ← Về Trang Chủ
      </a>

      {/* Info Panel */}
      <div
        className={`fixed top-20 left-5 w-[calc(100vw-2.5rem)] max-w-[340px] max-h-[calc(100vh-2.5rem)] overflow-y-auto bg-gradient-to-br from-white/95 to-slate-50/95 backdrop-blur-2xl rounded-2xl border border-white/30 shadow-2xl p-6 transition-all duration-300 ${
          infoPanelVisible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-5 pointer-events-none'
        }`}
      >
        <h3 className="mt-0 mb-4 text-blue-700 border-b-3 border-blue-500 pb-2.5 text-xl font-bold tracking-tight">
          Phản ứng: Kali (K) + Nước (H₂O)
        </h3>
        
        <div className="font-mono font-semibold text-lg bg-gradient-to-br from-sky-100 to-blue-100 text-blue-900 px-4 py-3.5 rounded-xl border-2 border-blue-300 text-center my-4 shadow-md">
          2K + 2H₂O → 2KOH + H₂↑
        </div>

        <p className="text-sm leading-relaxed mb-2">
          <strong>Hiện tượng:</strong> Đây là một phản ứng{' '}
          <strong>tỏa nhiệt (exothermic) CỰC MẠNH</strong> và diễn ra rất nhanh,{' '}
          <strong>dữ dội hơn nhiều so với Natri</strong>.
        </p>

        <ul className="pl-5 mt-2.5 space-y-2 text-sm leading-relaxed">
          <li>
            <strong>Kali (K):</strong> Do có khối lượng riêng nhẹ hơn nước (0.86 g/cm³)
            và nhiệt độ nóng chảy thấp (63.5°C), nhiệt lượng tỏa ra làm Kali nóng
            chảy ngay lập tức và <strong>chạy rất nhanh, hỗn loạn trên mặt nước</strong>
            do lực đẩy từ khí H₂ thoát ra mạnh mẽ.
          </li>
          <li>
            <strong>Sản phẩm:</strong>
            <ul className="pl-5 mt-1 space-y-1">
              <li>
                <strong>Khí Hiđrô (H₂):</strong> Thoát ra dưới dạng bọt khí
                rất nhiều và mạnh. Do phản ứng CỰC NÓNG, khí H₂{' '}
                <strong>BỐC CHÁY NGAY LẬP TỨC</strong>, tạo ra ngọn lửa màu{' '}
                <strong>TÍM/HỒNG đặc trưng</strong>.
              </li>
              <li>
                <strong>Kali Hiđroxit (KOH):</strong> Tan trong nước, tạo thành
                dung dịch kiềm (bazơ) rất mạnh, làm{' '}
                <strong>hồng phenolphthalein</strong>.
              </li>
            </ul>
          </li>
          <li>
            <strong>Khói (Steam):</strong> "Khói" quan sát được chủ yếu là{' '}
            <strong>hơi nước</strong> bốc lên rất nhiều do sức nóng cực kỳ
            dữ dội của phản ứng.
          </li>
        </ul>

        <div className="bg-gradient-to-br from-amber-100 to-yellow-100 border-l-4 border-yellow-500 p-3.5 mt-4 rounded-xl text-sm shadow-md">
          <strong className="text-yellow-900 font-bold">⚠️ Cảnh báo an toàn:</strong> Phản ứng này CỰC KỲ{' '}
          <strong>NGUY HIỂM</strong> và có thể gây <strong>CHÁY NỔ MẠNH</strong>. Kali
          phải được bảo quản trong dầu hỏa hoặc parafin và TUYỆT ĐỐI KHÔNG được
          tiếp xúc trực tiếp với nước.
        </div>

        <button
          onClick={handleMolecularAnimation}
          className="w-full mt-5 px-6 py-3.5 text-sm font-semibold text-white bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg hover:from-green-600 hover:to-emerald-700 hover:-translate-y-0.5 transition-all duration-200"
        >
          🔬 Mô Phỏng Phân Tử
        </button>
      </div>

      {/* Start Reaction Button */}
      <div className="fixed bottom-6 right-6 z-[1001] flex flex-col gap-3">
        <button
          onClick={handleStartReaction}
          disabled={reactionStarted}
          className="px-7 py-4 text-base font-bold text-white bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-xl hover:from-orange-600 hover:to-red-700 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ⚗️ Phản ứng
        </button>
      </div>

      {/* Molecular Modal */}
      {showMolecularModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="relative w-[90vw] h-[80vh] max-w-[800px] bg-gray-800 rounded-xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10" />
            <canvas
              ref={molecularCanvasRef}
              className="w-full h-full block"
            />
            <button
              onClick={() => setShowMolecularModal(false)}
              className="absolute top-4 right-4 z-[2001] w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/40 text-white text-xl font-bold rounded-full transition-colors duration-300"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Atom Modal */}
      {showAtomModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="relative w-[90vw] h-[80vh] max-w-[800px] bg-gray-800 rounded-xl shadow-2xl border border-white/20 overflow-hidden flex flex-col">
            {/* Atom Selector */}
            <div className="bg-gray-700 px-5 py-4 border-b border-white/10 flex gap-2.5 justify-center items-center flex-wrap">
              <button
                onClick={() => handleAtomChange('potassium')}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 min-w-[80px] ${
                  selectedAtom === 'potassium'
                    ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/40'
                    : 'bg-gradient-to-br from-indigo-600 to-indigo-800 text-white hover:from-indigo-700 hover:to-indigo-900'
                }`}
              >
                🟡 Kali (K)
              </button>
              <button
                onClick={() => handleAtomChange('hydrogen')}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 min-w-[80px] ${
                  selectedAtom === 'hydrogen'
                    ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/40'
                    : 'bg-gradient-to-br from-indigo-600 to-indigo-800 text-white hover:from-indigo-700 hover:to-indigo-900'
                }`}
              >
                ⚪ Hiđrô (H₂)
              </button>
              <button
                onClick={() => handleAtomChange('oxygen')}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 min-w-[80px] ${
                  selectedAtom === 'oxygen'
                    ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/40'
                    : 'bg-gradient-to-br from-indigo-600 to-indigo-800 text-white hover:from-indigo-700 hover:to-indigo-900'
                }`}
              >
                🔴 Oxy (O₂)
              </button>
              <button
                onClick={() => setIsRotating(!isRotating)}
                className="ml-5 px-5 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-br from-purple-600 to-purple-800 text-white hover:from-purple-700 hover:to-purple-900 transition-all duration-200"
              >
                {isRotating ? '⏸️ Tạm dừng xoay' : '▶️ Tiếp tục xoay'}
              </button>
            </div>

            {/* Atom Viewer Container */}
            <div className="flex-1 flex flex-col md:flex-row gap-0">
              {/* 3D Viewer */}
              <div className="flex-1 relative bg-gray-900 md:h-full h-[400px]">
                <div
                  ref={atomViewerRef}
                  className="w-full h-full flex items-center justify-center text-white"
                >
                  <div className="text-center p-5">
                    <div className="text-5xl mb-4">⚛️</div>
                    <div className="text-lg font-bold mb-2">Chọn nguyên tử để xem</div>
                    <div className="text-sm opacity-70 leading-relaxed">
                      Tích hợp model-viewer hoặc Three.js<br />để hiển thị mô hình 3D
                    </div>
                  </div>
                </div>
                
                <div className="absolute bottom-4 left-4 bg-black/80 text-white px-4 py-2.5 rounded-lg text-sm backdrop-blur-xl">
                  <strong className="block">{currentAtom.name}</strong>
                  <span className="text-xs opacity-90">{currentAtom.description}</span>
                </div>
              </div>

              {/* Details Panel */}
              <div className="w-full md:w-[350px] md:h-auto h-[300px] bg-gradient-to-br from-slate-50 to-slate-200 border-t md:border-t-0 md:border-l border-white/10 overflow-y-auto">
                <div className="p-5">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2.5 border-b-2 border-slate-300">
                    Mô hình nguyên tử của Bohr
                  </h3>
                  
                  <div className="mb-5">
                    <p className="text-sm leading-relaxed text-slate-700 font-medium">
                      {currentAtom.mainDescription}
                    </p>
                  </div>
                  
                  <div className="space-y-3 text-xs leading-relaxed text-slate-600">
                    <div>
                      <strong className="text-slate-800 font-semibold">Biểu tượng:</strong>{' '}
                      <span className="text-slate-900 font-medium">{currentAtom.symbol}</span>
                    </div>
                    <div>
                      <strong className="text-slate-800 font-semibold">Khối lượng nguyên tử:</strong>{' '}
                      <span className="text-slate-900 font-medium">{currentAtom.mass}</span>
                    </div>
                    <div>
                      <strong className="text-slate-800 font-semibold">Khối lượng riêng:</strong>{' '}
                      <span className="text-slate-900 font-medium">{currentAtom.density}</span>
                    </div>
                    <div>
                      <strong className="text-slate-800 font-semibold">Điểm nóng chảy:</strong>{' '}
                      <span className="text-slate-900 font-medium">{currentAtom.melting}</span>
                    </div>
                    <div>
                      <strong className="text-slate-800 font-semibold">Điểm sôi:</strong>{' '}
                      <span className="text-slate-900 font-medium">{currentAtom.boiling}</span>
                    </div>
                    <div>
                      <strong className="text-slate-800 font-semibold">Người phát hiện ra:</strong>{' '}
                      <span className="text-slate-900 font-medium">{currentAtom.discoverer}</span>
                    </div>
                    <div>
                      <strong className="text-slate-800 font-semibold">Năm phát hiện:</strong>{' '}
                      <span className="text-slate-900 font-medium">{currentAtom.year}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowAtomModal(false)}
              className="absolute top-4 right-4 z-[2001] w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/40 text-white text-xl font-bold rounded-full transition-colors duration-300"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* 3D Canvas - Sẽ được khởi tạo bằng Three.js */}
      <canvas id="main-canvas" className="w-full h-full" />
    </div>
  );
};

export default Lab;