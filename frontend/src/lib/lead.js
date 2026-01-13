export const PLAN_LABELS = {
        starter: "Basic",
        growth: "Pro",
        full: "Plus",
        Basic: "Basic",
        Pro: "Pro",
        Plus: "Plus",
};

export const buildLeadWhatsAppMessage = (lead) => {
        if (!lead) return "";
        const planLabel = PLAN_LABELS[lead.selectedPlan] || lead.selectedPlan;
        return `السلام عليكم، أنا ${lead.fullName} بريدي ${lead.email}. مهتم بباقة ${planLabel}. تفاصيل: ${
                lead.idea || "بدون تفاصيل"
        }. رقم الطلب: ${lead._id}`;
};
