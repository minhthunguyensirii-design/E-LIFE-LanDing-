/**
 * E-LIFE LANDING PAGE INTERACTIVE ENGINE
 * E-commerce & Brand Experience Management
 * Công ty TNHH Một thành viên E-LIFE
 */

document.addEventListener('DOMContentLoaded', () => {
  // Product Catalog - Updated with images from 'ảnh' folder
  const PRODUCTS = {
    1: {
      id: 1,
      name: 'E-LIFE Matcha',
      price: 59000,
      weight: '100g',
      image: 'ảnh/matcha.jpg',
      fallbackImage: 'assets/matcha.jpg',
      positioning: 'Kháng khuẩn · Răng nướu nhạy cảm',
      target: 'Người có răng nướu nhạy cảm',
      orientation: 'Thuần chay (Vegan)',
      ingredients: 'Hydrated Silica, Xylitol, Glycerin nguồn gốc thực vật, Hương Matcha.',
      desc: 'Công thức được định hướng kết hợp hương vị matcha từ trà xanh Nhật Bản, dịu nhẹ trong trải nghiệm chăm sóc răng miệng, hướng đến người có răng nướu nhạy cảm.',
      initialStock: 15,
      maxStock: 30,
      noteVerification: '(*) Định hướng hỗ trợ cảm giác sạch thoáng cho răng nướu nhạy cảm. Các công bố liên quan đến kháng khuẩn và bảo vệ răng nướu đang trong tiến trình thử nghiệm lâm sàng độc lập.'
    },
    2: {
      id: 2,
      name: 'E-LIFE Dưa hấu bạc hà',
      price: 49000,
      weight: '100g',
      image: 'ảnh/watermelon.jpg',
      fallbackImage: 'assets/watermelon.jpg',
      positioning: 'Thanh mát lành tính · Phụ nữ mang thai',
      target: 'Phụ nữ mang thai và mẹ bầu',
      orientation: 'Thuần chay (Vegan)',
      ingredients: 'Hydrated Silica, Xylitol, Glycerin nguồn gốc thực vật, Hương dưa hấu và bạc hà.',
      desc: 'Sự hòa quyện thanh mát giữa dưa hấu ngọt dịu và bạc hà tươi mát, mang đến trải nghiệm chăm sóc răng miệng với hương vị dễ chịu.',
      initialStock: 20,
      maxStock: 40,
      noteVerification: '(*) Sản phẩm sử dụng hương tự nhiên thanh mát, không chứa hóa chất độc hại hay chất tạo màu tổng hợp. Phù hợp cho giai đoạn nhạy cảm của mẹ bầu.'
    },
    3: {
      id: 3,
      name: 'E-LIFE Xoài cam',
      price: 35000,
      weight: '45g',
      image: 'ảnh/mango.jpg',
      fallbackImage: 'assets/mango.jpg',
      positioning: 'Dịu ngọt tự nhiên · Dành cho trẻ em',
      target: 'Trẻ em và học sinh',
      orientation: 'Thuần chay (Vegan)',
      ingredients: 'Hydrated Silica, Xylitol, Glycerin nguồn gốc thực vật, Hương xoài và cam.',
      desc: 'Hương vị xoài và cam thơm ngọt, tạo cảm giác dễ chịu và góp phần giúp trẻ hứng thú hơn với thói quen đánh răng mỗi ngày.',
      initialStock: 25,
      maxStock: 50,
      noteVerification: '(*) Khuyến nghị sử dụng cho trẻ từ 3 tuổi trở lên dưới sự giám sát của phụ huynh. Hướng dẫn trẻ nhổ ra sau khi chải, không được nuốt số lượng lớn.'
    }
  };

  // Persistent Stock Management (Doesn't reset randomly)
  let currentStock = {};
  const storedStock = localStorage.getItem('elife_inventory');
  if (storedStock) {
    try {
      currentStock = JSON.parse(storedStock);
    } catch (e) {
      currentStock = { 1: PRODUCTS[1].initialStock, 2: PRODUCTS[2].initialStock, 3: PRODUCTS[3].initialStock };
    }
  } else {
    currentStock = { 1: PRODUCTS[1].initialStock, 2: PRODUCTS[2].initialStock, 3: PRODUCTS[3].initialStock };
    localStorage.setItem('elife_inventory', JSON.stringify(currentStock));
  }

  // Selected quantities in checkout builder
  let selectedCart = {
    1: 1, // Default 1 Matcha in builder
    2: 0,
    3: 0
  };

  let appliedVoucher = null;
  const VOUCHER_CONFIG = {
    code: 'ELIFE10',
    discountPercent: 10,
    minOrderValue: 100000,
    expired: false
  };

  // 1. COUNTDOWN TIMER INITIALIZATION (Unified fixed target, does not reset on refresh)
  function initCountdownTimer() {
    let endTime = localStorage.getItem('elife_flashsale_target_end');
    if (!endTime) {
      // Set fixed target: 2 days, 18 hours, 45 minutes from now
      endTime = Date.now() + (2 * 24 * 3600 + 18 * 3600 + 45 * 60) * 1000;
      localStorage.setItem('elife_flashsale_target_end', endTime);
    } else {
      endTime = parseInt(endTime, 10);
    }

    const daysEl = document.getElementById('timer-days');
    const hoursEl = document.getElementById('timer-hours');
    const minsEl = document.getElementById('timer-mins');
    const secsEl = document.getElementById('timer-secs');
    const timerTitleEl = document.getElementById('timer-status-title');

    function updateTimer() {
      const now = Date.now();
      const distance = endTime - now;

      if (distance <= 0) {
        if (daysEl) daysEl.textContent = '00';
        if (hoursEl) hoursEl.textContent = '00';
        if (minsEl) minsEl.textContent = '00';
        if (secsEl) secsEl.textContent = '00';
        if (timerTitleEl) timerTitleEl.textContent = 'Chương trình ưu đãi đã kết thúc';
        VOUCHER_CONFIG.expired = true;
        recalculateOrder();
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
      if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
      if (minsEl) minsEl.textContent = String(minutes).padStart(2, '0');
      if (secsEl) secsEl.textContent = String(seconds).padStart(2, '0');
    }

    updateTimer();
    setInterval(updateTimer, 1000);
  }

  // 2. STOCK DISPLAY UPDATE
  function updateStockUI() {
    for (let id in PRODUCTS) {
      const remain = currentStock[id];
      const max = PRODUCTS[id].maxStock;
      const pct = Math.max(5, Math.min(100, (remain / max) * 100));

      const countEl = document.getElementById(`stock-count-${id}`);
      const barEl = document.getElementById(`stock-bar-${id}`);
      if (countEl) countEl.textContent = `Còn ${remain} sản phẩm ưu đãi`;
      if (barEl) barEl.style.width = `${pct}%`;

      // Update in product card if present
      const cardStockEl = document.getElementById(`card-stock-${id}`);
      if (cardStockEl) cardStockEl.textContent = `Ưu đãi còn: ${remain} tuýp`;
    }
  }

  // 3. TOAST NOTIFICATION UTILITY
  function showToast(message, icon = '✓') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // 4. ORDER RECALCULATION & CART SUMMARY
  function recalculateOrder() {
    let subtotal = 0;
    let totalItems = 0;

    for (let id in selectedCart) {
      const qty = selectedCart[id];
      subtotal += PRODUCTS[id].price * qty;
      totalItems += qty;

      const qtyDisplay = document.getElementById(`qty-val-${id}`);
      if (qtyDisplay) qtyDisplay.textContent = qty;
    }

    // Shipping rules: 20,000d flat, Free if subtotal >= 250,000d
    let shippingFee = 0;
    if (totalItems > 0) {
      shippingFee = subtotal >= 250000 ? 0 : 20000;
    }

    // Voucher Calculation
    let discount = 0;
    const voucherMsgEl = document.getElementById('voucher-feedback');
    const voucherInput = document.getElementById('voucher-code-input');

    if (appliedVoucher) {
      if (VOUCHER_CONFIG.expired) {
        appliedVoucher = null;
        if (voucherMsgEl) {
          voucherMsgEl.className = 'voucher-feedback-msg warning';
          voucherMsgEl.textContent = 'Chương trình ưu đãi voucher đã kết thúc.';
        }
      } else if (subtotal < VOUCHER_CONFIG.minOrderValue) {
        const diff = VOUCHER_CONFIG.minOrderValue - subtotal;
        if (voucherMsgEl) {
          voucherMsgEl.className = 'voucher-feedback-msg warning';
          voucherMsgEl.innerHTML = `Voucher <strong>${VOUCHER_CONFIG.code}</strong> cần đơn từ 100.000đ. Quý khách cần mua thêm <strong>${formatMoney(diff)}</strong> để được giảm 10%!`;
        }
        discount = 0;
      } else {
        discount = Math.round(subtotal * (VOUCHER_CONFIG.discountPercent / 100));
        if (voucherMsgEl) {
          voucherMsgEl.className = 'voucher-feedback-msg success';
          voucherMsgEl.innerHTML = `✓ Áp dụng thành công mã <strong>${VOUCHER_CONFIG.code}</strong>: Giảm ${formatMoney(discount)} (10%)`;
        }
      }
    } else {
      if (voucherMsgEl && !voucherInput.value.trim()) {
        voucherMsgEl.className = 'voucher-feedback-msg';
        voucherMsgEl.textContent = '';
      }
    }

    const finalTotal = Math.max(0, subtotal - discount + shippingFee);

    // Update UI elements
    const subtotalEl = document.getElementById('order-subtotal');
    const discountEl = document.getElementById('order-discount');
    const discountRowEl = document.getElementById('order-discount-row');
    const shippingEl = document.getElementById('order-shipping');
    const totalEl = document.getElementById('order-total');
    const cartBadgeEl = document.getElementById('nav-cart-badge');

    if (subtotalEl) subtotalEl.textContent = formatMoney(subtotal);
    if (discountEl) discountEl.textContent = `-${formatMoney(discount)}`;
    if (discountRowEl) discountRowEl.style.display = discount > 0 ? 'flex' : 'none';
    
    if (shippingEl) {
      if (totalItems === 0) {
        shippingEl.textContent = '0đ';
      } else if (shippingFee === 0) {
        shippingEl.innerHTML = '<span style="color:#276749;font-weight:700;">Miễn phí (Đơn ≥ 250k)</span>';
      } else {
        shippingEl.textContent = formatMoney(shippingFee);
      }
    }

    if (totalEl) totalEl.textContent = formatMoney(finalTotal);
    if (cartBadgeEl) cartBadgeEl.textContent = totalItems;

    // Free shipping helper note
    const freeshipHintEl = document.getElementById('freeship-hint');
    if (freeshipHintEl) {
      if (subtotal >= 250000) {
        freeshipHintEl.innerHTML = '🎉 Đơn hàng của bạn đã đủ điều kiện <strong>Miễn phí vận chuyển toàn quốc!</strong>';
        freeshipHintEl.style.color = '#1D6517';
      } else if (subtotal > 0) {
        const gap = 250000 - subtotal;
        freeshipHintEl.innerHTML = `Mua thêm <strong>${formatMoney(gap)}</strong> để được <strong>FREESHIP toàn quốc</strong>!`;
        freeshipHintEl.style.color = '#4A5568';
      } else {
        freeshipHintEl.innerHTML = 'Miễn phí vận chuyển cho đơn hàng từ 250.000đ.';
        freeshipHintEl.style.color = '#718096';
      }
    }
  }

  function formatMoney(amount) {
    return amount.toLocaleString('vi-VN') + 'đ';
  }

  // 5. QUANTITY BUTTON CONTROLS
  window.changeQty = function(productId, delta) {
    const current = selectedCart[productId] || 0;
    const newQty = Math.max(0, current + delta);
    const availableStock = currentStock[productId];

    if (newQty > availableStock) {
      showToast(`Số lượng ưu đãi còn lại của sản phẩm này là ${availableStock} tuýp`, '⚠️');
      return;
    }

    selectedCart[productId] = newQty;
    recalculateOrder();
  };

  // 6. ACTION: "MUA NGAY" FROM PRODUCT CARD / HERO
  window.buyNowProduct = function(productId) {
    if (!selectedCart[productId] || selectedCart[productId] === 0) {
      selectedCart[productId] = 1;
    }
    recalculateOrder();

    const orderSection = document.getElementById('offer-order-block');
    if (orderSection) {
      orderSection.scrollIntoView({ behavior: 'smooth' });
    }
    showToast(`Đã chọn ${PRODUCTS[productId].name}. Mời bạn hoàn tất đơn hàng!`);
  };

  // 7. VOUCHER BUTTONS
  window.copyVoucherCode = function(code) {
    navigator.clipboard.writeText(code).then(() => {
      showToast(`Đã sao chép mã voucher ${code}!`);
    }).catch(() => {
      showToast(`Mã voucher của bạn: ${code}`);
    });
  };

  window.useVoucherNow = function(code) {
    window.copyVoucherCode(code);
    const voucherInput = document.getElementById('voucher-code-input');
    if (voucherInput) {
      voucherInput.value = code;
    }
    appliedVoucher = code;
    recalculateOrder();

    const orderSection = document.getElementById('offer-order-block');
    if (orderSection) {
      orderSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Manual voucher apply
  const applyVoucherBtn = document.getElementById('btn-apply-voucher');
  if (applyVoucherBtn) {
    applyVoucherBtn.addEventListener('click', () => {
      const codeInput = document.getElementById('voucher-code-input');
      const val = codeInput ? codeInput.value.trim().toUpperCase() : '';
      if (!val) {
        showToast('Vui lòng nhập mã voucher', '⚠️');
        return;
      }
      if (val === VOUCHER_CONFIG.code) {
        appliedVoucher = val;
        recalculateOrder();
        showToast('Đã ghi nhận mã ELIFE10!');
      } else {
        appliedVoucher = null;
        const msgEl = document.getElementById('voucher-feedback');
        if (msgEl) {
          msgEl.className = 'voucher-feedback-msg warning';
          msgEl.textContent = 'Mã voucher không hợp lệ hoặc chưa chính xác.';
        }
        recalculateOrder();
      }
    });
  }

  // 8. PRODUCT DETAIL MODAL (Forest Green button)
  window.openProductDetailModal = function(productId) {
    const p = PRODUCTS[productId];
    if (!p) return;

    const modal = document.getElementById('product-detail-modal');
    const titleEl = document.getElementById('detail-modal-title');
    const bodyEl = document.getElementById('detail-modal-body');

    if (titleEl) titleEl.textContent = p.name;
    if (bodyEl) {
      bodyEl.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${p.image}" onerror="this.src='${p.fallbackImage}'" alt="${p.name}" style="max-height: 250px; width: auto; max-width: 100%; object-fit: contain; margin: 0 auto; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.1);">
          <div style="font-size: 1.5rem; font-weight: 900; color: #1D6517; margin-top: 14px;">${formatMoney(p.price)} <span style="font-size: 0.95rem; color: #718096; font-weight: 600;">/ Tuýp ${p.weight}</span></div>
          <span class="badge-tag primary" style="margin-top: 8px; background: #EFF7E6; color: #1D6517; border: 1px solid #79B425;">${p.orientation}</span>
        </div>

        <div style="background: #F8FAF5; border-radius: 12px; padding: 20px; border: 1px solid #E2E8F0; margin-bottom: 20px;">
          <h4 style="color: #054204; margin-bottom: 8px; font-size: 1.05rem;">Mô tả sản phẩm</h4>
          <p style="font-size: 0.95rem; color: #4A5568; line-height: 1.6; margin-bottom: 14px;">${p.desc}</p>
          
          <h4 style="color: #054204; margin-bottom: 6px; font-size: 1.05rem;">Thành phần công bố</h4>
          <p style="font-size: 0.9rem; color: #2D3748; line-height: 1.5; margin-bottom: 14px;"><strong>Thành phần:</strong> ${p.ingredients}</p>

          <h4 style="color: #054204; margin-bottom: 6px; font-size: 1.05rem;">Đối tượng sử dụng</h4>
          <p style="font-size: 0.9rem; color: #2D3748; line-height: 1.5; margin-bottom: 14px;">${p.target}</p>

          <div style="background: #FFFBEB; border-left: 3px solid #D97706; padding: 12px; border-radius: 6px; font-size: 0.85rem; color: #92400E; line-height: 1.45;">
            <strong>Minh bạch thông tin:</strong> ${p.noteVerification}
          </div>
        </div>

        <div style="display: flex; gap: 12px; justify-content: flex-end;">
          <button class="btn-detail" onclick="closeModal('product-detail-modal')">Đóng</button>
          <button class="btn-buy" onclick="closeModal('product-detail-modal'); buyNowProduct(${p.id});">Mua ngay (${formatMoney(p.price)})</button>
        </div>
      `;
    }

    if (modal) modal.classList.add('active');
  };

  // 9. ORDER FORM SUBMISSION
  const checkoutForm = document.getElementById('checkout-order-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let totalItems = 0;
      let orderLines = [];
      for (let id in selectedCart) {
        const qty = selectedCart[id];
        if (qty > 0) {
          totalItems += qty;
          orderLines.push({
            product: PRODUCTS[id],
            qty: qty,
            lineTotal: PRODUCTS[id].price * qty
          });
        }
      }

      if (totalItems === 0) {
        showToast('Vui lòng chọn ít nhất 1 sản phẩm để đặt hàng!', '⚠️');
        return;
      }

      const customerName = document.getElementById('cust-name').value.trim();
      const customerPhone = document.getElementById('cust-phone').value.trim();
      const customerAddress = document.getElementById('cust-address').value.trim();
      const customerPayment = document.getElementById('cust-payment').value;
      const customerNote = document.getElementById('cust-note').value.trim();

      if (!customerName || !customerPhone || !customerAddress) {
        showToast('Vui lòng điền đầy đủ Tên, Số điện thoại và Địa chỉ nhận hàng!', '⚠️');
        return;
      }

      // Subtract inventory
      for (let id in selectedCart) {
        const qty = selectedCart[id];
        if (qty > 0) {
          currentStock[id] = Math.max(0, currentStock[id] - qty);
        }
      }
      localStorage.setItem('elife_inventory', JSON.stringify(currentStock));
      updateStockUI();

      let subtotal = 0;
      orderLines.forEach(l => subtotal += l.lineTotal);
      let shippingFee = subtotal >= 250000 ? 0 : 20000;
      let discount = 0;
      if (appliedVoucher && !VOUCHER_CONFIG.expired && subtotal >= VOUCHER_CONFIG.minOrderValue) {
        discount = Math.round(subtotal * 0.1);
      }
      const finalAmount = subtotal - discount + shippingFee;
      const orderCode = 'ELIFE-' + Math.floor(100000 + Math.random() * 900000);

      openOrderSuccessModal({
        orderCode,
        customerName,
        customerPhone,
        customerAddress,
        customerPayment,
        customerNote,
        orderLines,
        subtotal,
        discount,
        shippingFee,
        finalAmount
      });

      selectedCart = { 1: 0, 2: 0, 3: 0 };
      appliedVoucher = null;
      checkoutForm.reset();
      recalculateOrder();
    });
  }

  function openOrderSuccessModal(data) {
    const modal = document.getElementById('order-success-modal');
    const contentEl = document.getElementById('order-success-body');
    if (!modal || !contentEl) return;

    let itemsHtml = data.orderLines.map(item => `
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.9rem;">
        <span><strong>${item.qty}x</strong> ${item.product.name} (${item.product.weight})</span>
        <span>${formatMoney(item.lineTotal)}</span>
      </div>
    `).join('');

    contentEl.innerHTML = `
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="width: 60px; height: 60px; background: #DEF7EC; color: #03543F; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto 12px auto;">✓</div>
        <h3 style="color: #054204; font-size: 1.4rem; margin-bottom: 4px;">ĐẶT HÀNG THÀNH CÔNG!</h3>
        <p style="color: #718096; font-size: 0.9rem;">Cảm ơn bạn đã lựa chọn kem đánh răng thuần chay E-LIFE</p>
        <div style="margin-top: 10px; display: inline-block; background: #EFF7E6; border: 1px dashed #79B425; padding: 6px 14px; border-radius: 6px; font-family: monospace; font-size: 1.1rem; font-weight: 800; color: #1D6517;">
          Mã đơn: ${data.orderCode}
        </div>
      </div>

      <div style="background: #F8FAF5; border-radius: 10px; padding: 18px; border: 1px solid #E2E8F0; margin-bottom: 20px;">
        <h5 style="color: #1D6517; margin-bottom: 10px; font-size: 0.95rem;">Chi tiết sản phẩm đã chọn:</h5>
        ${itemsHtml}
        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 12px 0;">
        <div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 6px;">
          <span>Tạm tính:</span> <span>${formatMoney(data.subtotal)}</span>
        </div>
        ${data.discount > 0 ? `
          <div style="display: flex; justify-content: space-between; font-size: 0.9rem; color: #C53030; margin-bottom: 6px;">
            <span>Voucher giảm giá (10%):</span> <span>-${formatMoney(data.discount)}</span>
          </div>
        ` : ''}
        <div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 6px;">
          <span>Phí vận chuyển:</span> <span>${data.shippingFee === 0 ? 'Miễn phí' : formatMoney(data.shippingFee)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 1.15rem; font-weight: 900; color: #054204; border-top: 1px dashed #CBD5E0; padding-top: 10px; margin-top: 8px;">
          <span>Tổng thanh toán:</span> <span>${formatMoney(data.finalAmount)}</span>
        </div>
      </div>

      <div style="font-size: 0.88rem; color: #4A5568; line-height: 1.6; margin-bottom: 24px;">
        <p><strong>Người nhận:</strong> ${data.customerName} - <strong>SĐT:</strong> ${data.customerPhone}</p>
        <p><strong>Địa chỉ:</strong> ${data.customerAddress}</p>
        <p><strong>Phương thức:</strong> ${data.customerPayment}</p>
        ${data.customerNote ? `<p><strong>Ghi chú:</strong> ${data.customerNote}</p>` : ''}
        <p style="margin-top: 8px; color: #054204; font-size: 0.8rem; background: #EFF7E6; padding: 6px 10px; border-radius: 4px;">
          ℹ️ E-LIFE sẽ liên hệ qua điện thoại để xác nhận đơn và giao hàng trong 1–5 ngày. Bạn được quyền đồng kiểm tra hàng trước khi thanh toán.
        </p>
      </div>

      <div style="text-align: center;">
        <button class="btn-buy" style="width: 100%;" onclick="closeModal('order-success-modal')">Hoàn tất & Tiếp tục khám phá</button>
      </div>
    `;

    modal.classList.add('active');
  }

  // 10. MODAL UTILITIES
  window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  };

  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });

  // 11. FEEDBACK SUBMISSION MODAL
  window.openFeedbackModal = function() {
    const modal = document.getElementById('feedback-modal');
    if (modal) modal.classList.add('active');
  };

  const feedbackForm = document.getElementById('customer-feedback-form');
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', (e) => {
      e.preventDefault();
      closeModal('feedback-modal');
      showToast('Cảm ơn bạn đã gửi đánh giá! Đội ngũ E-LIFE sẽ kiểm duyệt và xuất bản phản hồi thực tế của bạn.');
      feedbackForm.reset();
    });
  }

  // 12. MOBILE MENU TOGGLE
  const mobileToggle = document.getElementById('mobile-toggle-btn');
  const navMenu = document.getElementById('nav-menu');
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('show');
    });

    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('show');
      });
    });
  }

  // Initial runs
  initCountdownTimer();
  updateStockUI();
  recalculateOrder();
});
