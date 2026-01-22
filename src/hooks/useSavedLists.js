import { useState, useEffect } from 'react';
import { API_URL } from '../constants/config';

export const useSavedLists = () => {
    const [savedLists, setSavedLists] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadLists = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/domain-lists`);
            const data = await response.json();
            setSavedLists(data);
        } catch (err) {
            console.error('목록 불러오기 실패:', err);
        } finally {
            setLoading(false);
        }
    };

    const saveList = async (name, domains) => {
        try {
            const response = await fetch(`${API_URL}/api/domain-lists`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, domains }),
            });
            if (response.ok) {
                loadLists();
                return true;
            }
            return false;
        } catch (err) {
            console.error('저장 실패:', err);
            return false;
        }
    };

    const deleteList = async (id) => {
        try {
            const response = await fetch(`${API_URL}/api/domain-lists/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                loadLists();
                return true;
            }
            return false;
        } catch (err) {
            console.error('삭제 실패:', err);
            return false;
        }
    };

    useEffect(() => {
        loadLists();
    }, []);

    return { savedLists, loading, loadLists, saveList, deleteList };
};