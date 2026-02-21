const defaultClasses =
        "inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#2a2546] to-[#44326f] px-5 py-2 text-sm font-semibold text-white transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-white/40 disabled:cursor-not-allowed disabled:bg-white/20";

const floatingClasses =
        "fixed bottom-5 right-5 z-[80] shadow-2xl shadow-black/30";

const WhatsAppButton = ({
        isUnlocked,
        whatsappLink,
        lockedLabel = "تواصل معنا",
        unlockedLabel = "واتساب",
        lockedHref = "/#qualification",
        onLockedClick,
        className = "",
        floating = false,
}) => {
        const classes = `${defaultClasses} ${floating ? floatingClasses : ""} ${className}`.trim();

        if (isUnlocked) {
                if (whatsappLink) {
                        return (
                                <a href={whatsappLink} target='_blank' rel='noopener noreferrer' className={classes}>
                                        {unlockedLabel}
                                </a>
                        );
                }
                return (
                        <button type='button' className={classes} disabled>
                                واتساب غير متاح حالياً
                        </button>
                );
        }

        if (onLockedClick) {
                return (
                        <button type='button' onClick={onLockedClick} className={classes}>
                                {lockedLabel}
                        </button>
                );
        }

        return (
                <a href={lockedHref} className={classes}>
                        {lockedLabel}
                </a>
        );
};

export default WhatsAppButton;
