import { useEffect, useMemo, useState } from "react";
import apiClient from "../lib/apiClient";
import { SALES_WHATSAPP_URL, buildWhatsAppLink } from "../lib/whatsapp";
import { buildLeadWhatsAppMessage } from "../lib/lead";
import { useUserStore } from "../stores/useUserStore";

const useLeadStatus = () => {
        const user = useUserStore((state) => state.user);
        const [lead, setLead] = useState(null);
        const [loading, setLoading] = useState(true);

        useEffect(() => {
                let isMounted = true;

                const loadLead = async () => {
                        if (!user) {
                                if (isMounted) {
                                        setLead(null);
                                        setLoading(false);
                                }
                                return;
                        }

                        try {
                                if (isMounted) {
                                        setLoading(true);
                                }
                                const data = await apiClient.get("/leads/me");
                                if (isMounted) {
                                        setLead(data || null);
                                }
                        } catch {
                                if (isMounted) {
                                        setLead(null);
                                }
                        } finally {
                                if (isMounted) {
                                        setLoading(false);
                                }
                        }
                };

                loadLead();

                return () => {
                        isMounted = false;
                };
        }, [user]);

        const isUnlocked = Boolean(lead?.contactFeePaid);
        const whatsappLink = useMemo(() => {
                if (!lead || !isUnlocked) return "";
                return buildWhatsAppLink({
                        whatsappUrl: SALES_WHATSAPP_URL,
                        message: buildLeadWhatsAppMessage(lead),
                });
        }, [isUnlocked, lead]);

        return {
                lead,
                setLead,
                isUnlocked,
                whatsappUrl: SALES_WHATSAPP_URL,
                whatsappLink,
                loading,
                refreshLead: () => apiClient.get("/leads/me").then((data) => setLead(data || null)),
        };
};

export default useLeadStatus;
