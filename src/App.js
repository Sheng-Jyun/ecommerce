import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import logo from './logo.svg';
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
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
          <Routes>
            <Route path='/purchase' element={<Purchase/>} />
            <Route path="/" element={<Navigate replace to="/purchase" />} />
            <Route path='/purchase/paymentEntry' element={<PaymentEntry/>} />
            <Route path='/purchase/shippingEntry' element={<ShippingEntry/>} />
            <Route path='/purchase/viewOrder' element={<ViewOrder/>} />
            <Route path='/purchase/viewConfirmation' element={<Confirmation/>} />
          </Routes>
        </header>
      </div>
    </Router>
  );
}

export default App;
