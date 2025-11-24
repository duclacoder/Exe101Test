import React, { useRef, useEffect, useState } from 'react';
import { LabStyle } from './style';
import Reaction from './reaction';

// Data cho Atom Viewer (Giữ nguyên)
const ATOM_DATA: Record<string, any> = {
  potassium: {
    name: 'Kali (K)',
    description: 'Kim loại kiềm, phản ứng mạnh với nước. Số hiệu nguyên tử: 19',
    file: '/src/shared/assets/models/element_019_potassium.glb',
    details: {
      title: 'Mô hình nguyên tử của Bohr',
      mainDescription: 'Kali là kim loại kiềm, phản ứng mạnh với nước, chiếm khoảng 2.6% khối lượng của vỏ trái đất.',
      symbol: 'K',
      atomicMass: '39.0983 u',
      density: '0.828 g/cm³',
      meltingPoint: '63.5°C',
      boilingPoint: '759°C',
      discoverer: 'Humphry Davy',
      yearDiscovered: '1807'
    }
  },
  hydrogen: {
    name: 'Hiđrô (H)',
    description: 'Khí nhẹ nhất, không màu, không mùi. Số hiệu nguyên tử: 1',
    file: '/src/shared/assets/models/element_001_hydrogen.glb',
    details: {
      title: 'Mô hình nguyên tử của Bohr',
      mainDescription: 'Hiđrô là nguyên tố phổ biến nhất trong vũ trụ, chiếm khoảng 75% khối lượng của vũ trụ.',
      symbol: 'H',
      atomicMass: '1.00784 u',
      density: '0.07099 g/cm³',
      meltingPoint: '-252.87°C',
      boilingPoint: '-259.16°C',
      discoverer: 'Henry Cavendish',
      yearDiscovered: '1766'
    }
  },
  oxygen: {
    name: 'Oxy (O)',
    description: 'Khí cần thiết cho sự sống, hỗ trợ đốt cháy. Số hiệu nguyên tử: 8',
    file: '/src/shared/assets/models/element_008_oxygen.glb',
    details: {
      title: 'Mô hình nguyên tử của Bohr',
      mainDescription: 'Oxy là nguyên tố cần thiết cho sự sống, chiếm khoảng 21% khí quyển và 46% khối lượng vỏ trái đất.',
      symbol: 'O',
      atomicMass: '15.999 u',
      density: '1.429 g/L',
      meltingPoint: '-218.79°C',
      boilingPoint: '-182.95°C',
      discoverer: 'Carl Wilhelm Scheele',
      yearDiscovered: '1774'
    }
  }
};

