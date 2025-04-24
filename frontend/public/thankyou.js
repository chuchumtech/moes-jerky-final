// thankyou.js
// This script reads the order details from the URL and renders them into the thank you page.

function getOrderDetailsFromURL() {
  const params = new URLSearchParams(window.location.search);
  try {
    const orderDetails = params.get('orderDetails');
    if (orderDetails) {
      return JSON.parse(decodeURIComponent(orderDetails));
    }
  } catch (e) {
    // Fallback
  }
  return null;
}

function renderOrderDetails(details) {
  if (!details) {
    document.getElementById('orderDetails').innerHTML = '<div style="color:#c00">Could not load your order details.</div>';
    return;
  }
  const { orderNumber, name, cartItems, deliveryType, paymentMethod, subtotal, deliveryFee, total } = details;
  let html = `<div class="order-summary">`;
  // Order number, payment type, and delivery type at the top
  html += `<div style="margin-bottom:1.2em;">
    <div style="font-size:1.15em; font-weight:700; color:#a83232;">Order #${orderNumber || 'N/A'}</div>
    <div style="font-size:1em; color:#555; margin-top:0.2em;">
      <span style="margin-right:1.2em;"><b>Payment:</b> ${paymentMethod ? paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1) : ''}</span>
      <span><b>Delivery:</b> ${deliveryType === 'delivery' ? 'Delivery' : 'Pickup'}</span>
    </div>
  </div>`;
  html += `<h2>Order Summary</h2>`;
  html += `<div class="order-section"><h3>Name</h3><div>${name || ''}</div></div>`;
  html += `<div class="order-section"><h3>Items</h3><ul>`;
  if (cartItems && cartItems.length > 0) {
    html += cartItems.map(item => `<li>${item.quantity} × ${item.name} <span style='color:#888;font-size:0.98em;'>($${item.price.toFixed(2)})</span></li>`).join('');
  } else {
    html += '<li>No items found</li>';
  }
  html += `</ul></div>`;
  // Removed duplicate Delivery and Payment sections here
  html += `<div class="order-section"><h3>Subtotal</h3><div>$${subtotal?.toFixed(2)}</div></div>`;
  if (deliveryType === 'delivery') {
    html += `<div class="order-section"><h3>Delivery Fee</h3><div>$${deliveryFee?.toFixed(2)}</div></div>`;
  }
  html += `<div class="order-section"><h3>Total</h3><div style="font-weight:600; color:#a83232;">$${total?.toFixed(2)}</div></div>`;
  html += '</div>';
  document.getElementById('orderDetails').innerHTML = html;
}

document.addEventListener('DOMContentLoaded', function() {
  const details = getOrderDetailsFromURL();
  renderOrderDetails(details);
});
