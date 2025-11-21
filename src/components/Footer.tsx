import { Mail, Facebook, Youtube } from "lucide-react";
import logo from "../shared/assets/LogoChemX.png";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-blue-600 to-blue-800 pt-16 pb-8">
      <div className="bg-blue-100 rounded-t-[80px] pt-12 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 items-center mb-8">
            {/* Left - Email Subscription */}
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold text-slate-800 mb-2">Đăng ký thông tin</h3>
              <p className="text-sm text-slate-600 mb-4">
                Đăng ký để nhận thông tin mới nhất về ChemXLab nhé!
              </p>
              <div className="flex bg-white rounded-full p-1 shadow-md border border-blue-200 max-w-sm mx-auto md:mx-0">
                <input
                  type="email"
                  placeholder="Email"
                  className="bg-transparent px-4 py-2 outline-none text-sm flex-1"
                />
                <button className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-blue-700 transition-colors">
                  Đăng ký
                </button>
              </div>
            </div>

            {/* Center - Logo */}
            <div className="flex justify-center">
              <img src={logo} alt="ChemXLab" className="h-20 object-contain drop-shadow-lg" />
            </div>

            {/* Right - Social Links */}
            <div className="text-center md:text-right">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Liên hệ</h3>
              <div className="flex gap-4 justify-center md:justify-end">
                <a
                  href="#"
                  className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
                >
                  <Mail className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom - Copyright */}
          <div className="text-center text-slate-600 text-sm pt-8 border-t border-blue-200">
            CHEMXLAB
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
