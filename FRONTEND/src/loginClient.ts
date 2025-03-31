
const baseUrl = 'http://localhost:3000';

class LoginClient {
    async login(email: string, password: string): Promise<{ token: string, role: string }> {
        const response = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Login failed');
        }

        const data = await response.json();
        return { token: data.token, role: data.user.role };
    }

    async register(username: string, email: string, password: string): Promise<{ token: string }> {
        const response = await fetch(`${baseUrl}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Registration failed');
        }
        const data = await response.json();
        return { token: data.token };
    }

    async resetPassword(email: string, password: string): Promise<{message: string}> {
        const response = await fetch(`${baseUrl}/auth/reset-password`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (!response.ok) {
            const errorText = await response.text();
            
            throw new Error(errorText || 'Password reset failed');
        }
        return response.json();
    }
}

// Expose loginClient globally
window.loginClient = new LoginClient();
 

