import React, { useEffect, useRef } from 'react';
import FormLabel from '@mui/material/FormLabel';

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

const SquarePaymentForm = ({ applicationId, locationId, amount, onToken, onError, disabled }) => {
  const cardRef = useRef();
  const paymentsRef = useRef();
  const cardInstanceRef = useRef();

  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    let isMounted = true;
    let card;

    setLoading(true);
    loadSquareScript().then(async () => {
      if (!window.Square || !isMounted) return;
      // No manual DOM cleanup here. Let Square handle its own DOM.

      try {
        const payments = window.Square.payments(applicationId, locationId);
        paymentsRef.current = payments;
        card = await payments.card({
          style: {
            input: {
              color: '#222',
              fontSize: '16px',
            },
          },
        });
        await card.attach(cardRef.current);
        cardInstanceRef.current = card;
        if (isMounted) setLoading(false);
      } catch (e) {
        if (isMounted) onError('Failed to initialize Square card: ' + e.message);
        if (isMounted) setLoading(false);
      }
    }).catch(() => {
      if (isMounted) onError('Square.js failed to load');
      if (isMounted) setLoading(false);
    });
    return () => {
      isMounted = false;
      if (cardInstanceRef.current && cardInstanceRef.current.destroy) {
        cardInstanceRef.current.destroy();
        cardInstanceRef.current = null;
      }
      // Do NOT touch cardRef.current DOM here
    };
  }, [applicationId, locationId, onError]);

  // Allow parent to trigger card tokenization
  useEffect(() => {
    window.squareCardTokenize = async () => {
      if (!cardInstanceRef.current) return;
      try {
        const result = await cardInstanceRef.current.tokenize();
        if (result.status === 'OK') {
          onToken(result.token);
        } else {
          onError(result.errors?.[0]?.message || 'Payment failed');
        }
      } catch (err) {
        onError(err.message);
      }
    };
    return () => {
      window.squareCardTokenize = null;
    };
  }, [onToken, onError]);

  const handlePay = async (e) => {
    e.preventDefault();
    if (!cardInstanceRef.current) return;
    try {
      const result = await cardInstanceRef.current.tokenize();
      if (result.status === 'OK') {
        onToken(result.token);
      } else {
        onError(result.errors?.[0]?.message || 'Payment failed');
      }
    } catch (err) {
      onError(err.message);
    }
  };

  return (
    <form onSubmit={handlePay} style={{ width: '100%' }}>
      <div style={{ width: '100%', maxWidth: 520, margin: '0 auto', paddingLeft: 0, paddingRight: 0, boxSizing: 'border-box' }}>
        <FormLabel component="legend" sx={{ fontWeight: 700, color: 'primary.main', mb: 1.5, fontSize: 16, textAlign: 'left', pl: 0 }}>
          Payment Information
        </FormLabel>
        <div ref={cardRef} style={{ minHeight: 44, width: '100%' }}>
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 44 }}>
              <span className="square-loader" style={{ width: 28, height: 28, border: '4px solid #ccc', borderTop: '4px solid #b71c1c', borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'inline-block' }} />
              <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            </div>
          )}
        </div>
      </div>
      {/* No button here; parent handles Place Order */}
    </form>
  );
};

export default SquarePaymentForm;
