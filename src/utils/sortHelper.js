export const sortResults = (results, sortBy) => {
    const sorted = [...results];

    switch (sortBy) {
        case 'status':
            return sorted.sort((a, b) => {
                if (a.error && !b.error) return 1;
                if (!a.error && b.error) return -1;
                if (a.error && b.error) return 0;

                const getPriority = (days) => {
                    if (days < 0) return 0;
                    if (days <= 7) return 1;
                    if (days <= 30) return 2;
                    return 3;
                };

                return getPriority(a.daysUntilExpiry) - getPriority(b.daysUntilExpiry);
            });

        case 'domain':
            return sorted.sort((a, b) => a.domain.localeCompare(b.domain));

        case 'expiry':
            return sorted.sort((a, b) => {
                if (a.error) return 1;
                if (b.error) return -1;
                return new Date(a.notAfter) - new Date(b.notAfter);
            });

        case 'days':
            return sorted.sort((a, b) => {
                if (a.error) return 1;
                if (b.error) return -1;
                return a.daysUntilExpiry - b.daysUntilExpiry;
            });

        default:
            return sorted;
    }
};