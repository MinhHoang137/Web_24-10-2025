// Basic search and toggle form logic for the products page
document.addEventListener('DOMContentLoaded', () => {
	const searchInput = document.getElementById('searchInput');
	const searchBtn = document.getElementById('searchBtn');
	const addProductBtn = document.getElementById('addProductBtn');
	const addProductForm = document.getElementById('addProductForm');
	const productList = document.getElementById('product-list') || document.querySelector('.products');
	// Fields for add-product form
	const newName = document.getElementById('newName');
	const newPrice = document.getElementById('newPrice');
	const newDesc = document.getElementById('newDesc');
	const newImg = document.getElementById('newImg');
	const cancelBtn = document.getElementById('cancelBtn');
	const errorMsg = document.getElementById('errorMsg');

	// ===== LocalStorage helpers =====
	const STORAGE_KEY = 'products';
	let products = null; // canonical in-memory model

	function loadFromStorage() {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (!raw) return null;
			const data = JSON.parse(raw);
			return Array.isArray(data) ? data : null;
		} catch {
			return null;
		}
	}

	function saveToStorage(list) {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
		} catch {
			// ignore quota/permission errors silently for this exercise
		}
	}

	// ===== DOM/Render helpers =====
	function formatCurrencyVND(value) {
		try {
			return new Intl.NumberFormat('vi-VN').format(value) + ' ₫';
		} catch {
			return value + ' ₫';
		}
	}

	function createProductElement(p) {
		const item = document.createElement('article');
		item.className = 'product-item';
		if (p.img) {
			try {
				new URL(p.img);
				const imgEl = document.createElement('img');
				imgEl.src = p.img;
				imgEl.alt = p.name || '';
				imgEl.loading = 'lazy';
				imgEl.addEventListener('error', () => imgEl.remove());
				item.appendChild(imgEl);
			} catch { /* skip invalid url */ }
		}
		const title = document.createElement('h3');
		title.className = 'product-name';
		title.textContent = p.name || '';
		item.appendChild(title);
		if (p.desc) {
			const desc = document.createElement('p');
			desc.className = 'product-desc';
			desc.textContent = p.desc;
			item.appendChild(desc);
		}
		const price = document.createElement('p');
		price.className = 'price';
		price.textContent = formatCurrencyVND(p.price || 0);
		item.appendChild(price);
		return item;
	}

	function clearProductList() {
		if (!productList) return;
		while (productList.firstChild) productList.removeChild(productList.firstChild);
	}

	function renderProducts(list) {
		if (!productList) return;
		clearProductList();
		list.forEach(p => {
			productList.appendChild(createProductElement(p));
		});
	}

	function parsePriceText(text) {
		if (!text) return 0;
		const digits = text.replace(/[^\d]/g, '');
		const n = parseInt(digits || '0', 10);
		return Number.isNaN(n) ? 0 : n;
	}

	function extractProductsFromDOM() {
		const items = Array.from(document.querySelectorAll('.product-item'));
		return items.map(el => {
			const name = (el.querySelector('.product-name') || el.querySelector('h3'))?.textContent?.trim() || '';
			const desc = (el.querySelector('.product-desc') || el.querySelector('p:not(.price)'))?.textContent?.trim() || '';
			const priceText = (el.querySelector('.price')?.textContent || '').trim();
			const price = parsePriceText(priceText);
			const img = el.querySelector('img')?.getAttribute('src') || '';
			return { name, desc, price, img };
		});
	}

	const getProducts = () => Array.from(document.querySelectorAll('.product-item'));

	function applyFilter() {
		const keyword = (searchInput?.value || '').trim().toLowerCase();
		const items = getProducts();
		items.forEach(item => {
			const nameEl = item.querySelector('.product-name') || item.querySelector('h3, h2');
			const name = (nameEl?.textContent || '').toLowerCase();
			if (!keyword || name.includes(keyword)) {
				item.style.display = '';
			} else {
				item.style.display = 'none';
			}
		});
	}

	// ===== Initialize model and render from LocalStorage (or seed from DOM) =====
	const stored = loadFromStorage();
	if (stored && stored.length) {
		products = stored;
		renderProducts(products);
	} else {
		products = extractProductsFromDOM();
		saveToStorage(products);
	}
	// Apply filter once on load in case user has a value present (e.g., via autofill)
	if (searchInput && searchInput.value) applyFilter();

	// Search events
	if (searchBtn) {
		searchBtn.addEventListener('click', applyFilter);
	}
	if (searchInput) {
		searchInput.addEventListener('keyup', (e) => {
			if (e.key === 'Enter') applyFilter();
		});
	}

	// Toggle add product form
	if (addProductBtn && addProductForm) {
		addProductBtn.addEventListener('click', () => {
			// Clear any previous messages and values only when opening
			const willShow = addProductForm.classList.contains('hidden');
			if (willShow) {
				if (errorMsg) errorMsg.textContent = '';
			}
			addProductForm.classList.toggle('hidden');
		});
	}

	// Submit handler: validate + create + prepend + reset + hide
	if (addProductForm) {
		addProductForm.addEventListener('submit', (e) => {
			e.preventDefault();
			const nameVal = (newName?.value || '').trim();
			const priceRaw = (newPrice?.value || '').trim();
			const descVal = (newDesc?.value || '').trim();

			// Validate
			const priceNum = Number(priceRaw);
			if (!nameVal || !priceRaw || Number.isNaN(priceNum) || priceNum <= 0) {
				if (errorMsg) errorMsg.textContent = 'Vui lòng nhập tên và giá hợp lệ (giá > 0)!';
				return;
			}
			if (descVal && descVal.length < 5) {
				if (errorMsg) errorMsg.textContent = 'Mô tả quá ngắn, vui lòng nhập tối thiểu 5 ký tự.';
				return;
			}

			if (errorMsg) errorMsg.textContent = '';

			// Prepare product data
			const imgVal = (newImg?.value || '').trim();
			if (imgVal) {
				try { new URL(imgVal); } catch {
					if (errorMsg) errorMsg.textContent = 'URL ảnh không hợp lệ!';
					return;
				}
			}
			const product = { name: nameVal, price: priceNum, desc: descVal, img: imgVal || '' };

			// Update model and storage (add to top)
			products = Array.isArray(products) ? products : [];
			products.unshift(product);
			saveToStorage(products);

			// Create and insert DOM element to top
			const newItem = createProductElement(product);

			// Insert to top of the list
			if (productList) {
				productList.prepend(newItem);
			}

			// Reset and hide form
			addProductForm.reset();
			addProductForm.classList.add('hidden');


			// Keep current search behavior: re-apply filter using current keyword (don't clear by default)
			applyFilter();
		});
	}

	// Cancel button closes and resets the form
	if (cancelBtn && addProductForm) {
		cancelBtn.addEventListener('click', () => {
			addProductForm.reset();
			if (errorMsg) errorMsg.textContent = '';
			addProductForm.classList.add('hidden');
		});
	}
});

