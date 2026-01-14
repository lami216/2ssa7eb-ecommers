export const DEFAULT_CURRENCY = "USD";

export const SERVICE_PACKAGES = [
        {
                id: "starter",
                name: "باقة الشرارة – Basic",
                oneTimePrice: 50,
                monthlyPrice: 5,
        },
        {
                id: "growth",
                name: "باقة القفزة – Pro",
                oneTimePrice: 100,
                monthlyPrice: 10,
        },
        {
                id: "full",
                name: "باقة الريادة – Plus",
                oneTimePrice: 200,
                monthlyPrice: 20,
        },
];

export const buildServicePackages = (currency) =>
        SERVICE_PACKAGES.map((pkg) => ({
                ...pkg,
                currency,
        }));
