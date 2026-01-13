export const hasContactFeePaidLead = (lead) =>
        Boolean(lead?.contactFeePaid || lead?.whatsappUnlocked);
