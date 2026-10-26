/**
 * validators.js - High-Precision Brazilian Document & Form Validation Library
 * 
 * Capabilities:
 * 1. CPF: Module 11 weighted algorithm with check digits and repeated digit blacklist.
 * 2. CNPJ: Module 11 algorithm for 14 digits with 2 verification digits (Corporate registration toggle).
 * 3. Phone/Mobile: Brazilian landline (10 digits) & mobile (11 digits with 9-digit rule) with auto-formatting mask.
 * 4. CEP: 8 digits format with instant mask '00000-000'.
 * 5. Email: RFC 5322 compliant regex with disposable email domain detection.
 * 6. Date of Birth / Age validator: Exact age calculation & minimum age enforcement (e.g. 18+).
 * 7. Password Strength: Entropy, complexity scoring (0-100), dictionary attack defense, and requirement auditing.
 * 8. Reactive input mask binding helpers: bindMask(inputEl, maskType), applyMask, and bindAllMasks.
 */

(function (root, factory) {
    'use strict';

    const library = factory();

    if (typeof exports === 'object' && typeof module !== 'undefined') {
        module.exports = library;
    }

    if (typeof window !== 'undefined') {
        // Expose under both Validators (standard modern API) and ValidatorLib (legacy backward compatibility)
        window.Validators = library;
        window.ValidatorLib = library;
    }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';

    // =========================================================================
    // CONSTANTS & REFERENCE TABLES
    // =========================================================================

    // Complete official Brazilian DDD (Direct Distance Dialing) area codes
    const VALID_DDDS = new Set([
        11, 12, 13, 14, 15, 16, 17, 18, 19, // SP
        21, 22, 24,                         // RJ
        27, 28,                             // ES
        31, 32, 33, 34, 35, 37, 38,         // MG
        41, 42, 43, 44, 45, 46,             // PR
        47, 48, 49,                         // SC
        51, 53, 54, 55,                     // RS
        61,                                 // DF
        62, 64,                             // GO
        63,                                 // TO
        65, 66,                             // MT
        67,                                 // MS
        68,                                 // AC
        69,                                 // RO
        71, 73, 74, 75, 77,                 // BA
        79,                                 // SE
        81, 87,                             // PE
        82,                                 // AL
        83,                                 // PB
        84,                                 // RN
        85, 88,                             // CE
        86, 89,                             // PI
        91, 93, 94,                         // PA
        92, 97,                             // AM
        95,                                 // RR
        96,                                 // AP
        98, 99                              // MA
    ]);

    // Comprehensive blacklist of known disposable/temporary/burner email providers
    const DISPOSABLE_EMAIL_DOMAINS = new Set([
        '10minutemail.com', '10minutemail.net', '10minutemail.org', '10minutemail.co.za',
        'armyspy.com', 'burnermail.io', 'byom.de', 'crazymailing.com', 'cuvox.de',
        'dayrep.com', 'discard.email', 'disposablemail.com', 'dispostable.com',
        'dropmail.me', 'einrot.com', 'emailondeck.com', 'fakeinbox.com', 'fakemail.net',
        'fakemailgenerator.com', 'fastmail.fm', 'fleckens.hu', 'generator.email',
        'getairmail.com', 'grr.la', 'guerrillamail.biz', 'guerrillamail.block',
        'guerrillamail.com', 'guerrillamail.de', 'guerrillamail.net', 'guerrillamail.org',
        'guerrillamailblock.com', 'gustr.com', 'inboxkitten.com', 'jourrapide.com',
        'maildrop.cc', 'mailinator.com', 'mintemail.com', 'mohmal.com', 'mohmal.in',
        'mytemp.email', 'nada.ltd', 'pokemail.net', 'rhyta.com', 'sharklasers.com',
        'spam4.me', 'spambog.com', 'superrito.com', 'teleworm.us', 'temp-mail.org',
        'tempinbox.com', 'tempmail.com', 'tempmail.net', 'tempmailaddress.com',
        'temporary-mail.net', 'throwawaymail.com', 'tinylink.in', 'trashmail.com',
        'trashmail.me', 'trashmail.net', 'yopmail.com', 'yopmail.fr', 'yopmail.net'
    ]);

    // Common passwords for dictionary attack defense
    const DICTIONARY_WORDS = [
        'password', '123456', 'qwerty', 'admin123', 'dragonball', 'kakaroto',
        'admin', '12345678', '123456789', '12345', 'brasil', 'senha', 'welcome', 'login'
    ];

    // RFC 5322 compliant simplified regex (supports standard addresses, subaddressing +, and IP hosts)
    const RFC5322_EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    // Weights for CNPJ verification digits (Module 11)
    const CNPJ_WEIGHTS_1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const CNPJ_WEIGHTS_2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    // =========================================================================
    // MASK FORMATTERS
    // =========================================================================

    const masks = {
        /**
         * Formats string to Brazilian CPF mask: 000.000.000-00
         * @param {string|number} value
         * @returns {string}
         */
        cpf(value) {
            const digits = String(value || '').replace(/\D/g, '').slice(0, 11);
            if (digits.length <= 3) return digits;
            if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
            if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
            return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
        },

        /**
         * Formats string to Brazilian CNPJ mask: 00.000.000/0001-00
         * @param {string|number} value
         * @returns {string}
         */
        cnpj(value) {
            const digits = String(value || '').replace(/\D/g, '').slice(0, 14);
            if (digits.length <= 2) return digits;
            if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
            if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
            if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
            return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
        },

        /**
         * Adaptive mask: formats as CPF if <= 11 digits, or CNPJ if > 11 digits.
         * Ideal for toggle-free dynamic Brazilian document fields.
         * @param {string|number} value
         * @returns {string}
         */
        cpfCnpj(value) {
            const digits = String(value || '').replace(/\D/g, '').slice(0, 14);
            return digits.length > 11 ? masks.cnpj(digits) : masks.cpf(digits);
        },

        /**
         * Formats Brazilian phone numbers:
         * Landline (10 digits): (00) 0000-0000
         * Mobile (11 digits):   (00) 00000-0000
         * @param {string|number} value
         * @returns {string}
         */
        phone(value) {
            const digits = String(value || '').replace(/\D/g, '').slice(0, 11);
            if (digits.length === 0) return '';
            if (digits.length <= 2) return `(${digits}`;
            if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
            if (digits.length <= 10) {
                return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
            }
            return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
        },

        /**
         * Formats Brazilian postal code CEP: 00000-000
         * @param {string|number} value
         * @returns {string}
         */
        cep(value) {
            const digits = String(value || '').replace(/\D/g, '').slice(0, 8);
            if (digits.length <= 5) return digits;
            return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
        },

        /**
         * Formats Brazilian date: DD/MM/YYYY
         * @param {string|number} value
         * @returns {string}
         */
        date(value) {
            const digits = String(value || '').replace(/\D/g, '').slice(0, 8);
            if (digits.length <= 2) return digits;
            if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
            return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
        },

        /**
         * Formats currency to Brazilian Real: R$ 1.234,56
         * @param {string|number} value
         * @returns {string}
         */
        currency(value) {
            const digits = String(value || '').replace(/\D/g, '');
            if (!digits) return '';
            const number = (parseInt(digits, 10) / 100).toFixed(2);
            const [integerPart, decimalPart] = number.split('.');
            const formattedInt = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
            return `R$ ${formattedInt},${decimalPart}`;
        }
    };

    // =========================================================================
    // VALIDATORS
    // =========================================================================

    /**
     * Strict Brazilian CPF Validator
     * - Sanitizes input
     * - Enforces exact 11 digits
     * - Blacklists repeated digits (000.000.000-00, 111.111.111-11, etc.)
     * - Calculates and validates 1st and 2nd verification digits using Module 11
     * @param {string|number} value
     * @returns {boolean}
     */
    function validateCPF(value) {
        const cpf = String(value || '').replace(/\D/g, '');
        if (cpf.length !== 11) return false;

        // Blacklist identical sequences (11111111111, 22222222222, ...)
        if (/^(\d)\1{10}$/.test(cpf)) return false;

        // Calculate 1st verification digit
        let sum1 = 0;
        for (let i = 0; i < 9; i++) {
            sum1 += parseInt(cpf.charAt(i), 10) * (10 - i);
        }
        let rem1 = sum1 % 11;
        let digit1 = rem1 < 2 ? 0 : 11 - rem1;
        if (parseInt(cpf.charAt(9), 10) !== digit1) return false;

        // Calculate 2nd verification digit
        let sum2 = 0;
        for (let i = 0; i < 10; i++) {
            sum2 += parseInt(cpf.charAt(i), 10) * (11 - i);
        }
        let rem2 = sum2 % 11;
        let digit2 = rem2 < 2 ? 0 : 11 - rem2;
        if (parseInt(cpf.charAt(10), 10) !== digit2) return false;

        return true;
    }

    /**
     * Strict Brazilian CNPJ Validator
     * - Sanitizes input
     * - Enforces exact 14 digits
     * - Blacklists repeated digits (00000000000000, 11111111111111, ...)
     * - Calculates and validates 1st and 2nd verification digits using Module 11 weights
     * @param {string|number} value
     * @returns {boolean}
     */
    function validateCNPJ(value) {
        const cnpj = String(value || '').replace(/\D/g, '');
        if (cnpj.length !== 14) return false;

        // Blacklist identical sequences
        if (/^(\d)\1{13}$/.test(cnpj)) return false;

        // Calculate 1st verification digit
        let sum1 = 0;
        for (let i = 0; i < 12; i++) {
            sum1 += parseInt(cnpj.charAt(i), 10) * CNPJ_WEIGHTS_1[i];
        }
        let rem1 = sum1 % 11;
        let digit1 = rem1 < 2 ? 0 : 11 - rem1;
        if (parseInt(cnpj.charAt(12), 10) !== digit1) return false;

        // Calculate 2nd verification digit
        let sum2 = 0;
        for (let i = 0; i < 13; i++) {
            sum2 += parseInt(cnpj.charAt(i), 10) * CNPJ_WEIGHTS_2[i];
        }
        let rem2 = sum2 % 11;
        let digit2 = rem2 < 2 ? 0 : 11 - rem2;
        if (parseInt(cnpj.charAt(13), 10) !== digit2) return false;

        return true;
    }

    /**
     * Validates either CPF (11 digits) or CNPJ (14 digits) based on length.
     * @param {string|number} value
     * @returns {boolean}
     */
    function validateCpfOrCnpj(value) {
        const clean = String(value || '').replace(/\D/g, '');
        if (clean.length === 11) return validateCPF(clean);
        if (clean.length === 14) return validateCNPJ(clean);
        return false;
    }

    /**
     * Strict Brazilian Phone & Mobile Validator
     * - Enforces 10 (landline) or 11 (mobile) digits
     * - Validates official Brazilian DDD area codes
     * - Landline rule: 3rd digit must start with 2, 3, 4, or 5
     * - Mobile rule: 9-digit rule (3rd digit must be 9) and 4th digit between 2 and 9
     * - Blacklists repeating numbers like (11) 99999-9999 or (11) 2222-2222
     * @param {string|number} value
     * @returns {boolean}
     */
    function validatePhone(value) {
        const clean = String(value || '').replace(/\D/g, '');
        if (clean.length !== 10 && clean.length !== 11) return false;

        const ddd = parseInt(clean.substring(0, 2), 10);
        if (!VALID_DDDS.has(ddd)) return false;

        const numberBody = clean.substring(2);

        if (clean.length === 10) {
            // Landline: must start with 2, 3, 4, or 5
            const firstDigit = numberBody.charAt(0);
            if (!['2', '3', '4', '5'].includes(firstDigit)) return false;
            // Reject repeated body (e.g. 22222222)
            if (/^(\d)\1{7}$/.test(numberBody)) return false;
            return true;
        } else {
            // Mobile: 9th digit rule (must start with 9)
            if (numberBody.charAt(0) !== '9') return false;
            // 2nd digit of mobile must be in range 2-9
            if (!/[2-9]/.test(numberBody.charAt(1))) return false;
            // Reject repeated body (e.g. 999999999)
            if (/^(\d)\1{8}$/.test(numberBody)) return false;
            return true;
        }
    }

    /**
     * Brazilian CEP (Postal Code) Validator
     * - Enforces exact 8 digits
     * - Rejects all-zero '00000000'
     * @param {string|number} value
     * @returns {boolean}
     */
    function validateCEP(value) {
        const clean = String(value || '').replace(/\D/g, '');
        if (clean.length !== 8) return false;
        if (clean === '00000000') return false;
        return /^\d{8}$/.test(clean);
    }

    /**
     * Checks if domain or full email belongs to known disposable email services.
     * @param {string} email
     * @returns {boolean}
     */
    function isDisposableEmail(email) {
        if (typeof email !== 'string') return false;
        const parts = email.trim().toLowerCase().split('@');
        if (parts.length !== 2) return false;
        const domain = parts[1];
        return DISPOSABLE_EMAIL_DOMAINS.has(domain);
    }

    /**
     * Comprehensive RFC 5322 Email Validator with Disposable Domain Detection
     * @param {string} value
     * @param {object|boolean} [options={ allowDisposable: false }]
     * @returns {boolean}
     */
    function validateEmail(value, options = {}) {
        if (typeof value !== 'string') return false;
        const email = value.trim().toLowerCase();
        if (!email || !RFC5322_EMAIL_REGEX.test(email)) return false;

        const allowDisposable = typeof options === 'boolean' ? options : !!options.allowDisposable;
        if (!allowDisposable && isDisposableEmail(email)) {
            return false;
        }

        return true;
    }

    /**
     * Detailed Email Inspection Helper
     * @param {string} value
     * @returns {{ isValid: boolean, isFormatValid: boolean, isDisposable: boolean, domain: string, error: string|null }}
     */
    function validateEmailDetails(value) {
        if (typeof value !== 'string') {
            return { isValid: false, isFormatValid: false, isDisposable: false, domain: '', error: 'INVALID_INPUT' };
        }
        const email = value.trim().toLowerCase();
        const parts = email.split('@');
        const domain = parts.length === 2 ? parts[1] : '';
        const isFormatValid = RFC5322_EMAIL_REGEX.test(email);

        if (!isFormatValid) {
            return { isValid: false, isFormatValid: false, isDisposable: false, domain, error: 'INVALID_FORMAT' };
        }

        const disposable = isDisposableEmail(email);
        if (disposable) {
            return { isValid: false, isFormatValid: true, isDisposable: true, domain, error: 'DISPOSABLE_DOMAIN' };
        }

        return { isValid: true, isFormatValid: true, isDisposable: false, domain, error: null };
    }

    /**
     * Parses Brazilian (DD/MM/YYYY) or ISO (YYYY-MM-DD) date string or Date instance.
     * Validates leap years and calendar day boundaries.
     * @param {string|Date} value
     * @returns {Date|null}
     */
    function parseDate(value) {
        if (value instanceof Date) {
            return isNaN(value.getTime()) ? null : value;
        }
        if (typeof value !== 'string') return null;

        const str = value.trim();

        // Format DD/MM/YYYY or DD-MM-YYYY
        const brMatch = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/.exec(str);
        if (brMatch) {
            const day = parseInt(brMatch[1], 10);
            const month = parseInt(brMatch[2], 10);
            const year = parseInt(brMatch[3], 10);
            if (month < 1 || month > 12 || day < 1 || day > 31) return null;
            const date = new Date(year, month - 1, day);
            if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
                return null;
            }
            return date;
        }

        // Format YYYY-MM-DD
        const isoMatch = /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/.exec(str);
        if (isoMatch) {
            const year = parseInt(isoMatch[1], 10);
            const month = parseInt(isoMatch[2], 10);
            const day = parseInt(isoMatch[3], 10);
            if (month < 1 || month > 12 || day < 1 || day > 31) return null;
            const date = new Date(year, month - 1, day);
            if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
                return null;
            }
            return date;
        }

        return null;
    }

    /**
     * Calculates exact integer age comparing day, month, and year against current date.
     * @param {string|Date} birthDate
     * @returns {number|null}
     */
    function calculateAge(birthDate) {
        const birth = parseDate(birthDate);
        if (!birth) return null;

        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }

        return age;
    }

    /**
     * Validates Date of Birth and minimum/maximum age (default: 18+ and <= 120 years).
     * @param {string|Date} birthDate
     * @param {number} [minAge=18]
     * @param {number} [maxAge=120]
     * @returns {boolean}
     */
    function validateBirthDate(birthDate, minAge = 18, maxAge = 120) {
        const birth = parseDate(birthDate);
        if (!birth) return false;

        const today = new Date();
        if (birth > today) return false; // Future birth date is invalid

        const age = calculateAge(birth);
        if (age === null || age < minAge) return false;
        if (maxAge != null && age > maxAge) return false;

        return true;
    }

    /**
     * Detailed Birth Date Inspection Helper
     * @param {string|Date} birthDate
     * @param {number} [minAge=18]
     * @param {number} [maxAge=120]
     * @returns {{ isValid: boolean, age: number|null, isAdult: boolean, error: string|null }}
     */
    function validateBirthDateDetails(birthDate, minAge = 18, maxAge = 120) {
        const birth = parseDate(birthDate);
        if (!birth) {
            return { isValid: false, age: null, isAdult: false, error: 'INVALID_DATE' };
        }

        const today = new Date();
        if (birth > today) {
            return { isValid: false, age: null, isAdult: false, error: 'FUTURE_DATE' };
        }

        const age = calculateAge(birth);
        if (age === null) {
            return { isValid: false, age: null, isAdult: false, error: 'INVALID_DATE' };
        }

        if (age < minAge) {
            return { isValid: false, age, isAdult: false, error: 'UNDERAGE' };
        }

        if (maxAge != null && age > maxAge) {
            return { isValid: false, age, isAdult: true, error: 'OVER_MAX_AGE' };
        }

        return { isValid: true, age, isAdult: age >= 18, error: null };
    }

    /**
     * Checks if password contains dictionary words or common leetspeak substitutions.
     * @param {string} password
     * @returns {{ isDictionary: boolean, word: string|null }}
     */
    function checkDictionaryAttack(password) {
        if (!password || typeof password !== 'string') {
            return { isDictionary: false, word: null };
        }
        const clean = password.toLowerCase().trim();
        // Normalized leetspeak replacements
        const leet = clean
            .replace(/@/g, 'a')
            .replace(/0/g, 'o')
            .replace(/1/g, 'i')
            .replace(/3/g, 'e')
            .replace(/4/g, 'a')
            .replace(/\$/g, 's')
            .replace(/5/g, 's')
            .replace(/!/g, 'i')
            .replace(/7/g, 't');

        // Strip simple leading/trailing digits and common symbols for comparison
        const strippedClean = clean.replace(/^[!@#$%&*0-9]+|[!@#$%&*0-9]+$/g, '');
        const strippedLeet = leet.replace(/^[!@#$%&*0-9]+|[!@#$%&*0-9]+$/g, '');

        for (const term of DICTIONARY_WORDS) {
            if (clean === term || leet === term ||
                strippedClean === term || strippedLeet === term ||
                (clean.length <= term.length + 4 && (clean.includes(term) || leet.includes(term)))) {
                return { isDictionary: true, word: term };
            }
        }
        return { isDictionary: false, word: null };
    }

    /**
     * Boolean helper for dictionary attack detection.
     * @param {string} password
     * @returns {boolean}
     */
    function isDictionaryPassword(password) {
        return checkDictionaryAttack(password).isDictionary;
    }

    /**
     * Password Entropy & Security Auditor
     * @param {string} password
     * @returns {{ score: number, level: string, color: string, feedback: string, requirements: object, checks: object }}
     */
    function getPasswordStrength(password) {
        const pwd = String(password || '');
        const length = pwd.length;

        const hasLowercase = /[a-z]/.test(pwd);
        const hasUppercase = /[A-Z]/.test(pwd);
        const hasNumber = /\d/.test(pwd);
        const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
        const dictCheck = checkDictionaryAttack(pwd);
        const isNotDictionary = !dictCheck.isDictionary;

        const requirements = {
            hasLength: length >= 8,
            hasLength8: length >= 8,
            minLength: length >= 6,
            hasLowercase,
            hasUppercase,
            hasNumber,
            hasSpecial,
            isNotDictionary,
            // Aliases for legacy checks
            length: length >= 8,
            lowercase: hasLowercase,
            uppercase: hasUppercase,
            number: hasNumber,
            special: hasSpecial
        };

        let score = 0;
        if (length >= 6) score += 10;
        if (length >= 8) score += 15;
        if (length >= 12) score += 15;
        if (hasLowercase) score += 15;
        if (hasUppercase) score += 15;
        if (hasNumber) score += 15;
        if (hasSpecial) score += 15;

        // Variety bonus
        const varietyCount = [hasLowercase, hasUppercase, hasNumber, hasSpecial].filter(Boolean).length;
        if (varietyCount >= 3 && length >= 8) score += 10;

        // Strict penalization for short passwords
        if (length < 6) {
            score = Math.min(score, 25);
        } else if (length < 8 && varietyCount <= 2) {
            score = Math.min(score, 40);
        }

        // Severe penalization for dictionary attacks
        if (dictCheck.isDictionary) {
            score = Math.min(score, 40);
        }

        score = Math.max(0, Math.min(100, score));

        let level = 'weak';
        let color = '#ff4d4d'; // Red
        let feedback = 'Senha fraca. Recomendamos no mínimo 8 caracteres, mesclando letras maiúsculas, minúsculas, números e símbolos.';

        if (score >= 80) {
            level = 'strong';
            color = '#2ecc71'; // Green
            feedback = 'Senha forte e segura!';
        } else if (score >= 50) {
            level = 'medium';
            color = '#f1c40f'; // Yellow
            feedback = 'Senha razoável. Adicione caracteres especiais e números para aumentar a proteção.';
        }

        return {
            score,
            level,
            color,
            feedback,
            requirements,
            checks: requirements
        };
    }

    // =========================================================================
    // REACTIVE INPUT MASK BINDING HELPERS
    // =========================================================================

    /**
     * Binds a reactive formatting mask to an HTML input element.
     * Features:
     * - Preserves cursor position during typing/editing inside the input
     * - Formats initial content immediately
     * - Returns unbind() controller for cleanup in SPA lifecycle
     * @param {HTMLInputElement|string} inputEl - Target element or selector string
     * @param {string|Function} maskType - 'cpf' | 'cnpj' | 'cpfCnpj' | 'phone' | 'cep' | 'date' | 'currency' or custom function
     * @param {object} [options={}] - Optional callbacks (e.g. onChange)
     * @returns {{ element: HTMLInputElement, maskType: string, unbind: Function, apply: Function }|null}
     */
    function bindMask(inputEl, maskType, options = {}) {
        const element = typeof inputEl === 'string' && typeof document !== 'undefined'
            ? document.querySelector(inputEl)
            : inputEl;

        if (!element || typeof element.addEventListener !== 'function') {
            return null;
        }

        const maskFn = typeof maskType === 'function' ? maskType : masks[maskType];
        if (!maskFn) {
            if (typeof console !== 'undefined' && console.warn) {
                console.warn(`[Validators] Mask type "${maskType}" not found.`);
            }
            return null;
        }

        const inputHandler = function (e) {
            const input = e.target;
            const previousValue = input.value;
            const cursorPosition = input.selectionStart || 0;

            // Count how many non-formatting digits occurred before current cursor
            const rawBeforeCursor = previousValue.slice(0, cursorPosition).replace(/\D/g, '').length;

            // Apply formatting
            const formatted = maskFn(input.value);
            input.value = formatted;

            // Recalculate cursor position to avoid jumping to end of input
            let newCursor = 0;
            let digitsCounted = 0;
            for (let i = 0; i < formatted.length; i++) {
                if (/\d/.test(formatted[i])) {
                    digitsCounted++;
                }
                if (digitsCounted >= rawBeforeCursor) {
                    newCursor = i + 1;
                    break;
                }
            }
            if (rawBeforeCursor === 0) newCursor = 0;
            if (digitsCounted < rawBeforeCursor) newCursor = formatted.length;

            try {
                input.setSelectionRange(newCursor, newCursor);
            } catch (_) {}

            if (typeof options.onChange === 'function') {
                options.onChange(formatted, formatted.replace(/\D/g, ''));
            }
        };

        element.addEventListener('input', inputHandler);

        // Instantly format initial value if present
        if (element.value) {
            element.value = maskFn(element.value);
        }

        return {
            element,
            maskType,
            unbind() {
                element.removeEventListener('input', inputHandler);
            },
            apply() {
                element.value = maskFn(element.value);
            }
        };
    }

    /**
     * Backward-compatible alias for bindMask.
     */
    function applyMask(inputElement, maskType, options) {
        return bindMask(inputElement, maskType, options);
    }

    /**
     * Automatically binds masks to all elements containing [data-mask] attributes.
     * Example: <input data-mask="cpf">, <input data-mask="phone">, <input data-mask="cep">
     * @param {HTMLElement|Document} [root=document]
     * @returns {Array} List of active binding controllers
     */
    function bindAllMasks(root) {
        const container = root || (typeof document !== 'undefined' ? document : null);
        if (!container || typeof container.querySelectorAll !== 'function') return [];

        const elements = container.querySelectorAll('[data-mask]');
        const bindings = [];

        elements.forEach(el => {
            const type = el.getAttribute('data-mask');
            if (type) {
                const b = bindMask(el, type);
                if (b) bindings.push(b);
            }
        });

        return bindings;
    }

    // =========================================================================
    // EXPORTED FACADE
    // =========================================================================

    const validatorsCollection = {
        cpf: validateCPF,
        cnpj: validateCNPJ,
        cpfCnpj: validateCpfOrCnpj,
        phone: validatePhone,
        cep: validateCEP,
        email: validateEmail,
        isDisposableEmail,
        validateEmailDetails,
        birthDate: validateBirthDate,
        validateBirthDateDetails,
        calculateAge,
        passwordStrength: getPasswordStrength,
        checkDictionaryAttack,
        isDictionaryPassword
    };

    return {
        // Direct validator functions
        validateCPF,
        validateCNPJ,
        validateCpfOrCnpj,
        validatePhone,
        validateCEP,
        validateEmail,
        isDisposableEmail,
        validateEmailDetails,
        calculateAge,
        validateBirthDate,
        validateBirthDateDetails,
        getPasswordStrength,
        checkDictionaryAttack,
        isDictionaryPassword,

        // Namespaced collections
        masks,
        validators: validatorsCollection,

        // Mask binding helpers
        bindMask,
        applyMask,
        bindAllMasks
    };
});
