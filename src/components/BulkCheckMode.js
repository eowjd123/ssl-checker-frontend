import React from 'react';
import { Save, AlertCircle, ArrowUpDown, Download } from 'lucide-react';
import { getExpiryStatus } from '../utils/statusHelper';
import { sortResults } from '../utils/sortHelper';
import { downloadCSV } from '../utils/csvExport';

export const BulkCheckMode = ({
                                  domains,
                                  setDomains,
                                  onCheck,
                                  loading,
                                  error,
                                  results,
                                  sortBy,
                                  setSortBy,
                                  onSave
                              }) => {
    const sortedResults = sortResults(results, sortBy);
    const domainCount = domains.split('\n').filter(d => d.trim()).length;

    return (
        <>
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    도메인 목록 (한 줄에 하나씩, 최대 35개)
                </label>
                <textarea
                    value={domains}
                    onChange={(e) => setDomains(e.target.value)}
                    placeholder="google.com&#10;github.com&#10;stackoverflow.com"
                    rows={10}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                />
                <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-gray-500">{domainCount}개 도메인</p>
                    <div className="flex gap-3">
                        <button
                            onClick={onSave}
                            disabled={domainCount === 0}
                            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                            <Save className="w-5 h-5" />
                            목록 저장
                        </button>
                        <button
                            onClick={onCheck}
                            disabled={loading}
                            className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? '확인 중...' : '일괄 확인'}
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="font-medium text-red-900">오류 발생</p>
                        <p className="text-red-700 text-sm mt-1">{error}</p>
                    </div>
                </div>
            )}

            {loading && (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mb-4"></div>
                    <p className="text-gray-600">인증서 정보를 가져오는 중...</p>
                </div>
            )}

            {results.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ArrowUpDown className="w-5 h-5 text-gray-600" />
                            <span className="text-sm font-medium text-gray-700">정렬:</span>
                            <div className="flex gap-2">
                                {[
                                    { key: 'status', label: '상태순' },
                                    { key: 'days', label: '만료임박순' },
                                    { key: 'domain', label: '도메인명' },
                                    { key: 'expiry', label: '만료일' }
                                ].map(sort => (
                                    <button
                                        key={sort.key}
                                        onClick={() => setSortBy(sort.key)}
                                        className={`px-3 py-1 rounded text-sm ${
                                            sortBy === sort.key
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        {sort.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => downloadCSV(results)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <Download className="w-5 h-5" />
                            CSV 다운로드
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                            <tr>
                                {['상태', '도메인', 'IP주소', 'PEM키', '발급기관', '만료일', '남은일수'].map(header => (
                                    <th
                                        key={header}
                                        className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase whitespace-nowrap"
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {sortedResults.map((result, index) => {
                                const status = result.error ? null : getExpiryStatus(result.daysUntilExpiry);
                                return (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-5">
                                            {result.error ? (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-800">
                            오류
                          </span>
                                            ) : (
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white ${status.badge}`}>
                            {status.text}
                          </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5 font-semibold text-gray-900 text-base">
                                            {result.domain}
                                        </td>
                                        <td className="px-6 py-5 text-base text-gray-600">
                                            {result.error ? '-' : (result.ipAddress || '-')}
                                        </td>
                                        <td className="px-6 py-5 text-base text-gray-700 font-medium">
                                            {result.error ? '-' : (result.pemKey || '-')}
                                        </td>
                                        <td className="px-6 py-5 text-base text-gray-600">
                                            {result.error ? '-' : result.issuerCN}
                                        </td>
                                        <td className="px-6 py-5 text-base text-gray-600">
                                            {result.error ? '-' : result.notAfter}
                                        </td>
                                        <td className="px-6 py-5 text-base">
                                            {result.error ? (
                                                <span className="text-red-600">{result.error}</span>
                                            ) : (
                                                <span className={
                                                    result.daysUntilExpiry <= 30
                                                        ? 'text-orange-600 font-bold text-lg'
                                                        : 'text-gray-900 font-semibold text-lg'
                                                }>
                            {result.daysUntilExpiry}일
                          </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </>
    );
};
