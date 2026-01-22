import { useState } from 'react';
import { API_URL } from '../constants/config';

export const useCertificateCheck = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const checkSingle = async (domain) => {
        if (!domain.trim()) {
            setError('도메인을 입력해주세요');
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `${API_URL}/api/check-certificate?domain=${encodeURIComponent(domain)}`
            );
            const data = await response.json();

            if (data.error) {
                setError(data.error);
                return null;
            }
            return data;
        } catch (err) {
            setError('서버 연결 실패. 백엔드가 실행 중인지 확인해주세요.');
            return null;
        } finally {
            setLoading(false);
        }
    };

    const checkBulk = async (domains) => {
        const domainList = domains.split('\n').map(d => d.trim()).filter(d => d);

        if (domainList.length === 0) {
            setError('최소 1개 이상의 도메인을 입력해주세요');
            return null;
        }

        if (domainList.length > 35) {
            setError('한 번에 최대 35개까지 체크할 수 있습니다');
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/api/check-certificates`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(domainList),
            });
            const data = await response.json();
            return data;
        } catch (err) {
            setError('서버 연결 실패. 백엔드가 실행 중인지 확인해주세요.');
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { loading, error, setError, checkSingle, checkBulk };
};