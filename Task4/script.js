// Basic search and toggle form logic for the products page
document.addEventListener('DOMContentLoaded', () => {
	const searchInput = document.getElementById('searchInput');
	const searchBtn = document.getElementById('searchBtn');
	const addProductBtn = document.getElementById('addProductBtn');
	const addProductForm = document.getElementById('addProductForm');

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
			addProductForm.classList.toggle('hidden');
		});
	}

	// Optional: prevent default submit for demo purposes
	if (addProductForm) {
		addProductForm.addEventListener('submit', (e) => {
			e.preventDefault();
			alert('Demo: Form đã được gửi (chưa có xử lý thêm sản phẩm).');
		});
	}
});

