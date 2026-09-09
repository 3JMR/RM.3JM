/**
 * RESPECT MASTER - نظام سلة التسوق المتقدم
 * يتضمن: إضافة، حذف، تعديل الكمية، حفظ تلقائي
 */

const CartSystem = {
  key: "respect-master-cart",
  
  init() {
    this.cart = JSON.parse(localStorage.getItem(this.key) || "[]");
    this.createCartUI();
    this.attachEventListeners();
    this.updateCart();
  },

  createCartUI() {
    const cartOverlay = document.createElement("div");
    cartOverlay.className = "cartOverlay";
    cartOverlay.id = "cartOverlay";
    cartOverlay.innerHTML = `
      <aside class="cartPanel" aria-label="سلة المشتريات">
        <div class="cartHead">
          <h2>🛒 سلة المشتريات</h2>
          <button class="closeCart" type="button" aria-label="إغلاق السلة">✕</button>
        </div>
        <div class="cartItems" id="cartItems"></div>
        <div class="cartFooter">
          <div class="cartTotal">المجموع: <strong id="cartTotal">0.00 ر.س</strong></div>
          <button class="cartCheckout" type="button">متابعة الدفع</button>
          <button class="clearCart" type="button">تفريغ السلة</button>
        </div>
      </aside>
    `;
    document.body.appendChild(cartOverlay);
  },

  attachEventListeners() {
    const cartOverlay = document.getElementById("cartOverlay");
    const closeBtn = cartOverlay.querySelector(".closeCart");
    const checkoutBtn = cartOverlay.querySelector(".cartCheckout");
    const clearBtn = cartOverlay.querySelector(".clearCart");
    
    document.getElementById("cartButton").addEventListener("click", () => {
      cartOverlay.classList.add("open");
    });
    
    closeBtn.addEventListener("click", () => {
      cartOverlay.classList.remove("open");
    });
    
    cartOverlay.addEventListener("click", (e) => {
      if (e.target === cartOverlay) {
        cartOverlay.classList.remove("open");
      }
    });
    
    checkoutBtn.addEventListener("click", () => {
      if (this.cart.length === 0) {
        alert("السلة فارغة! أضف منتجات قبل الدفع.");
        return;
      }
      document.getElementById("payment").scrollIntoView({ behavior: "smooth" });
      cartOverlay.classList.remove("open");
    });
    
    clearBtn.addEventListener("click", () => {
      if (confirm("هل أنت متأكد من تفريغ السلة؟")) {
        this.cart = [];
        this.save();
        this.updateCart();
      }
    });
  },

  addProduct(product) {
    const existing = this.cart.find(p => p.name === product.name);
    
    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1;
    } else {
      product.quantity = 1;
      this.cart.push(product);
    }
    
    this.save();
    this.updateCart();
    
    // عرض إشعار
    this.showNotification(`تم إضافة ${product.name} إلى السلة ✓`);
    document.getElementById("cartOverlay").classList.add("open");
  },

  removeProduct(index) {
    this.cart.splice(index, 1);
    this.save();
    this.updateCart();
    this.showNotification("تم حذف المنتج من السلة ✓");
  },

  updateQuantity(index, quantity) {
    if (quantity <= 0) {
      this.removeProduct(index);
    } else {
      this.cart[index].quantity = quantity;
      this.save();
      this.updateCart();
    }
  },

  priceToNumber(price) {
    return parseFloat(String(price).replace(/[^0-9.,-]/g, "").replace(",", ".")) || 0;
  },

  getTotal() {
    return this.cart.reduce((sum, p) => {
      const price = this.priceToNumber(p.price);
      const qty = p.quantity || 1;
      return sum + (price * qty);
    }, 0).toFixed(2);
  },

  updateCart() {
    const cartCount = document.getElementById("cartCount");
    const cartItems = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");
    
    // تحديث العدد
    cartCount.textContent = this.cart.length;
    
    // تحديث العناصر
    if (this.cart.length === 0) {
      cartItems.innerHTML = '<p class="emptyCart">السلة فارغة 😢</p>';
    } else {
      cartItems.innerHTML = this.cart.map((product, index) => `
        <div class="cartItem" data-index="${index}">
          <img src="${product.image}" alt="${product.name}" onerror="this.src='images/placeholder.png'">
          <div class="itemInfo">
            <h3>${product.name}</h3>
            <p>${product.price}</p>
          </div>
          <div class="itemControls">
            <button class="quantityBtn minus" data-index="${index}">−</button>
            <span class="quantity">${product.quantity || 1}</span>
            <button class="quantityBtn plus" data-index="${index}">+</button>
            <button class="removeItem" data-index="${index}">🗑️</button>
          </div>
        </div>
      `).join("");
      
      // إضافة مستمعي الأحداث
      cartItems.querySelectorAll(".removeItem").forEach(btn => {
        btn.addEventListener("click", () => this.removeProduct(parseInt(btn.dataset.index)));
      });
      
      cartItems.querySelectorAll(".quantityBtn.minus").forEach(btn => {
        btn.addEventListener("click", () => {
          const index = parseInt(btn.dataset.index);
          const qty = this.cart[index].quantity || 1;
          this.updateQuantity(index, qty - 1);
        });
      });
      
      cartItems.querySelectorAll(".quantityBtn.plus").forEach(btn => {
        btn.addEventListener("click", () => {
          const index = parseInt(btn.dataset.index);
          const qty = this.cart[index].quantity || 1;
          this.updateQuantity(index, qty + 1);
        });
      });
    }
    
    // تحديث الإجمالي
    cartTotal.textContent = this.getTotal() + " ر.س";
  },

  save() {
    localStorage.setItem(this.key, JSON.stringify(this.cart));
  },

  showNotification(message) {
    const notification = document.createElement("div");
    notification.className = "notification";
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 2000);
  }
};

// تهيئة النظام عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => CartSystem.init());

// دالة عامة للإضافة إلى السلة
function addToCart(product) {
  CartSystem.addProduct(product);
}
