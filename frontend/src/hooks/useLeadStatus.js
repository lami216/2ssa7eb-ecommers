import { useEffect, useMemo, useState } from "react";
import apiClient from "../lib/apiClient";
import { buildWhatsAppLink } from "../lib/whatsapp";
import { buildLeadWhatsAppMessage } from "../lib/lead";
import { useUserStore } from "../stores/useUserStore";

const useLeadStatus = () => {
        const user = useUserStore((state) => state.user);
        const [lead, setLead] = useState(null);
        const [loading, setLoading] = useState(true);
        const [whatsappUrl, setWhatsappUrl] = useState("");

        useEffect(() => {
                let isMounted = true;

                const loadConfig = async () => {
                        try {
                                const config = await apiClient.get("/public-config");
                                if (isMounted) {
                                        setWhatsappUrl(config?.whatsapp || "");
                                }
                        } catch {
                                if (isMounted) {
                                        setWhatsappUrl("");
                                }
                        }
                };

                loadConfig();

                return () => {
                        isMounted = false;
                };
        }, []);

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
                if (!lead || !isUnlocked || !whatsappUrl) return "";
                return buildWhatsAppLink({
                        whatsappUrl,
                        message: buildLeadWhatsAppMessage(lead),
                });
        }, [isUnlocked, lead, whatsappUrl]);

        return {
                lead,
                setLead,
                isUnlocked,
                whatsappUrl,
                whatsappLink,
                loading,
                refreshLead: () => apiClient.get("/leads/me").then((data) => setLead(data || null)),
        };
};

export default useLeadStatus;
