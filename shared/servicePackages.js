export const DEFAULT_CURRENCY = "MRU";

export const SERVICE_PACKAGES = [
        {
                id: "starter",
                name: "الانطلاقة",
                oneTimePrice: 5000,
                monthlyPrice: 3000,
        },
        {
                id: "growth",
                name: "النمو",
                oneTimePrice: 10000,
                monthlyPrice: 5000,
        },
        {
                id: "full",
                name: "التوسع",
                oneTimePrice: 20000,
                monthlyPrice: 7000,
        },
];

export const buildServicePackages = (currency) =>
        SERVICE_PACKAGES.map((pkg) => ({
                ...pkg,
                currency,
        }));
