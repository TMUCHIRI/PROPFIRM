const API_URL = 'http://localhost:3000';

class AccountClient {
    constructor(private token: string) {}

    async createAccount(userId: string, type: 'live' | 'demo'): Promise<{ id: string }> {
        const response = await fetch(`${API_URL}/accounts/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            },
            body: JSON.stringify({ userId, type })
        });
        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        return { id: data.accountId };
    }

    async startChallenge(userId: string, accountId: string, propAccountId: string): Promise<any> {
        const response = await fetch(`${API_URL}/accounts/challenges/start`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            },
            body: JSON.stringify({ userId, accountId, propAccountId })
        });
        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        return data.transaction;
    }

    async getAllPropAccounts(): Promise<any[]> {
        const response = await fetch(`${API_URL}/admin/prop-accounts/get-all-accounts`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            }
        });
        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        return data.propAccounts;
    }

    async getUserTransactions(userId: string): Promise<any[]> {
        const response = await fetch(`${API_URL}/accounts/transactions/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            }
        });
        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        return data.transactions;
    }

    async simulateTrade(accountId: string, transactionId: string, amount: number, description: string): Promise<any> {
        const response = await fetch(`${API_URL}/accounts/challenges/simulate-trade`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            },
            body: JSON.stringify({ accountId, transactionId, amount, description })
        });
        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        return data.result;
    }

    async startDemoChallenge(userId: string, accountId: string, propAccountId: string): Promise<any> {
        const response = await fetch(`${API_URL}/accounts/demo-challenges/start`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            },
            body: JSON.stringify({ userId, accountId, propAccountId })
        });
        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        return data.transaction;
    }

    async getUserTradeTransactions(userId: string): Promise<any[]> {
        const response = await fetch(`${API_URL}/accounts/trade-transactions/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            }
        });
        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        return data.trades;
    }

    async getAccount(accountId: string): Promise<{ id: string; type: string; userId: string; isActive: boolean }> {
        const response = await fetch(`${API_URL}/accounts/${accountId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            }
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch account ${accountId}: ${errorText}`);
        }
        const data = await response.json();
        if (!data.account) throw new Error(`No account data returned for ${accountId}`);
        return data.account; // Must return { id, type, userId, isActive }
    }

    async getUserDemoTransactions(userId: string): Promise<any[]> {
        const response = await fetch(`${API_URL}/accounts/transactions/demo/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            }
        });
        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        return data.transactions;
    }
}

window.accountClient = function(token: string) {
    return new AccountClient(token);
};