import '@google/model-viewer';
import { LabStyle } from './style';

const Lab = () => {
  return (
    <div className="relative w-full h-screen bg-gray-900 overflow-hidden">
      {/* Back to Home Button */}
      <a href="../home/home.html" id="back-to-home">
        ← Về Trang Chủ
      </a>

      <div id="info-panel">
        <h3>Phản ứng: Kali (K) + Nước (H₂O)</h3>
        <span className="equation">2K + 2H₂O → 2KOH + H₂↑</span>
        <p>
          <strong>Hiện tượng:</strong> Đây là một phản ứng
          <strong>tỏa nhiệt (exothermic) CỰC MẠNH</strong> và diễn ra rất nhanh,
          <strong>dữ dội hơn nhiều so với Natri</strong>.
        </p>
        <ul>
          <li>
            <strong>Kali (K):</strong> Do có khối lượng riêng nhẹ hơn nước (0.86 g/cm³)
            và nhiệt độ nóng chảy thấp (63.5°C), nhiệt lượng tỏa ra làm Kali nóng
            chảy ngay lập tức và <strong>chạy rất nhanh, hỗn loạn trên mặt nước</strong>
            do lực đẩy từ khí H₂ thoát ra mạnh mẽ.
          </li>
          <li>
            <strong>Sản phẩm:</strong>
            <ul>
              <li>
                <strong>Khí Hiđrô (H₂):</strong> Thoát ra dưới dạng bọt khí
                (bubbles) rất nhiều và mạnh. Do phản ứng CỰC NÓNG, khí H₂
                <strong>BỐC CHÁY NGAY LẬP TỨC</strong>, tạo ra ngọn lửa màu
                <strong>TÍM/HỒNG đặc trưng</strong> (màu của ion K+ khi bị kích
                thích nhiệt). Ngọn lửa có thể gây <strong>NỔ NHỎ</strong>.
              </li>
              <li>
                <strong>Kali Hiđroxit (KOH):</strong> Tan trong nước, tạo thành
                dung dịch kiềm (bazơ) rất mạnh, làm
                <strong>hồng phenolphthalein</strong> (nếu có). KOH ăn mòn mạnh.
              </li>
            </ul>
          </li>
          <li>
            <strong>Khói (Steam):</strong> "Khói" quan sát được chủ yếu là
            <strong>hơi nước</strong> (steam) bốc lên rất nhiều do sức nóng cực kỳ
            dữ dội của phản ứng.
          </li>
        </ul>
        <div className="warning">
          <strong>⚠️ Cảnh báo an toàn:</strong> Phản ứng này CỰC KỲ
          <strong>NGUY HIỂM</strong> và có thể gây <strong>CHÁY NỔ MẠNH</strong>. Kali
          phải được bảo quản trong dầu hỏa hoặc parafin và TUYỆT ĐỐI KHÔNG được
          tiếp xúc trực tiếp với nước. Chỉ thực hiện trong phòng thí nghiệm có
          đầy đủ thiết bị bảo hộ và giám sát chuyên nghiệp.
        </div>

        <button id="btn-run-molecular-animation" >
          🔬 Mô Phỏng Phân Tử
        </button>

      </div>

      <div id="button-container">
        <button id="btn-start-reaction">⚗️ Phản ứng</button>
      </div>

       {/* Modal cho mô phỏng phân tử (giữ nguyên như cũ)  */}
      <div id="molecular-modal-overlay">
        <div id="molecular-card">
          <div id="molecular-label-renderer"></div>
          <canvas id="molecular-canvas"></canvas>
          <button id="molecular-card-close">&times;</button>
        </div>
      </div>

      <script type="module" src="index.js"></script>
      <LabStyle />
    </div>
  );
};

export default Lab;