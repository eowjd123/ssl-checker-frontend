import React from 'react';
import { Star, Upload, Trash2 } from 'lucide-react';

export const SavedListsSection = ({ savedLists, loading, onLoad, onDelete, onRefresh }) => {
    if (savedLists.length === 0) return null;

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    저장된 도메인 목록
                </h3>
                <button
                    onClick={onRefresh}
                    disabled={loading}
                    className="text-sm text-indigo-600 hover:text-indigo-700"
                >
                    {loading ? '로딩중...' : '새로고침'}
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedLists.map((list) => (
                    <div
                        key={list.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-indigo-500 transition-colors"
                    >
                        <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{list.name}</h4>
                            <button
                                onClick={() => onDelete(list.id)}
                                className="text-red-500 hover:text-red-700"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 mb-3">
                            {list.domains.length}개 도메인
                        </p>
                        <button
                            onClick={() => onLoad(list)}
                            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <Upload className="w-4 h-4" />
                            불러오기
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};