import { Atom, Beaker, FlaskConical, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../../shared/assets/LogoChemX.png";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 overflow-hidden pt-20">
        <div className="container mx-auto px-6 h-full flex flex-col md:flex-row items-center justify-between relative z-10 py-20">
          <div className="w-full md:w-1/2 text-white space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              KHÁM PHÁ <br />
              CÙNG <br />
              <span className="text-cyan-400">CHEMXLAB</span>
            </h1>
            <p className="text-blue-200 text-lg max-w-lg leading-relaxed">
              ChemXLab là giải pháp mô phỏng thí nghiệm hóa học tiên tiến, mang đến trải nghiệm thực hành trực quan và phát triển năng lực tư duy khoa học.
            </p>
            <div className="flex gap-4 pt-4">
              <Link 
                to="/about" 
                className="inline-block bg-cyan-500 text-white px-10 py-4 rounded-full font-bold hover:bg-cyan-600 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
              >
                Tầm nhìn
              </Link>
              <Link 
                to="/about" 
                className="inline-block bg-blue-700 text-white px-10 py-4 rounded-full font-bold hover:bg-blue-800 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
              >
                Sứ mệnh
              </Link>
              <Link 
                to="/about" 
                className="inline-block bg-blue-600 text-white px-10 py-4 rounded-full font-bold hover:bg-blue-700 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
              >
                Giá trị cốt lõi
              </Link>
            </div>
          </div>
          
          {/* 3D Visual Elements */}
          <div className="w-full md:w-1/2 h-[600px] relative mt-10 md:mt-0 flex items-center justify-center">
            <div className="relative">
              <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/20 backdrop-blur-2xl rounded-full border-2 border-cyan-400/30 animate-pulse"></div>
              <div className="absolute bottom-10 left-10 w-60 h-60 bg-blue-500/20 backdrop-blur-2xl rounded-full border-2 border-blue-400/30"></div>
              <FlaskConical className="relative z-10 w-80 h-80 text-cyan-300/40 drop-shadow-2xl" strokeWidth={1} />
            </div>
          </div>
        </div>
        
        {/* Animated Background Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
           {[...Array(15)].map((_, i) => (
             <div 
               key={i} 
               className="absolute bg-cyan-400/10 rounded-full blur-sm" 
               style={{
                 width: Math.random() * 60 + 30 + 'px',
                 height: Math.random() * 60 + 30 + 'px',
                 top: Math.random() * 100 + '%',
                 left: Math.random() * 100 + '%',
                 animation: `float ${Math.random() * 15 + 10}s infinite ease-in-out`,
                 animationDelay: `${Math.random() * 5}s`
               }} 
             />
           ))}
        </div>
      </section>

      {/* Logo & Mission Section */}
      <section className="py-24 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center gap-16">
            <div className="text-center">
              <img src={logo} alt="ChemXLab Logo" className="w-full max-w-lg mx-auto object-contain drop-shadow-2xl mb-8" />
              <h2 className="text-4xl font-bold text-slate-800 mb-4">KHÁM PHÁ CHEMXLAB</h2>
            </div>
            
            <div className="w-full max-w-2xl flex flex-col gap-6">
              <button className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white py-5 rounded-full text-xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all text-left px-10 flex justify-between items-center group">
                <span>Tầm nhìn</span>
                <ArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6" />
              </button>
              <button className="w-full bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 text-white py-5 rounded-full text-xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all text-left px-10 flex justify-between items-center group">
                <span>Sứ mệnh</span>
                <ArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6" />
              </button>
              <button className="w-full bg-gradient-to-r from-blue-800 via-blue-900 to-slate-900 text-white py-5 rounded-full text-xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all text-left px-10 flex justify-between items-center group">
                <span>Giá trị cốt lõi</span>
                <ArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-slate-800 mb-20 tracking-wide">
            KHÁM PHÁ CÁC TÍNH NĂNG
          </h2>
          
          <div className="relative max-w-6xl mx-auto">
            {/* Central Atom Animation */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 hidden md:block">
              <div className="w-56 h-56 bg-white rounded-full shadow-2xl flex items-center justify-center border-4 border-blue-100">
                <Atom className="w-40 h-40 text-blue-600 animate-spin-slow" strokeWidth={1.5} />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-10 md:gap-40">
              {/* Feature Card 1 */}
              <div className="bg-gradient-to-br from-cyan-500 via-blue-500 to-blue-600 p-1 rounded-3xl shadow-2xl transform hover:-translate-y-3 transition-all duration-300">
                <div className="bg-white/95 backdrop-blur rounded-[22px] p-10 h-full">
                  <h3 className="text-3xl font-bold text-blue-900 mb-4">Mô hình 3D sống động</h3>
                  <p className="text-slate-700 text-lg leading-relaxed mb-6">
                    Khám phá cấu trúc phân tử và tương tác giữa các chất hóa học một cách trực quan, sinh động với công nghệ 3D tiên tiến.
                  </p>
                  <div className="flex justify-end">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Atom className="w-10 h-10 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Card 2 */}
              <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-1 rounded-3xl shadow-2xl transform hover:-translate-y-3 transition-all duration-300">
                <div className="bg-white/95 backdrop-blur rounded-[22px] p-10 h-full">
                  <h3 className="text-3xl font-bold text-blue-900 mb-4">Phản ứng hóa học chi tiết</h3>
                  <p className="text-slate-700 text-lg leading-relaxed mb-6">
                    Quan sát chi tiết các phản ứng hóa học ở cấp độ phân tử và nguyên tử với độ chính xác cao, giúp hiểu rõ bản chất của các quá trình hóa học.
                  </p>
                  <div className="flex justify-end">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-lg">
                      <Beaker className="w-10 h-10 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Registration CTA Section */}
      <section className="py-24 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Atom className="w-12 h-12 text-blue-600 animate-spin" />
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900">Đăng ký để trải nghiệm ngay</h2>
            </div>
            <Link 
              to="/experience" 
              className="inline-block bg-slate-900 text-white px-12 py-4 rounded-full font-bold text-lg hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
            >
              Dùng thử 3 ngày
            </Link>
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
             {[
               { color: 'from-slate-800 to-slate-900', label: 'Thí nghiệm 1' },
               { color: 'from-blue-900 to-slate-900', label: 'Thí nghiệm 2' },
               { color: 'from-purple-900 to-pink-900', label: 'Thí nghiệm 3' },
               { color: 'from-blue-800 to-cyan-700', label: 'Thí nghiệm 4' }
             ].map((item, i) => (
               <div key={i} className="aspect-[3/4] bg-gradient-to-br ${item.color} rounded-2xl overflow-hidden relative group cursor-pointer shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                 <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10"></div>
                 <div className={`w-full h-full bg-gradient-to-br ${item.color}`}></div>
                 <div className="absolute bottom-6 left-6 z-20 text-white">
                    <p className="text-xs font-bold opacity-80 mb-1">CHEMXLAB</p>
                    <p className="font-bold text-lg">{item.label}</p>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </section>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-10px); }
          75% { transform: translateY(-30px) translateX(5px); }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
