export const getExpiryStatus = (days) => {
    if (days < 0) {
        return {
            color: 'text-red-600 bg-red-50',
            text: '만료됨',
            badge: 'bg-red-500'
        };
    }
    if (days <= 7) {
        return {
            color: 'text-red-600 bg-red-50',
            text: '긴급',
            badge: 'bg-red-500'
        };
    }
    if (days <= 30) {
        return {
            color: 'text-orange-600 bg-orange-50',
            text: '만료 임박',
            badge: 'bg-orange-500'
        };
    }
    return {
        color: 'text-green-600 bg-green-50',
        text: '정상',
        badge: 'bg-green-500'
    };
};