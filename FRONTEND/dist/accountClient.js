"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const API_URL = 'http://localhost:3000';
class AccountClient {
    constructor(token) {
        this.token = token;
    }
    createAccount(userId, type) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(`${API_URL}/accounts/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ userId, type })
            });
            if (!response.ok)
                throw new Error(yield response.text());
            const data = yield response.json();
            return { id: data.accountId };
        });
    }
    startChallenge(userId, accountId, propAccountId) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(`${API_URL}/accounts/challenges/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ userId, accountId, propAccountId })
            });
            if (!response.ok)
                throw new Error(yield response.text());
            const data = yield response.json();
            return data.transaction;
        });
    }
    getAllPropAccounts() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(`${API_URL}/admin/prop-accounts/get-all-accounts`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                }
            });
            if (!response.ok)
                throw new Error(yield response.text());
            const data = yield response.json();
            return data.propAccounts;
        });
    }
    getUserTransactions(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(`${API_URL}/accounts/transactions/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                }
            });
            if (!response.ok)
                throw new Error(yield response.text());
            const data = yield response.json();
            return data.transactions;
        });
    }
    simulateTrade(accountId, transactionId, amount, description) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(`${API_URL}/accounts/challenges/simulate-trade`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ accountId, transactionId, amount, description })
            });
            if (!response.ok)
                throw new Error(yield response.text());
            const data = yield response.json();
            return data.result;
        });
    }
    startDemoChallenge(userId, accountId, propAccountId) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(`${API_URL}/accounts/demo-challenges/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ userId, accountId, propAccountId })
            });
            if (!response.ok)
                throw new Error(yield response.text());
            const data = yield response.json();
            return data.transaction;
        });
    }
    getUserTradeTransactions(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(`${API_URL}/accounts/trade-transactions/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                }
            });
            if (!response.ok)
                throw new Error(yield response.text());
            const data = yield response.json();
            return data.trades;
        });
    }
    getAccount(accountId) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(`${API_URL}/accounts/${accountId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                }
            });
            if (!response.ok) {
                const errorText = yield response.text();
                throw new Error(`Failed to fetch account ${accountId}: ${errorText}`);
            }
            const data = yield response.json();
            if (!data.account)
                throw new Error(`No account data returned for ${accountId}`);
            return data.account; // Must return { id, type, userId, isActive }
        });
    }
    getUserDemoTransactions(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(`${API_URL}/accounts/transactions/demo/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                }
            });
            if (!response.ok)
                throw new Error(yield response.text());
            const data = yield response.json();
            return data.transactions;
        });
    }
}
window.accountClient = function (token) {
    return new AccountClient(token);
};
