import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Purchase from './purchase';
import PaymentEntry from './paymentEntry';
import ShippingEntry from './shippingEntry';
import ViewOrder from './viewOrder';
import Confirmation from './Confirmation';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path='/purchase' element={<Purchase/>} />
          <Route path="/" element={<Navigate replace to="/purchase" />} />
          <Route path='/purchase/paymentEntry' element={<PaymentEntry/>} />
          <Route path='/purchase/shippingEntry' element={<ShippingEntry/>} />
          <Route path='/purchase/viewOrder' element={<ViewOrder/>} />
          <Route path="/confirmation" element={<Confirmation />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
