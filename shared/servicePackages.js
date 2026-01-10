export const DEFAULT_CURRENCY = "USD";

export const SERVICE_PACKAGES = [
        {
                id: "starter",
                name: "باقة الإقلاع – Basic",
                oneTimePrice: 50,
                monthlyPrice: 5,
        },
        {
                id: "growth",
                name: "باقة النمو – Pro",
                oneTimePrice: 200,
                monthlyPrice: 20,
        },
        {
                id: "full",
                name: "باقة السيطرة الكاملة – Plus",
                oneTimePrice: 100,
                monthlyPrice: 10,
        },
];

export const buildServicePackages = (currency) =>
        SERVICE_PACKAGES.map((pkg) => ({
                ...pkg,
                currency,
        }));
