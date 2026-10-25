/**
 * Notifications & Toast System (js/notifications.js)
 * Provides SweetAlert2 wrappers and lightweight floating CSS/JS toasts.
 */
(function(window) {
    'use strict';

    // Inject Toast Styles if not already present
    if (!document.getElementById('custom-toast-styles')) {
        const style = document.createElement('style');
        style.id = 'custom-toast-styles';
        style.innerHTML = `
            #toast-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 99999;
                display: flex;
                flex-direction: column;
                gap: 10px;
                max-width: 350px;
                width: 100%;
                pointer-events: none;
            }
            .custom-toast {
                pointer-events: auto;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 14px 18px;
                border-radius: 8px;
                color: #fff;
                font-family: inherit;
                font-size: 14px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                opacity: 0;
                transform: translateY(-20px);
                transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            }
            .custom-toast.show {
                opacity: 1;
                transform: translateY(0);
            }
            .custom-toast.hide {
                opacity: 0;
                transform: translateY(-20px);
            }
            .custom-toast.success { background-color: #10B981; }
            .custom-toast.error { background-color: #EF4444; }
            .custom-toast.info { background-color: #3B82F6; }
            .custom-toast.warning { background-color: #F59E0B; }
            .custom-toast .toast-msg {
                flex-grow: 1;
                margin-right: 10px;
                word-break: break-word;
            }
            .custom-toast .toast-close {
                background: none;
                border: none;
                color: #fff;
                font-size: 16px;
                cursor: pointer;
                opacity: 0.8;
                padding: 0;
            }
            .custom-toast .toast-close:hover {
                opacity: 1;
            }
        `;
        document.head.appendChild(style);
    }

    // Ensure container exists
    function getContainer() {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }
        return container;
    }

    const notify = {
        /**
         * Show success SweetAlert2 dialog or fallback
         */
        success: function(msg, title = 'Sucesso!') {
            if (typeof Swal !== 'undefined') {
                return Swal.fire({
                    icon: 'success',
                    title: title,
                    text: msg,
                    confirmButtonColor: '#10B981',
                    timer: 3000,
                    timerProgressBar: true
                });
            } else {
                return this.toast(msg, 'success');
            }
        },

        /**
         * Show error SweetAlert2 dialog or fallback
         */
        error: function(msg, title = 'Erro!') {
            if (typeof Swal !== 'undefined') {
                return Swal.fire({
                    icon: 'error',
                    title: title,
                    text: msg,
                    confirmButtonColor: '#EF4444'
                });
            } else {
                return this.toast(msg, 'error');
            }
        },

        /**
         * Show info SweetAlert2 dialog or fallback
         */
        info: function(msg, title = 'Informação') {
            if (typeof Swal !== 'undefined') {
                return Swal.fire({
                    icon: 'info',
                    title: title,
                    text: msg,
                    confirmButtonColor: '#3B82F6'
                });
            } else {
                return this.toast(msg, 'info');
            }
        },

        /**
         * Show a lightweight floating toast message
         */
        toast: function(msg, type = 'info', duration = 3500) {
            const container = getContainer();
            const toast = document.createElement('div');
            toast.className = `custom-toast ${type}`;
            
            toast.innerHTML = `
                <span class="toast-msg">${msg}</span>
                <button class="toast-close">&times;</button>
            `;

            const closeBtn = toast.querySelector('.toast-close');
            let timeoutId;

            const removeToast = () => {
                toast.classList.remove('show');
                toast.classList.add('hide');
                setTimeout(() => {
                    if (toast.parentElement) {
                        toast.parentElement.removeChild(toast);
                    }
                }, 300);
            };

            closeBtn.addEventListener('click', () => {
                clearTimeout(timeoutId);
                removeToast();
            });

            container.appendChild(toast);

            // Trigger entrance animation
            requestAnimationFrame(() => {
                toast.classList.add('show');
            });

            timeoutId = setTimeout(() => {
                removeToast();
            }, duration);

            return toast;
        }
    };

    window.notify = notify;
})(window);
