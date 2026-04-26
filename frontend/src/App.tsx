import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { TableProvider } from './contexts/TableContext';
import { OrderProvider } from './contexts/OrderContext';
import BottomNav from './components/BottomNav';
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import QRScannerPage from './pages/QRScannerPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import TableManagementPage from './pages/TableManagementPage';
import ItemDetailModal from './components/ItemDetailModal';
import './index.css';

function App() {
  return (
    <CartProvider>
      <TableProvider>
        <OrderProvider>
          <Router>
            <div className="min-h-screen bg-off-white font-primary text-text-primary">
              <main className="pb-20">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/scanner" element={<QRScannerPage />} />
                  <Route path="/menu/:category?" element={<MenuPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/confirmation" element={<OrderConfirmationPage />} />
                  <Route path="/admin" element={<AdminDashboardPage />} />
                  <Route path="/admin/tables" element={<TableManagementPage />} />
                </Routes>
              </main>
              <ItemDetailModal />
              <BottomNav />
            </div>
          </Router>
        </OrderProvider>
      </TableProvider>
    </CartProvider>
  );
}

export default App;
