const resolvePayPalBaseUrl = () => {
        const env = (process.env.PAYPAL_ENV || "sandbox").toLowerCase();
        return env === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
};

const getPayPalAuthHeader = () => {
        const clientId = process.env.PAYPAL_CLIENT_ID;
        const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
                throw new Error("Missing PayPal credentials");
        }

        const encoded = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
        return `Basic ${encoded}`;
};

export const getPayPalAccessToken = async () => {
        const baseUrl = resolvePayPalBaseUrl();
        const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
                method: "POST",
                headers: {
                        Authorization: getPayPalAuthHeader(),
                        "Content-Type": "application/x-www-form-urlencoded",
                },
                body: "grant_type=client_credentials",
        });

        if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`PayPal token request failed: ${errorText}`);
        }

        const data = await response.json();
        return data.access_token;
};

export const createPayPalOrder = async ({ amount, currency, returnUrl, cancelUrl, description, referenceId }) => {
        const baseUrl = resolvePayPalBaseUrl();
        const accessToken = await getPayPalAccessToken();
        const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
                method: "POST",
                headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                },
                body: JSON.stringify({
                        intent: "CAPTURE",
                        purchase_units: [
                                {
                                        reference_id: referenceId,
                                        description,
                                        amount: {
                                                currency_code: currency,
                                                value: amount,
                                        },
                                },
                        ],
                        application_context: {
                                return_url: returnUrl,
                                cancel_url: cancelUrl,
                        },
                }),
        });

        if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`PayPal order request failed: ${errorText}`);
        }

        return response.json();
};

export const capturePayPalOrder = async (orderId) => {
        const baseUrl = resolvePayPalBaseUrl();
        const accessToken = await getPayPalAccessToken();
        const safeOrderId = encodeURIComponent(orderId);
        const url = new URL(`/v2/checkout/orders/${safeOrderId}/capture`, baseUrl);
        const response = await fetch(url.toString(), {
                method: "POST",
                headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                },
        });

        if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`PayPal capture failed: ${errorText}`);
        }

        return response.json();
};
