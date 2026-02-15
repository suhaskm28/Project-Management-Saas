let isRefreshing = false;

export async function api<T>(
    path: string,
    options: RequestInit = {},
): Promise<T> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const url = `${baseUrl}${path}`;
    const config = {
        credentials: 'include' as RequestCredentials,
        headers: {
            'Content-Type': 'application/json',
        },
        ...options,
    };

    let res = await fetch(url, config);

    // If 401 and not already refreshing, try to refresh token
    if (res.status === 401 && !path.includes('/auth/refresh') && !isRefreshing) {
        isRefreshing = true;
        try {
            const refreshRes = await fetch(`${baseUrl}/auth/refresh`, {
                method: 'POST',
                credentials: 'include',
            });

            if (refreshRes.ok) {
                // Refresh succeeded, retry original request
                res = await fetch(url, config);
            } else {
                // Refresh failed, redirect to login if we're in the browser
                if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
                    window.location.href = '/login';
                }
            }
        } catch (err) {
            console.error('Token refresh failed:', err);
        } finally {
            isRefreshing = false;
        }
    }

    if (!res.ok) {
        throw new Error(await res.text() || res.statusText);
    }

    return res.json();
}
