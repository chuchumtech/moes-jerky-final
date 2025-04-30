  require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');

const app = express();
const PORT = 3050;

const path = require('path');
// Serve admin portal static assets FIRST
app.use('/backend/static', express.static(path.join(__dirname, '../admin-portal/build/static')));

// Serve CRA index.html for all other /backend routes
app.get(/^\/backend(\/.*)?$/, (req, res) => {
  res.sendFile(path.join(__dirname, '../admin-portal/build/index.html'));
});

// Session config (5 min inactivity)
app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 1 day max, but we handle inactivity manually
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  },
}));


async function sendOrderEmails(order) {
  console.log('[EMAIL] Preparing to send order emails for order #', order.orderNumber, 'Order:', JSON.stringify(order));
  const smtp2goApiUrl = 'https://api.smtp2go.com/v3/email/send';
  const api_key = process.env.SMTP2GO_API_KEY;
  

  function buildEmail(to, subject, html, text) {
    return {
      to: [to],
      sender: process.env.FROM_EMAIL,
      subject,
      html_body: html,
      text_body: text
    };
  }

  console.log('Preparing to send order emails for order #', order.orderNumber);
  // Customer receipt
  const customerMail = {
    to: [order.email],
    sender: process.env.FROM_EMAIL,
    subject: `Thank you for your order! (Order #${order.orderNumber})`,
    html_body: `
      <div style="background:#f8f8f8;padding:0;margin:0;font-family:'Segoe UI',sans-serif;">
        <div style="max-width:480px;margin:32px auto;background:#fff;border-radius:18px;box-shadow:0 4px 32px rgba(139,0,0,0.10);padding:32px 24px 24px 24px;text-align:center;">
          <img src="https://firebasestorage.googleapis.com/v0/b/moes-jerky-dd53f.firebasestorage.app/o/LOGO%20(2).png?alt=media&token=76b964e3-8c4a-4cf0-8d67-bcbdc3056489" alt="Moe's Jerky Logo" style="width:120px;margin-bottom:20px;border-radius:14px;"/>
          <h2 style="color:#8b0000;font-size:2em;margin-bottom:0.3em;margin-top:0;">Thank You for Your Order!</h2>
          <p style="font-size:1.15em;margin-bottom:18px;">Hi${order.name ? ' ' + order.name : ''},<br>
          We can’t wait for you to enjoy Moe’s Jerky.<br>
          <strong>Your order is confirmed!</strong></p>
          <div style="background:#fff8f8;border-radius:12px;padding:16px 12px 10px 12px;margin:0 auto 18px auto;max-width:360px;box-shadow:0 2px 8px rgba(139,0,0,0.06);">
            <h3 style="color:#8b0000;margin:0 0 8px 0;font-size:1.1em;">Order Summary</h3>
            <table style="width:100%;font-size:1em;margin-bottom:8px;">
              <tbody>
                ${(order.cartItems || []).map(item => `<tr><td align='left' style='padding:2px 0;'>${item.name} <span style='color:#8b0000;'>× ${item.quantity}</span></td><td align='right' style='padding:2px 0;'>$${(item.price * item.quantity).toFixed(2)}</td></tr>`).join('')}
              </tbody>
            </table>
            <hr style="border:none;border-top:1px solid #e0e0e0;margin:8px 0;">
            <div style="display:flex;justify-content:space-between;font-weight:700;margin-bottom:2px;">
              <span>Total:  </span><span>$${order.total?.toFixed(2) || '0.00'}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-weight:700;margin-bottom:2px;">
              <span>Order #</span><span>${order.orderNumber || ''}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-weight:700;margin-bottom:2px;">
              <span>Delivery/Pickup Date:  </span><span> ${order.deliveryDateLabel || (order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : 'N/A')}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-weight:700;margin-bottom:2px;">
              <span>Order Type: </span><span> ${order.deliveryType ? (order.deliveryType.charAt(0).toUpperCase() + order.deliveryType.slice(1)) : 'N/A'}</span>
            </div>
          </div>
          ${order.paymentMethod === 'zelle' ? `<div style="margin-top:18px;color:#8b0000;font-weight:bold;">Please send your Zelle payment to<br>info@moesjerky.shop<br>to complete your order.</div>` : ''}
          <p style="margin-top:22px;font-size:1em;">If you have any questions, email us at info@moesjerky.shop<br>Thank you for supporting Moe’s Jerky!</p>
          <div style="margin-top:30px;color:#8b0000;font-size:0.95em;">Moe’s Jerky &bull; <a href="https://moesjerky.com" style="color:#8b0000;text-decoration:underline;">moesjerky.com</a></div>
        </div>
      </div>
    `
  };

  // Admin notification
  const adminMail = {
    to: [process.env.ADMIN_EMAIL],
    sender: process.env.FROM_EMAIL,
    subject: `New Order Received (#${order.orderNumber || ''})`,
    html_body: `
      <div style="background:#f8f8f8;padding:0;margin:0;font-family:'Segoe UI',sans-serif;">
        <div style="max-width:520px;margin:32px auto;background:#fff;border-radius:18px;box-shadow:0 4px 32px rgba(139,0,0,0.10);padding:32px 28px 28px 28px;text-align:center;">
          <img src="https://firebasestorage.googleapis.com/v0/b/moes-jerky-dd53f.firebasestorage.app/o/LOGO%20(2).png?alt=media&token=76b964e3-8c4a-4cf0-8d67-bcbdc3056489" alt="Moe's Jerky Logo" style="width:110px;margin-bottom:18px;border-radius:14px;"/>
          <h2 style="color:#8b0000;font-size:1.7em;margin-bottom:0.2em;margin-top:0;">New Order Placed</h2>
          <div style="background:#fff8f8;border-radius:12px;padding:15px 14px 10px 14px;margin:0 auto 18px auto;max-width:370px;box-shadow:0 2px 8px rgba(139,0,0,0.06);text-align:left;">
            <div style="font-size:1.07em;margin-bottom:9px;"><b style="color:#8b0000;">Order #${order.orderNumber || ''}</b></div>
            <div style="margin-bottom:7px;"><b>Customer:</b> ${order.name || 'N/A'}</div>
            <div style="margin-bottom:7px;"><b>Email:</b> <a href="mailto:${order.email || ''}" style="color:#8b0000;text-decoration:underline;">${order.email || 'N/A'}</a></div>
            <div style="margin-bottom:7px;"><b>Phone:</b> ${order.phone || 'N/A'}</div>
            <div style="margin-bottom:7px;"><b>Address:</b> ${order.address || 'N/A'}</div>
            <div style="margin-bottom:7px;"><b>Order Total:</b> $${order.total?.toFixed(2) || '0.00'}</div>
            <div style="margin-bottom:7px;"><b>Placed:</b> ${order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Unknown'}</div>
            <div style="margin-bottom:7px;"><b>Delivery/Pickup Date:</b> ${order.deliveryDateLabel || (order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : 'N/A')}</div>
            <div style="margin-bottom:7px;"><b>Order Type:</b> ${order.deliveryType ? (order.deliveryType.charAt(0).toUpperCase() + order.deliveryType.slice(1)) : 'N/A'}</div>
            <hr style="border:none;border-top:1px solid #e0e0e0;margin:10px 0;">
            <h3 style="color:#8b0000;margin:0 0 8px 0;font-size:1.09em;">Order Items</h3>
            <table style="width:100%;font-size:1em;margin-bottom:8px;">
              <tbody>
                ${(order.cartItems || []).map(item => `<tr><td align='left' style='padding:2px 0;'>${item.name} <span style='color:#8b0000;'>× ${item.quantity}</span></td><td align='right' style='padding:2px 0;'>$${(item.price * item.quantity).toFixed(2)}</td></tr>`).join('')}
              </tbody>
            </table>
          </div>
          ${order.paymentMethod === 'zelle' ? `<div style="margin-top:18px;color:#8b0000;font-weight:bold;">Zelle Order: Please confirm payment to info@moesjerky.shop.</div>` : ''}
        </div>
      </div>
    `
  };

  // Send customer email
  if (order.email) {
    try {
      const resp = await fetch(smtp2goApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Smtp2go-Api-Key': api_key
        },
        body: JSON.stringify(customerMail)
      });
      const result = await resp.json();
      console.log('[EMAIL][CUSTOMER] API response:', JSON.stringify(result, null, 2));
    } catch (err) {
      console.error('[EMAIL][CUSTOMER] Failed to send:', err);
    }
  }

  // Send admin email
  try {
    const resp = await fetch(smtp2goApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Smtp2go-Api-Key': api_key
      },
      body: JSON.stringify(adminMail)
    });
    const result = await resp.json();
    console.log('[EMAIL][ADMIN] API response:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('[EMAIL][ADMIN] Failed to send:', err);
  }
}

