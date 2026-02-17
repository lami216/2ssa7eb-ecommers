const baseClasses =
        "inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#1ebe5b] focus:outline-none focus:ring-2 focus:ring-white/40 disabled:cursor-not-allowed disabled:bg-white/20";

const WhatsAppButton = ({
        isUnlocked,
        whatsappLink,
        lockedLabel = "تواصل معنا",
        unlockedLabel = "تواصل معنا",
        lockedHref = "/#qualification",
        onLockedClick,
        className = "",
}) => {
        if (isUnlocked) {
                if (whatsappLink) {
                        return (
                                <a
                                        href={whatsappLink}
                                        target='_blank'
                                        rel='noreferrer'
                                        className={`${baseClasses} ${className}`.trim()}
                                >
                                        {unlockedLabel}
                                </a>
                        );
                }
                return (
                        <button type='button' className={`${baseClasses} ${className}`.trim()} disabled>
                                واتساب غير متاح حالياً
                        </button>
                );
        }

        if (onLockedClick) {
                return (
                        <button type='button' onClick={onLockedClick} className={`${baseClasses} ${className}`.trim()}>
                                {lockedLabel}
                        </button>
                );
        }

        return (
                <a href={lockedHref} className={`${baseClasses} ${className}`.trim()}>
                        {lockedLabel}
                </a>
        );
};

export default WhatsAppButton;
