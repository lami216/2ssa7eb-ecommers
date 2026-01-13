const PAYPAL_ID_REGEX = /^[A-Za-z0-9-]{5,}$/;

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

const assertValidPayPalId = (value, label) => {
        if (typeof value !== "string" || !PAYPAL_ID_REGEX.test(value.trim())) {
                throw new Error(`Invalid PayPal ${label}`);
        }
};

const parsePayPalResponse = async (response, errorMessage) => {
        if (response.ok) {
                if (response.status === 204) {
                        return null;
                }
                return response.json();
        }
        const errorText = await response.text();
        throw new Error(`${errorMessage}: ${errorText}`);
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

        const data = await parsePayPalResponse(response, "PayPal token request failed");
        return data.access_token;
};

export const createPayPalOrder = async ({
        amount,
        currency,
        returnUrl,
        cancelUrl,
        description,
        referenceId,
        customId,
        itemName,
}) => {
        const baseUrl = resolvePayPalBaseUrl();
        const accessToken = await getPayPalAccessToken();
        const purchaseUnit = {
                reference_id: referenceId,
                description,
                amount: {
                        currency_code: currency,
                        value: amount,
                },
        };

        if (customId) {
                purchaseUnit.custom_id = customId;
        }

        if (itemName) {
                purchaseUnit.items = [
                        {
                                name: itemName,
                                quantity: "1",
                                unit_amount: {
                                        currency_code: currency,
                                        value: amount,
                                },
                        },
                ];
                purchaseUnit.amount = {
                        currency_code: currency,
                        value: amount,
                        breakdown: {
                                item_total: {
                                        currency_code: currency,
                                        value: amount,
                                },
                        },
                };
        }
        const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
                method: "POST",
                headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                },
                body: JSON.stringify({
                        intent: "CAPTURE",
                        purchase_units: [purchaseUnit],
                        application_context: {
                                return_url: returnUrl,
                                cancel_url: cancelUrl,
                        },
                }),
        });

        return parsePayPalResponse(response, "PayPal order request failed");
};

export const capturePayPalOrder = async (orderId) => {
        assertValidPayPalId(orderId, "order id");
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

        return parsePayPalResponse(response, "PayPal capture failed");
};

export const createPayPalSubscription = async ({
        planId,
        returnUrl,
        cancelUrl,
        trialDays = 30,
        customId,
}) => {
        assertValidPayPalId(planId, "plan id");
        const baseUrl = resolvePayPalBaseUrl();
        const accessToken = await getPayPalAccessToken();
        const startTime = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).toISOString();

        const response = await fetch(`${baseUrl}/v1/billing/subscriptions`, {
                method: "POST",
                headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                },
                body: JSON.stringify({
                        plan_id: planId,
                        start_time: startTime,
                        custom_id: customId,
                        application_context: {
                                return_url: returnUrl,
                                cancel_url: cancelUrl,
                                user_action: "SUBSCRIBE_NOW",
                        },
                }),
        });

        return parsePayPalResponse(response, "PayPal subscription request failed");
};

export const getPayPalSubscriptionDetails = async (subscriptionId) => {
        assertValidPayPalId(subscriptionId, "subscription id");
        const baseUrl = resolvePayPalBaseUrl();
        const accessToken = await getPayPalAccessToken();
        const safeSubscriptionId = encodeURIComponent(subscriptionId);
        const url = new URL(`/v1/billing/subscriptions/${safeSubscriptionId}`, baseUrl);
        const response = await fetch(url.toString(), {
                method: "GET",
                headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                },
        });

        return parsePayPalResponse(response, "PayPal subscription fetch failed");
};

export const cancelPayPalSubscription = async (subscriptionId, reason = "User requested cancellation") => {
        assertValidPayPalId(subscriptionId, "subscription id");
        const baseUrl = resolvePayPalBaseUrl();
        const accessToken = await getPayPalAccessToken();
        const safeSubscriptionId = encodeURIComponent(subscriptionId);
        const url = new URL(`/v1/billing/subscriptions/${safeSubscriptionId}/cancel`, baseUrl);
        const response = await fetch(url.toString(), {
                method: "POST",
                headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                },
                body: JSON.stringify({ reason }),
        });

        return parsePayPalResponse(response, "PayPal subscription cancel failed");
};
