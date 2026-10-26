/**
 * cep-service.js - Public Brazilian Address API Integration (ViaCEP / BrasilAPI)
 * Automatically fetches city, state, and neighborhood from 8-digit CEP with:
 * - Debouncing (prevents spamming requests)
 * - Fallback cascade: BrasilAPI -> ViaCEP -> Local cache
 * - Offline-safe (never breaks the form if network fails)
 */
(function(window) {
    'use strict';

    class CepService {
        constructor() {
            this.cache = new Map();
            this.debounceTimer = null;
        }

        validateCep(rawCep) {
            const clean = String(rawCep || '').replace(/\D/g, '');
            return clean.length === 8;
        }

        normalizeViaCep(data, cleanCep) {
            if (!data || data.erro) return null;
            return {
                cep: cleanCep,
                street: data.logradouro || '',
                neighborhood: data.bairro || '',
                city: data.localidade || '',
                state: data.uf || ''
            };
        }

        normalizeBrasilApi(data, cleanCep) {
            if (!data) return null;
            return {
                cep: cleanCep,
                street: data.street || '',
                neighborhood: data.neighborhood || '',
                city: data.city || '',
                state: data.state || ''
            };
        }

        setCache(cleanCep, addressData) {
            this.cache.set(cleanCep, addressData);
        }

        clearCache() {
            this.cache.clear();
        }

        async fetchAddress(rawCep) {
            const cep = (rawCep || '').replace(/\D/g, '');
            if (!this.validateCep(cep)) {
                return { success: false, error: 'CEP deve ter 8 dígitos.' };
            }

            // Check in-memory cache
            if (this.cache.has(cep)) {
                return { success: true, data: this.cache.get(cep), fromCache: true };
            }

            // Primary: BrasilAPI
            try {
                const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${cep}`, {
                    headers: { 'Accept': 'application/json' }
                });
                if (response.ok) {
                    const raw = await response.json();
                    const result = this.normalizeBrasilApi(raw, cep);
                    this.cache.set(cep, result);
                    return { success: true, data: result, provider: 'BrasilAPI' };
                }
            } catch (err) {
                // Failover to ViaCEP below
            }

            // Secondary Failover: ViaCEP
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                if (response.ok) {
                    const raw = await response.json();
                    if (!raw.erro) {
                        const result = this.normalizeViaCep(raw, cep);
                        this.cache.set(cep, result);
                        return { success: true, data: result, provider: 'ViaCEP' };
                    }
                }
            } catch (err) {
                // Offline fallback
            }

            return { success: false, error: 'Não foi possível consultar o CEP no momento.' };
        }

        bindCepInput(inputElement, onAddressResolved) {
            if (!inputElement) return;

            inputElement.addEventListener('input', (e) => {
                let v = e.target.value.replace(/\D/g, '');
                if (v.length > 8) v = v.substring(0, 8);
                if (v.length > 5) v = v.replace(/^(\d{5})(\d)/, '$1-$2');
                e.target.value = v;

                const clean = v.replace(/\D/g, '');
                if (clean.length === 8) {
                    clearTimeout(this.debounceTimer);
                    this.debounceTimer = setTimeout(async () => {
                        const result = await this.fetchAddress(clean);
                        if (result.success && typeof onAddressResolved === 'function') {
                            onAddressResolved(result.data);
                        }
                    }, 350);
                }
            });
        }
    }

    const cepService = new CepService();
    window.CepService = CepService;
    window.cepService = cepService;
})(typeof window !== 'undefined' ? window : this);
