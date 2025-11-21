import { Menu } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../shared/assets/LogoChemX.png";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path
      ? "text-blue-400"
      : "text-gray-300 hover:text-blue-400";
  };

  const navLinks = [
    { path: "/", label: "Trang chủ" },
    { path: "/products", label: "Sản phẩm" },
    { path: "/about", label: "Về ChemXLab" },
    { path: "/blog", label: "Blog" },
    { path: "/support", label: "Hỗ trợ" },
    { path: "/experience", label: "Gói trải nghiệm" },
  ];

  return (
    <header className="fixed top-0 w-full bg-slate-900/80 backdrop-blur-md z-[100] border-b border-blue-500/20">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
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
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`${isActive(link.path)} transition font-medium`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-slate-900 border-b border-blue-500/20 md:hidden">
            <div className="flex flex-col p-4 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`${isActive(link.path)} transition block`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