const Lab = () => {
  const reactionRef = useRef<any>(null);
  const [activeAtom, setActiveAtom] = useState<string>('potassium');
  const [isRotating, setIsRotating] = useState<boolean>(true);

  useEffect(() => {
    if (!customElements.get('model-viewer')) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js';
      document.body.appendChild(script);
    }
  }, []);

  const handleAtomChange = (atomKey: string) => setActiveAtom(atomKey);

  const toggleRotation = () => {
    const viewer = document.getElementById('atom-model') as any;
    if (viewer) {
      if (isRotating) viewer.removeAttribute('auto-rotate');
      else viewer.setAttribute('auto-rotate', '');
      setIsRotating(!isRotating);
    }
  };

  const openMolecularModal = () => {
    const modal = document.getElementById('molecular-modal-overlay');
    if(modal) modal.style.display = 'flex';
    // Trigger init and animation logic inside Reaction component
    reactionRef.current?.openMolecular?.();
  };

  const currentAtomData = ATOM_DATA[activeAtom];

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Scene Background */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'auto' }}>
        <Reaction ref={reactionRef} />
      </div>

      {/* UI Overlay */}
      <a href="../home/home.html" id="back-to-home">← Về Trang Chủ</a>

      <div id="info-panel" className="visible">
        <h3>Phản ứng: Kali (K) + Nước (H₂O)</h3>
        <span className="equation">2K + 2H₂O → 2KOH + H₂↑</span>
        <p>
          <strong>Hiện tượng:</strong> Đây là một phản ứng
          <strong>tỏa nhiệt (exothermic) CỰC MẠNH</strong> và diễn ra rất nhanh,
          <strong>dữ dội hơn nhiều so với Natri</strong>.
        </p>
        <ul>
          <li>
            <strong>Kali (K):</strong> Do có khối lượng riêng nhẹ hơn nước (0.86 g/cm³)...
          </li>
          <li>
            <strong>Sản phẩm:</strong>
            <ul>
              <li><strong>Khí Hiđrô (H₂):</strong> Thoát ra mạnh, bốc cháy (lửa tím).</li>
              <li><strong>Kali Hiđroxit (KOH):</strong> Tan trong nước, kiềm mạnh.</li>
            </ul>
          </li>
          <li><strong>Khói (Steam):</strong> Hơi nước bốc lên do nhiệt độ cao.</li>
        </ul>
        <div className="warning">
          <strong>⚠️ Cảnh báo an toàn:</strong> Phản ứng gây nổ mạnh. Không thử tại nhà!
        </div>

        <button id="btn-run-molecular-animation" onClick={openMolecularModal}>
          🔬 Mô Phỏng Phân Tử
        </button>
        <button id="btn-view-atoms" onClick={() => document.getElementById('atom-modal-overlay')!.style.display='flex'}>
          🧪 Xem Nguyên Tử
        </button>
      </div>

      <div id="button-container">
        <button id="btn-start-reaction" onClick={() => reactionRef.current?.startReaction?.()}>⚗️ Phản ứng</button>
      </div>

      {/* MOLECULAR SIMULATION MODAL */}
      <div id="molecular-modal-overlay">
        <div id="molecular-card">
          <div id="molecular-label-renderer"></div>
          <canvas id="molecular-canvas"></canvas>
          <button id="molecular-card-close" onClick={(e) => (e.target as HTMLElement).closest('#molecular-modal-overlay')!.style.display='none'}>&times;</button>
        </div>
      </div>

      {/* ATOM VIEWER MODAL */}
      <div id="atom-modal-overlay">
        <div id="atom-card">
          <div id="atom-selector">
            {Object.keys(ATOM_DATA).map(key => (
              <button 
                key={key} 
                className={`atom-btn ${activeAtom === key ? 'active' : ''}`} 
                onClick={() => handleAtomChange(key)}
              >
                {ATOM_DATA[key].name}
              </button>
            ))}
            <div style={{flex:1}}></div>
            <button id="atom-card-close" onClick={() => document.getElementById('atom-modal-overlay')!.style.display='none'}>Đóng ✕</button>
          </div>

          <div id="atom-viewer-container">
            <div id="atom-3d-viewer">
              {/* @ts-ignore */}
              <model-viewer 
                id="atom-model" 
                src={currentAtomData.file} 
                alt="Atom 3D Model" 
                auto-rotate 
                camera-controls 
                shadow-intensity="1"
                style={{width: '100%', height: '100%'}}
              />
              <div id="atom-info">
                <strong id="atom-name">{currentAtomData.name}</strong>
                <div id="atom-description">{currentAtomData.description}</div>
              </div>
              <button id="toggle-rotation" onClick={toggleRotation}>{isRotating ? '⏸️ Dừng xoay' : '▶️ Xoay'}</button>
            </div>

            <div id="atom-details-panel">
              <div id="atom-details-content">
                <h2 id="detail-title">{currentAtomData.details.title}</h2>
                <p id="main-description">{currentAtomData.details.mainDescription}</p>
                <div className="detail-item"><strong>Ký hiệu:</strong> <span>{currentAtomData.details.symbol}</span></div>
                <div className="detail-item"><strong>Khối lượng:</strong> <span>{currentAtomData.details.atomicMass}</span></div>
                <div className="detail-item"><strong>Mật độ:</strong> <span>{currentAtomData.details.density}</span></div>
                <div className="detail-item"><strong>Nóng chảy:</strong> <span>{currentAtomData.details.meltingPoint}</span></div>
                <div className="detail-item"><strong>Sôi:</strong> <span>{currentAtomData.details.boilingPoint}</span></div>
                <div className="detail-item"><strong>Phát hiện:</strong> <span>{currentAtomData.details.discoverer}</span></div>
                <div className="detail-item"><strong>Năm:</strong> <span>{currentAtomData.details.yearDiscovered}</span></div>
                <div className="detail-link"><a href="#">Xem thêm</a></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <LabStyle />
    </div>
  );
};

export default Lab;