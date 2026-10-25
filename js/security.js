/**
 * security.js - Security & Accessibility (a11y) Hardening
 * 1. XSS Sanitization
 * 2. Frontend Brute-force Prevention (Lockout after 5 failed attempts)
 * 3. Accessibility Audit & Injection (ARIA labels, keyboard navigation, focus management)
 */

(function() {
    'use strict';

    // 1. XSS Sanitization
    window.SecurityUtils = {
        sanitizeHTML: function(str) {
            if (typeof str !== 'string') return '';
            const temp = document.createElement('div');
            temp.textContent = str;
            return temp.innerHTML;
        },

        sanitizeInput: function(inputElement) {
            if (inputElement && typeof inputElement.value === 'string') {
                inputElement.value = this.sanitizeHTML(inputElement.value.trim());
            }
        }
    };

    // 2. Brute-force Prevention (Frontend Rate Limiting)
    const BruteForceProtection = {
        MAX_ATTEMPTS: 5,
        LOCKOUT_TIME_MS: 30000, // 30 seconds
        STORAGE_KEY_ATTEMPTS: 'sec_login_attempts',
        STORAGE_KEY_LOCKOUT: 'sec_lockout_until',

        checkLockout: function() {
            const lockoutUntil = localStorage.getItem(this.STORAGE_KEY_LOCKOUT);
            if (lockoutUntil && Date.now() < parseInt(lockoutUntil, 10)) {
                const remaining = Math.ceil((parseInt(lockoutUntil, 10) - Date.now()) / 1000);
                return { locked: true, remainingSeconds: remaining };
            }
            if (lockoutUntil && Date.now() >= parseInt(lockoutUntil, 10)) {
                localStorage.removeItem(this.STORAGE_KEY_LOCKOUT);
                localStorage.setItem(this.STORAGE_KEY_ATTEMPTS, '0');
            }
            return { locked: false };
        },

        recordFailedAttempt: function() {
            let attempts = parseInt(localStorage.getItem(this.STORAGE_KEY_ATTEMPTS) || '0', 10) + 1;
            localStorage.setItem(this.STORAGE_KEY_ATTEMPTS, attempts.toString());
            if (attempts >= this.MAX_ATTEMPTS) {
                const lockoutTime = Date.now() + this.LOCKOUT_TIME_MS;
                localStorage.setItem(this.STORAGE_KEY_LOCKOUT, lockoutTime.toString());
                return { locked: true, remainingSeconds: this.LOCKOUT_TIME_MS / 1000 };
            }
            return { locked: false, attemptsRemaining: this.MAX_ATTEMPTS - attempts };
        },

        resetAttempts: function() {
            localStorage.removeItem(this.STORAGE_KEY_ATTEMPTS);
            localStorage.removeItem(this.STORAGE_KEY_LOCKOUT);
        }
    };

    window.BruteForceProtection = BruteForceProtection;

    // 3. Accessibility (a11y) Injections & Focus Management
    function initA11y() {
        // Enhance form inputs with ARIA labels if missing
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (!input.getAttribute('aria-label') && !input.id) {
                const placeholder = input.getAttribute('placeholder');
                if (placeholder) {
                    input.setAttribute('aria-label', placeholder);
                }
            }
        });

        // Keyboard navigation and focus trapping for modals/dialogs
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const activeModals = document.querySelectorAll('.modal.active, [role="dialog"][aria-hidden="false"]');
                activeModals.forEach(modal => {
                    modal.classList.remove('active');
                    modal.setAttribute('aria-hidden', 'true');
                });
            }
        });

        // Ensure buttons and interactive elements are focusable and have role
        const clickable = document.querySelectorAll('.btn, button');
        clickable.forEach(el => {
            if (!el.getAttribute('tabindex')) {
                el.setAttribute('tabindex', '0');
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initA11y);
    } else {
        initA11y();
    }
})();
