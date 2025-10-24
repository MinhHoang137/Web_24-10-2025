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

	function formatCurrencyVND(value) {
		try {
			return new Intl.NumberFormat('vi-VN').format(value) + ' ₫';
		} catch {
			return value + ' ₫';
		}
	}

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

			// Create new product element
			const newItem = document.createElement('article');
			newItem.className = 'product-item';
			// Build inner content (no image by default)
			// Optional image
			const imgVal = (newImg?.value || '').trim();
			if (imgVal) {
				// Validate URL format
				try {
					// eslint-disable-next-line no-new
					new URL(imgVal);
					const imgEl = document.createElement('img');
					imgEl.src = imgVal;
					imgEl.alt = nameVal;
					imgEl.loading = 'lazy';
					imgEl.addEventListener('error', () => {
						// If image fails to load, remove it to avoid broken thumbnail
						imgEl.remove();
					});
					newItem.appendChild(imgEl);
				} catch {
					if (errorMsg) errorMsg.textContent = 'URL ảnh không hợp lệ!';
					return;
				}
			}

			const nameEl = document.createElement('h3');
			nameEl.className = 'product-name';
			nameEl.textContent = nameVal;
			newItem.appendChild(nameEl);

			if (descVal) {
				const descEl = document.createElement('p');
				descEl.className = 'product-desc';
				descEl.textContent = descVal;
				newItem.appendChild(descEl);
			}

			const priceEl = document.createElement('p');
			priceEl.className = 'price';
			priceEl.textContent = formatCurrencyVND(priceNum);
			newItem.appendChild(priceEl);

			// Insert to top of the list
			if (productList) {
				productList.prepend(newItem);
			}

			// Reset and hide form
			addProductForm.reset();
			addProductForm.classList.add('hidden');

			// Clear any active search to avoid hiding existing items unexpectedly
			if (searchInput) searchInput.value = '';
			// Apply filter (now empty) so all items are visible
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

