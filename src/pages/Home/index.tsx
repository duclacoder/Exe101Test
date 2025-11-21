import { Atom, Beaker, FlaskConical, Menu } from 'lucide-react';
import logo from '../../shared/assets/LogoChemX.png';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="fixed top-0 w-full bg-slate-900/80 backdrop-blur-md z-50 border-b border-blue-500/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <span className="text-2xl md:text-3xl font-bold text-white tracking-wider">
                CHEM
              </span>
              <img
                src={logo}
                alt="ChemXLab"
                className="h-10 w-auto object-contain mx-1"
              />
              <span className="text-2xl md:text-3xl font-bold text-white tracking-wider">
                LAB
              </span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-gray-300 hover:text-blue-400 transition">Trang chủ</a>
            <a href="#" className="text-gray-300 hover:text-blue-400 transition">Giới thiệu</a>
            <a href="#" className="text-gray-300 hover:text-blue-400 transition">Dịch vụ</a>
            <a href="#" className="text-gray-300 hover:text-blue-400 transition">Liên hệ</a>
          </nav>
          <Menu className="md:hidden w-6 h-6 text-white" />
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center relative">
          {/* Molecular Background */}
          <div className="absolute inset-0 overflow-hidden opacity-20">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-blue-400 rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              />
            ))}
          </div>

          <div className="relative z-10">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              KHÁM PHÁ CÙNG
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                CHEMXLAB
              </span>
            </h1>

            <div className="flex justify-center mb-12">
              <div className="relative">
                <div className="w-48 h-48 relative animate-spin-slow">
                  <Atom className="w-full h-full text-blue-400 opacity-80" strokeWidth={1} />
                </div>
                <FlaskConical className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 text-cyan-300" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all transform hover:scale-105">
                Tìm hiểu
              </button>
              <button className="bg-white/10 backdrop-blur-md text-white px-8 py-3 rounded-full font-semibold border border-white/20 hover:bg-white/20 transition-all">
                Dịch vụ
              </button>
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all transform hover:scale-105">
                Giá trị cốt lõi
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Logo Section */}
      <section className="py-12 px-4 bg-gradient-to-b from-transparent to-blue-950/30">
        <div className="container mx-auto text-center">
          <div className="inline-block">
            <h2 className="text-4xl font-bold mb-4">
              <span className="text-blue-400">CHEM</span>
              <span className="text-cyan-300">X</span>
              <span className="text-blue-400">LAB</span>
            </h2>
            <p className="text-gray-400 text-sm tracking-widest">KHÁM PHÁ CHEMXLAB</p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-blue-800 p-8 hover:shadow-2xl hover:shadow-blue-500/30 transition-all cursor-pointer transform hover:scale-105">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              <h3 className="text-3xl font-bold text-white mb-4 relative z-10">
                Mô hình 3D động động
              </h3>
              <p className="text-blue-100 relative z-10">
                Trải nghiệm các phân tử và cấu trúc hóa học trong không gian 3D tương tác
              </p>
              <div className="mt-6 text-white/50 relative z-10">→</div>
            </div>

            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-600 to-blue-700 p-8 hover:shadow-2xl hover:shadow-cyan-500/30 transition-all cursor-pointer transform hover:scale-105">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              <h3 className="text-3xl font-bold text-white mb-4 relative z-10">
                Phân tích hóa học: chi tiết
              </h3>
              <p className="text-cyan-100 relative z-10">
                Công cụ phân tích chuyên sâu với độ chính xác cao cho nghiên cứu
              </p>
              <div className="mt-6 text-white/50 relative z-10">→</div>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-blue-950/30 to-transparent">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="text-4xl">✨</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Đăng ký để trải nghiệm ngay
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { color: 'from-red-500 to-pink-500', icon: '🧪' },
              { color: 'from-gray-700 to-gray-900', icon: '⚗️' },
              { color: 'from-purple-500 to-pink-500', icon: '🔬' },
              { color: 'from-blue-500 to-cyan-500', icon: '🧬' },
            ].map((item, i) => (
              <div
                key={i}
                className={`aspect-square rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-6xl hover:scale-110 transition-transform cursor-pointer shadow-xl`}
              >
                {item.icon}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-slate-900/50 border-t border-blue-500/20">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Beaker className="w-6 h-6 text-blue-400" />
                <span className="text-xl font-bold text-white">CHEMXLAB</span>
              </div>
              <p className="text-gray-400 text-sm">
                Khám phá thế giới hóa học với công nghệ hiện đại
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Liên kết</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-blue-400 transition">Giới thiệu</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Dịch vụ</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Liên hệ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Theo dõi</h4>
              <div className="flex gap-4">
                {['f', 'in', 'yt'].map((social, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 hover:bg-blue-500/30 transition cursor-pointer"
                  >
                    {social}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center text-gray-500 text-sm pt-8 border-t border-gray-800">
            © 2024 ChemXLab. All rights reserved.
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default HomePage;