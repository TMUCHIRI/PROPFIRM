const BASE_URL = 'http://localhost:3000'; // Adjust if needed

class AdminClient {
    private token: string;

    constructor(token: string) {
        this.token = token;
    }

    async fetchAllUsers() {
        const response = await fetch(`${BASE_URL}/admin/users`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            }
        });
        if (!response.ok) throw new Error(await response.text());
        return response.json();
    }

    async fetchAllAccounts() {
        const response = await fetch(`${BASE_URL}/admin/accounts`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            }
        });
        if (!response.ok) throw new Error(await response.text());
        return response.json();
    }

    async fetchAllTrades() {
        const response = await fetch(`${BASE_URL}/admin/trades`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            }
        });
        if (!response.ok) throw new Error(await response.text());
        return response.json();
    }

    async fetchDashboardStats() {
        const response = await fetch(`${BASE_URL}/admin/stats`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            }
        });
        if (!response.ok) throw new Error(await response.text());
        return response.json();
    }

    async toggleAccountStatus(id: string, isActive: boolean) {
        const response = await fetch(`${BASE_URL}/admin/account-status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            },
            body: JSON.stringify({ id, isActive })
        });
        if (!response.ok) throw new Error(await response.text());
        return response.json();
    }

    async changeUserRole(userId: string, role: string) {
        const response = await fetch(`${BASE_URL}/admin/toggle-account`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            },
            body: JSON.stringify({ userId, role })
        });
        if (!response.ok) throw new Error(await response.text());
        return response.json();
    }

    async fetchAllTransactions() {
        const response = await fetch(`${BASE_URL}/accounts/transactions/get-all-transactions`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            }
        });
        if (!response.ok) throw new Error(await response.text());
        return response.json();
    }

    async fetchAllDemoTransactions() {
        const response = await fetch(`${BASE_URL}/admin/prop-transactions/demo`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            }
        });
        if (!response.ok) throw new Error(await response.text());
        return response.json();
    }

    async createPropAccount(
        title: string,
        tradingBalance: number,
        challengeFee: number,
        profitTargetPhase1?: number,
        profitTargetPhase2?: number,
        dailyLossLimit?: number,
        maxTrailingDrawdown?: number,
        minTradingDays?: number,
        leverageMax?: string,
        reEntryAllowed?: string,
        isDemo: boolean = false
    ) {
        const response = await fetch(`${BASE_URL}/admin/prop-accounts/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            },
            body: JSON.stringify({
                title, tradingBalance, challengeFee, profitTargetPhase1, profitTargetPhase2,
                dailyLossLimit, maxTrailingDrawdown, minTradingDays, leverageMax, reEntryAllowed, isDemo
            })
        });
        if (!response.ok) throw new Error(await response.text());
        return response.json();
    }

    async updatePropAccount(
        id: string,
        title: string,
        tradingBalance: number,
        challengeFee: number,
        profitTargetPhase1?: number,
        profitTargetPhase2?: number,
        dailyLossLimit?: number,
        maxTrailingDrawdown?: number,
        minTradingDays?: number,
        leverageMax?: string,
        reEntryAllowed?: string
    ) {
        const response = await fetch(`${BASE_URL}/admin/prop-accounts/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            },
            body: JSON.stringify({
                title, tradingBalance, challengeFee, profitTargetPhase1, profitTargetPhase2,
                dailyLossLimit, maxTrailingDrawdown, minTradingDays, leverageMax, reEntryAllowed
            })
        });
        if (!response.ok) throw new Error(await response.text());
        return response.json();
    }

    async fetchAllPropAccounts() {
        const response = await fetch(`${BASE_URL}/admin/prop-accounts/get-all-accounts`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            }
        });
        if (!response.ok) throw new Error(await response.text());
        return response.json();
    }
}

// Expose adminClient globally
(window as any).adminClient = function(token: string) {
    return new AdminClient(token);
};