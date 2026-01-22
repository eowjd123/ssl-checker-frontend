import { getExpiryStatus } from './statusHelper';

export const downloadCSV = (results) => {
    if (results.length === 0) {
        alert('다운로드할 데이터가 없습니다');
        return;
    }

    const headers = ['상태', '도메인', 'IP주소', 'PEM키', '발급기관', '만료일', '남은일수'];

    const csvData = results.map(result => {
        const status = result.error ? '오류' : getExpiryStatus(result.daysUntilExpiry).text;
        return [
            status,
            result.domain,
            result.error ? '-' : (result.ipAddress || '-'),
            result.error ? '-' : (result.pemKey || '-'),
            result.error ? '-' : result.issuerCN,
            result.error ? '-' : result.notAfter,
            result.error ? '-' : `${result.daysUntilExpiry}일`
        ];
    });

    const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const date = new Date().toISOString().slice(0, 10);
    link.setAttribute('href', url);
    link.setAttribute('download', `SSL인증서체크_${date}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