app.use(cors({ credentials: true, origin: true }));
app.use(express.json());

// Admin session inactivity middleware
const adminSession = require('./middleware/adminSession');
app.use('/api/admin', adminSession);

// Debug route to confirm backend is running
app.get('/test', (req, res) => {
  res.send('Backend is working!');
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Item schema 
const Item = require('./models/Item');

// Orders schema
const Order = require('./models/Order');

// Counter schema for order numbers
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 1000 },
}, { collection: 'counters' });
const Counter = mongoose.model('Counter', counterSchema);

async function getNextOrderNumber() {
  // Ensure counter always starts at 1000
  let counter = await Counter.findById('orderNumber');
  if (!counter || counter.seq < 1000) {
    counter = await Counter.findByIdAndUpdate(
      { _id: 'orderNumber' },
      { $set: { seq: 1000 } },
      { new: true, upsert: true }
    );
  }
  counter = await Counter.findByIdAndUpdate(
    { _id: 'orderNumber' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
}

// Get all items
app.get('/api/items', async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// Get all orders
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ orderNumber: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Delivery Dates route
const deliveryDatesRouter = require('./routes/deliveryDates');
app.use('/api/deliverydates', deliveryDatesRouter);

// Admin Auth
const adminAuthRoutes = require('./routes/adminAuth');
app.use('/api/admin', adminAuthRoutes);

// Admin session middleware for /api/admin/* (protects all routes below except /login)
const adminSessionAuth = require('./middleware/adminAuth');
app.use('/api/admin', adminSessionAuth);

// Admin routes
app.use('/api/admin/dashboard', require('./routes/adminDashboard'));
app.use('/api/admin/orders', require('./routes/adminOrders'));
app.use('/api/admin/products', require('./routes/adminProducts'));
app.use('/api/admin/deliverydates', require('./routes/adminDeliveryDates'));
app.use('/api/admin/users', require('./routes/adminUsers'));
app.use('/api/admin/analytics', require('./routes/adminAnalytics'));


// Place order
app.post('/api/square/pay', async (req, res) => {
  const { sourceId, amount, orderInfo } = req.body;
  try {
    const response = await fetch('https://connect.squareupsandbox.com/v2/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        'Square-Version': '2023-08-16'
      },
      body: JSON.stringify({
        source_id: sourceId,
        idempotency_key: crypto.randomUUID(),
        amount_money: {
          amount: Math.round(amount * 100),
          currency: 'USD'
        },
        location_id: process.env.SQUARE_LOCATION_ID,
        note: orderInfo ? `Order: ${orderInfo.name}, ${orderInfo.email}` : undefined
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(500).json({ success: false, error: data.errors?.[0]?.detail || "Payment failed" });
    }
    res.json({ success: true, payment: data.payment });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const orderNumber = await getNextOrderNumber();
    const order = new Order({ ...req.body, orderNumber, createdAt: new Date(), orderStatus: 'processing' });
    await order.save();
    console.log('[ORDER] Zelle/Manual order saved, about to send emails for order #', order.orderNumber);
    // Send emails in the background; do not await, so client can redirect immediately
    sendOrderEmails(order).catch(emailErr => {
      console.error('[ORDER] Failed to send emails for Zelle/Manual order #', order.orderNumber, emailErr);
    });
    res.status(201).json({ message: 'Order placed successfully', orderNumber });
  } catch (err) {
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// Ensure orderNumber is generated and order is saved after payment
app.post('/api/square/pay', async (req, res) => {
  const { sourceId, amount, orderInfo, cart, customer, deliveryDate } = req.body;
  try {
    const response = await fetch('https://connect.squareupsandbox.com/v2/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        'Square-Version': '2023-08-16'
      },
      body: JSON.stringify({
        source_id: sourceId,
        idempotency_key: crypto.randomUUID(),
        amount_money: {
          amount: Math.round(amount * 100),
          currency: 'USD'
        },
        location_id: process.env.SQUARE_LOCATION_ID,
        note: orderInfo ? `Order: ${orderInfo.name}, ${orderInfo.email}` : undefined
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(500).json({ success: false, error: data.errors?.[0]?.detail || "Payment failed" });
    }

    // Save order with incremented orderNumber after successful payment
    const orderNumber = await getNextOrderNumber();
    // Unify order fields for email template compatibility
    const order = new Order({
      orderNumber,
      name: orderInfo?.name,
      email: orderInfo?.email,
      phone: orderInfo?.phone,
      address: orderInfo?.address,
      deliveryType: orderInfo?.deliveryType,
      deliveryDate: orderInfo?.deliveryDate,
      paymentMethod: 'credit_card',
      cartItems: orderInfo?.cartItems,
      subtotal: orderInfo?.subtotal,
      deliveryFee: orderInfo?.deliveryFee,
      total: amount,
      paymentStatus: 'paid',
      paymentId: data.payment?.id,
      createdAt: new Date(),
      orderStatus: 'processing'
    });
    await order.save();
    console.log('[ORDER] Order saved, about to send emails for order #', order.orderNumber);
    // Send emails (customer + admin) and wait for completion before responding
    // Send emails in the background; do not await, so client can redirect immediately
    sendOrderEmails(order).catch(emailErr => {
      console.error('[ORDER] Failed to send emails for order #', order.orderNumber, emailErr);
    });
    res.json({ success: true, payment: data.payment, orderNumber });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ... (rest of the code remains the same)
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Global error handlers for debugging
process.on('uncaughtException', (err) => {
  console.error('[FATAL] Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('[FATAL] Unhandled Rejection:', reason);
});
