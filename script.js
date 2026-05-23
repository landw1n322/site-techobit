document.querySelectorAll('.category-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document
      .querySelectorAll('.category-btn')
      .forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    const cat = btn.dataset.category;

    document.querySelectorAll('.product-card').forEach((card) => {
      if (cat === 'all' || card.dataset.category === cat) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  });
});

// поиск товаров по названию
document.getElementById('search')?.addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase();
  document.querySelectorAll('.product-card').forEach((card) => {
    const title = card.querySelector('h3').textContent.toLowerCase();
    if (title.includes(searchTerm)) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
});

// загрузка страницы
document.addEventListener('DOMContentLoaded', () => {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  let fav = JSON.parse(localStorage.getItem('fav')) || [];

  const cartCount = document.getElementById('cart-count');
  const favCount = document.getElementById('favorite-count');

  const cartModal = document.getElementById('cart-modal');
  const favModal = document.getElementById('fav-modal');
  const orderModal = document.getElementById('order-modal');

  const cartItemsBox = document.getElementById('cart-items');
  const favItemsBox = document.getElementById('fav-items');

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // обновление счётчиков и localStorage
  function updateUI() {
    cartCount.textContent = cart.reduce((s, i) => s + i.qty, 0);
    favCount.textContent = fav.length;

    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('fav', JSON.stringify(fav));
  }

  // отображение корзины
  function renderCart() {
    if (cart.length === 0) {
      cartItemsBox.innerHTML = '<div class="empty-cart">Корзина пуста</div>';
      return;
    }

    cartItemsBox.innerHTML =
      cart
        .map(
          (item, index) => `
      <div class="cart-item">
        <div class="cart-title">${escapeHtml(item.title)}</div>
        <div class="qty">
          <button onclick="window.decrease(${index})">-</button>
          <span>${item.qty}</span>
          <button onclick="window.increase(${index})">+</button>
        </div>
        <button class="delete" onclick="window.removeItem(${index})">✖</button>
      </div>
    `
        )
        .join('') +
      `
      <button class="modal-order-btn" id="proceed-to-order">📦 Оформить заказ</button>
    `;
  }

  // отображение избранного
  function renderFav() {
    if (fav.length === 0) {
      favItemsBox.innerHTML =
        '<div class="empty-cart"> Нет избранных товаров</div>';
      return;
    }

    favItemsBox.innerHTML = fav
      .map(
        (item, index) => `
      <div class="cart-item">
        <div class="cart-title"> ${escapeHtml(item)}</div>
        <button class="delete" onclick="window.removeFav(${index})">✖</button>
      </div>
    `
      )
      .join('');
  }

  // добавление товара в корзину
  document.querySelectorAll('.add-cart').forEach((btn) => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.product-card');
      const title = card.querySelector('h3').textContent;
      const price = card.querySelector('.price').textContent;

      const found = cart.find((i) => i.title === title);

      if (found) {
        found.qty++;
      } else {
        cart.push({ title, price, qty: 1 });
      }

      updateUI();

      btn.style.transform = 'scale(0.95)';
      setTimeout(() => {
        btn.style.transform = 'scale(1)';
      }, 200);
    });
  });

  // добавление товара в избранное
  document.querySelectorAll('.add-favorite').forEach((btn) => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.product-card');
      const title = card.querySelector('h3').textContent;

      if (!fav.includes(title)) {
        fav.push(title);
        updateUI();

        btn.style.transform = 'scale(1.2)';
        setTimeout(() => {
          btn.style.transform = 'scale(1)';
        }, 200);
      } else {
        alert('Товар уже в избранном!');
      }
    });
  });

  // открытие модального окна корзины
  document.querySelector('.cart-btn').addEventListener('click', () => {
    renderCart();
    cartModal.style.display = 'flex';
  });

  // открытие модального окна избранного
  document.querySelector('.favorite-btn').addEventListener('click', () => {
    renderFav();
    favModal.style.display = 'flex';
  });

  // переход из корзины к оформлению заказа
  cartItemsBox.addEventListener('click', (e) => {
    if (e.target.id === 'proceed-to-order') {
      cartModal.style.display = 'none';
      orderModal.style.display = 'flex';

      document.getElementById('name').value = '';
      document.getElementById('surname').value = '';
      document.getElementById('phone').value = '';
      document.getElementById('address').value = '';
    }
  });

  // закрытие модальных окон по крестику
  document.querySelectorAll('.close-modal').forEach((btn) => {
    btn.addEventListener('click', () => {
      cartModal.style.display = 'none';
      favModal.style.display = 'none';
      orderModal.style.display = 'none';
    });
  });

  // закрытие модального окна при клике на фон
  window.addEventListener('click', (e) => {
    if (e.target === cartModal) cartModal.style.display = 'none';
    if (e.target === favModal) favModal.style.display = 'none';
    if (e.target === orderModal) orderModal.style.display = 'none';
  });

  // увеличение количества товара в корзине
  window.increase = (i) => {
    cart[i].qty++;
    updateUI();
    renderCart();
  };

  // уменьшение количества товара в корзине
  window.decrease = (i) => {
    if (cart[i].qty > 1) {
      cart[i].qty--;
    } else {
      cart.splice(i, 1);
    }
    updateUI();
    renderCart();
  };

  // удаление товара из корзины
  window.removeItem = (i) => {
    cart.splice(i, 1);
    updateUI();
    renderCart();
  };

  // удаление товара из избранного
  window.removeFav = (i) => {
    fav.splice(i, 1);
    updateUI();
    renderFav();
  };

  // отправка заказа с валидацией
  document.getElementById('submit-order').addEventListener('click', () => {
    const name = document.getElementById('name').value.trim();
    const surname = document.getElementById('surname').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();

    // Простая валидация
    if (!name || name.length < 2) {
      alert('❌ Имя должно содержать минимум 2 символа!');
      return;
    }

    if (!surname || surname.length < 2) {
      alert('❌ Фамилия должна содержать минимум 2 символа!');
      return;
    }

    const phoneRegex = /^(\+7|8)?[\s-]?(\()?(\d{3})(\))?[\s-]?(\d{3})[\s-]?(\d{2})[\s-]?(\d{2})$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      alert('❌ Некорректный номер телефона!');
      return;
    }

    if (!address || address.length < 10) {
      alert('❌ Адрес должен быть минимум 10 символов!');
      return;
    }

    alert(`✅ Спасибо за заказ, ${name}! Мы отправим подтверждение на номер ${phone}`);
    
    cart = [];
    updateUI();
    renderCart();
    orderModal.style.display = 'none';
  });

  // бургер-меню для мобильных устройств
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');

  if (burger && nav) {
    burger.addEventListener('click', () => {
      nav.classList.toggle('active');
    });
  }

  updateUI();
});
