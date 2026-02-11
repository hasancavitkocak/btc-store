import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import ProductContact from './pages/ProductContact';
import References from './pages/References';
import Stories from './pages/Stories';
import StoryDetail from './pages/StoryDetail';
import CallRequest from './pages/CallRequest';
import Dashboard from './pages/admin/Dashboard';
import Forms from './pages/admin/Forms';
import Header from './pages/admin/Header';
import Banners from './pages/admin/Banners';
import Categories from './pages/admin/Categories';
import ProductsAdmin from './pages/admin/ProductsAdmin';
import ReferencesAdmin from './pages/admin/ReferencesAdmin';
import StoriesAdmin from './pages/admin/StoriesAdmin';
import KVKK from './pages/admin/KVKK';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/products/:id/contact" element={<ProductContact />} />
          <Route path="/references" element={<References />} />
          <Route path="/stories" element={<Stories />} />
          <Route path="/stories/:id" element={<StoryDetail />} />
          <Route path="/call-request" element={<CallRequest />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="forms" element={<Forms />} />
          <Route path="header" element={<Header />} />
          <Route path="banners" element={<Banners />} />
          <Route path="categories" element={<Categories />} />
          <Route path="products" element={<ProductsAdmin />} />
          <Route path="references" element={<ReferencesAdmin />} />
          <Route path="stories" element={<StoriesAdmin />} />
          <Route path="kvkk" element={<KVKK />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
