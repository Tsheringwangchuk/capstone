export const hideAlert = () => {
    const el = document.querySelector('.modal-body .alert');
    if (el) el.remove();
};

// type: 'success' or 'error'
export const showAlert = (type, msg, containerSelector = null) => {
    hideAlert();

    const alertElement = document.createElement('div');
    alertElement.className = `alert alert-dismissible fade show`;
    alertElement.role = 'alert';
    alertElement.innerHTML = `
        ${msg}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    // Set custom background and text colors
    if (type === 'success') {
        alertElement.style.backgroundColor = '#28a745';  // bright green
        alertElement.style.color = '#fff';
    } else if (type === 'error') {
        alertElement.style.backgroundColor = '#dc3545';  // red
        alertElement.style.color = '#fff';
    }

    const container = containerSelector
        ? document.querySelector(containerSelector)
        : document.querySelector('.modal-body');

    if (container) container.prepend(alertElement);

    setTimeout(() => {
        if (alertElement && alertElement.parentElement) {
            alertElement.classList.remove('show');
            alertElement.classList.add('fade');
            alertElement.addEventListener('transitionend', () => alertElement.remove());
        }
    }, 3000);
};
