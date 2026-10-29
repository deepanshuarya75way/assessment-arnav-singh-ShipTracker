import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createShipment } from '../api/shipmentApi';
import { useAuth } from '../context/AuthContext';
import { fetchCustomers } from '../api/authApi';

import '../styles/app-theme.css';
import { useEffect } from 'react';

const { user } = useAuth();
const isAdmin= user?.role==='admin';
const [customers, setCustomers]=useState([]);

useEffect(()=>{
if (isAdmin){
  fetchCustomers()
  .then(setCustomers)
  .catch(()=> setError('Failed to load customers.'));
}
},[isAdmin]
);

const CreateShipment = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    origin: '',
    destination: '',
    carrier: '',
    estimatedDelivery: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const shipment = await createShipment(form);
      // Land directly on the new shipment's detail page so the user
      // immediately sees the tracking ID that was auto-generated for them.
      navigate(`/shipments/${shipment._id}`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create shipment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-shell">
      <div className="app-wrap narrow">
        <Link to="/dashboard" className="back-link">
          ← Back to dashboard
        </Link>

        <div className="panel detail-card">
          <h1 className="app-title" style={{ fontSize: '20px', marginBottom: '4px' }}>
            New shipment
          </h1>
          <p className="app-sub" style={{ marginBottom: '24px' }}>
            A tracking ID will be generated automatically.
          </p>

          {error && <div className="alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            {isAdmin && (
              <div className='form-field'>
                <label>Customer</label>
                <select name="ownerId" required valude={form.ownerId} onChange={handleChange}>
                  <option value="">select a customer</option>
                  {customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.email})
                  </option>
                  ))}
                </select>
              </div>
            )}
            <div className="form-field">
              <label>Origin</label>
              <input
                type="text"
                name="origin"
                required
                value={form.origin}
                onChange={handleChange}
                placeholder="Shanghai, CN"
              />
            </div>

            <div className="form-field">
              <label>Destination</label>
              <input
                type="text"
                name="destination"
                required
                value={form.destination}
                onChange={handleChange}
                placeholder="Los Angeles, US"
              />
            </div>

            <div className="form-field">
              <label>Carrier</label>
              <input
                type="text"
                name="carrier"
                required
                value={form.carrier}
                onChange={handleChange}
                placeholder="Maersk"
              />
            </div>

            <div className="form-field">
              <label>
                Estimated delivery <span className="optional">(optional)</span>
              </label>
              <input
                type="date"
                name="estimatedDelivery"
                value={form.estimatedDelivery}
                onChange={handleChange}
              />
            </div>

            <button type="submit" disabled={submitting} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              {submitting ? 'Creating...' : 'Create shipment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateShipment;
