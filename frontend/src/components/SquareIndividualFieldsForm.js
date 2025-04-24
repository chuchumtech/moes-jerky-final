import React, { useEffect, useRef, useState } from 'react';

let squareScriptLoaded = false;
let squareScriptPromise = null;

const loadSquareScript = () => {
  if (squareScriptLoaded) return Promise.resolve();
  if (squareScriptPromise) return squareScriptPromise;
  squareScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://sandbox.web.squarecdn.com/v1/square.js';
    script.async = true;
    script.onload = () => {
      squareScriptLoaded = true;
      resolve();
    };
    script.onerror = reject;
    document.body.appendChild(script);
  });
  return squareScriptPromise;
};

const SquareIndividualFieldsForm = ({ applicationId, locationId, onToken, onError, disabled }) => {
  const cardNumberRef = useRef();
  const expRef = useRef();
  const cvvRef = useRef();
  const paymentsRef = useRef();
  const cardNumberInstance = useRef();
  const expInstance = useRef();
  const cvvInstance = useRef();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    loadSquareScript().then(async () => {
      if (!window.Square || !isMounted) return;
      try {
        const payments = window.Square.payments(applicationId, locationId);
        paymentsRef.current = payments;
        cardNumberInstance.current = await payments.cardNumber();
        expInstance.current = await payments.cardExpiry();
        cvvInstance.current = await payments.cardCvv();
        await cardNumberInstance.current.attach(cardNumberRef.current);
        await expInstance.current.attach(expRef.current);
        await cvvInstance.current.attach(cvvRef.current);
        if (isMounted) setLoading(false);
      } catch (e) {
        if (isMounted) onError('Failed to initialize Square fields: ' + e.message);
        if (isMounted) setLoading(false);
      }
    }).catch(() => {
      if (isMounted) onError('Square.js failed to load');
      if (isMounted) setLoading(false);
    });
    return () => {
      isMounted = false;
      if (cardNumberInstance.current && cardNumberInstance.current.destroy) cardNumberInstance.current.destroy();
      if (expInstance.current && expInstance.current.destroy) expInstance.current.destroy();
      if (cvvInstance.current && cvvInstance.current.destroy) cvvInstance.current.destroy();
    };
  }, [applicationId, locationId, onError]);

  const handlePay = async (e) => {
    e.preventDefault();
    try {
      const cardResult = await cardNumberInstance.current.tokenize();
      if (cardResult.status === 'OK') {
        onToken(cardResult.token);
      } else {
        onError(cardResult.errors?.[0]?.message || 'Payment failed');
      }
    } catch (err) {
      onError(err.message);
    }
  };

  return (
    <form onSubmit={handlePay} style={{ width: '100%' }}>
      <div style={{ margin: '18px 0 12px 0', width: '100%', maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' }}>
        <label style={{
          fontWeight: 700,
          fontSize: 16,
          color: '#333',
          marginBottom: 8,
          display: 'block',
          letterSpacing: 0.2,
        }}>Credit Card Details</label>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div ref={cardNumberRef} style={{ minHeight: 48, width: '100%', background: '#f7fafd', borderRadius: 7, border: '1.5px solid #e0e0e0', padding: 8, fontSize: 18 }} />
          <div style={{ display: 'flex', gap: 10, width: '100%' }}>
            <div ref={expRef} style={{ flex: 1, minHeight: 48, background: '#f7fafd', borderRadius: 7, border: '1.5px solid #e0e0e0', padding: 8, fontSize: 18 }} />
            <div ref={cvvRef} style={{ flex: 1, minHeight: 48, background: '#f7fafd', borderRadius: 7, border: '1.5px solid #e0e0e0', padding: 8, fontSize: 18 }} />
          </div>
        </div>
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 60 }}>
            <span className="square-loader" style={{ width: 36, height: 36, border: '4px solid #ccc', borderTop: '4px solid #b71c1c', borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'inline-block' }} />
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          </div>
        )}
      </div>
      {/* No button here; parent handles Place Order */}
    </form>
  );
};

export default SquareIndividualFieldsForm;
