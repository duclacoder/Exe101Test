import { Route, Routes } from "react-router-dom";
import Layout from "../../components/Layout";
import HomePage from "../../pages/Home";
import ProductsPage from "../../pages/Products";
import AboutPage from "../../pages/About";
import BlogPage from "../../pages/Blog";
import SupportPage from "../../pages/Support";
import ExperiencePage from "../../pages/Experience";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="blog" element={<BlogPage />} />
        <Route path="support" element={<SupportPage />} />
        <Route path="experience" element={<ExperiencePage />} />
      </Route>
    </Routes>
  );
};
