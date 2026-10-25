/**
 * validators.js - Comprehensive Input Mask & Validation Library
 * - CPF, Cellphone/WhatsApp, and CEP real-time input masks
 * - Strict CPF validator (Mod 11 & repetition check)
 * - Password strength meter (0-100%, visual bar, requirements)
 * - RFC 5322 Email format validator
 */

(function (window) {
    'use strict';

    // --- MASK UTILITIES ---
    const masks = {
        cpf(value) {
            return value
                .replace(/\D/g, '')
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d{1,2})/, '$1-$2')
                .replace(/(-\d{2})\d+$/, '$1');
        },
        phone(value) {
            return value
                .replace(/\D/g, '')
                .replace(/^(\d{2})(\d)/, '($1) $2')
                .replace(/(\d{5})(\d)/, '$1-$2')
                .replace(/(-\d{4})\d+$/, '$1');
        },
        cep(value) {
            return value
                .replace(/\D/g, '')
                .replace(/^(\d{5})(\d)/, '$1-$2')
                .replace(/(-\d{3})\d+$/, '$1');
        }
    };

    // --- VALIDATORS ---
    const validators = {
        cpf(value) {
            const cpf = value.replace(/\D/g, '');
            if (cpf.length !== 11) return false;
            
            // Check for known invalid DNs (all digits same)
            if (/^(\d)\1+$/.test(cpf)) return false;

            // Validate 1st digit
            let sum = 0;
            for (let i = 0; i < 9; i++) {
                sum += parseInt(cpf.charAt(i)) * (10 - i);
            }
            let rev = 11 - (sum % 11);
            if (rev === 10 || rev === 11) rev = 0;
            if (rev !== parseInt(cpf.charAt(9))) return false;

            // Validate 2nd digit
            sum = 0;
            for (let i = 0; i < 10; i++) {
                sum += parseInt(cpf.charAt(i)) * (11 - i);
            }
            rev = 11 - (sum % 11);
            if (rev === 10 || rev === 11) rev = 0;
            if (rev !== parseInt(cpf.charAt(10))) return false;

            return true;
        },

        email(value) {
            // RFC 5322 compliant simplified regex
            const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(String(value).toLowerCase());
        },

        passwordStrength(password) {
            let score = 0;
            const checks = {
                length: password.length >= 8,
                lowercase: /[a-z]/.test(password),
                uppercase: /[A-Z]/.test(password),
                number: /\d/.test(password),
                special: /[^A-Za-z0-9]/.test(password)
            };

            if (checks.length) score += 20;
            if (checks.lowercase) score += 20;
            if (checks.uppercase) score += 20;
            if (checks.number) score += 20;
            if (checks.special) score += 20;

            let color = '#ff4d4d'; // Red
            if (score >= 80) {
                color = '#2ecc71'; // Green
            } else if (score >= 40) {
                color = '#f1c40f'; // Yellow/Orange
            }

            return {
                score,
                color,
                checks
            };
        }
    };

    // --- AUTO-BINDING HELPER ---
    function applyMask(inputElement, maskType) {
        if (!inputElement) return;
        inputElement.addEventListener('input', (e) => {
            const cursor = e.target.selectionStart;
            const oldLength = e.target.value.length;
            if (masks[maskType]) {
                e.target.value = masks[maskType](e.target.value);
            }
            const newLength = e.target.value.length;
            const newCursor = Math.max(0, cursor + (newLength - oldLength));
            e.target.setSelectionRange(newCursor, newCursor);
        });
    }

    // Expose globally
    window.ValidatorLib = {
        masks,
        validators,
        applyMask
    };

})(window);
