import React from 'react';
import { Search, Info, Shield, Calendar, Clock, AlertCircle } from 'lucide-react';
import { getExpiryStatus } from '../utils/statusHelper';

const InfoRow = ({ label, value, icon: Icon }) => {
    return (
        <div className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
            {Icon && <Icon className="w-5 h-5 text-gray-400 mt-0.5" />}
            <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium">{label}</p>
                <p className="text-gray-900 mt-1">{value}</p>
            </div>
        </div>
    );
};

export const SingleCheckMode = ({
                                    domain,
                                    setDomain,
                                    onCheck,
                                    loading,
                                    error,
                                    certInfo
                                }) => {
    return (
        <>
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <div className="flex gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && onCheck()}
                            placeholder="예: google.com"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                        />
                    </div>
                    <button
                        onClick={onCheck}
                        disabled={loading}
                        className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? '확인 중...' : '확인'}
                    </button>
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

            {certInfo && !error && (
                <div className="space-y-6">
                    <div className={`rounded-xl shadow-lg p-6 ${getExpiryStatus(certInfo.daysUntilExpiry).color}`}>
                        <div className="flex items-center gap-4">
                            <AlertCircle className="w-8 h-8" />
                            <div>
                                <p className="text-sm font-medium opacity-80">인증서 상태</p>
                                <p className="text-2xl font-bold">
                                    {getExpiryStatus(certInfo.daysUntilExpiry).text}
                                </p>
                                <p className="text-sm mt-1">
                                    {certInfo.daysUntilExpiry >= 0
                                        ? `만료까지 ${certInfo.daysUntilExpiry}일 남음`
                                        : `${Math.abs(certInfo.daysUntilExpiry)}일 전에 만료됨`
                                    }
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Info className="w-5 h-5" />
                            발급 대상
                        </h2>
                        <div className="space-y-3">
                            <InfoRow label="도메인" value={certInfo.domain} />
                            <InfoRow label="일반 이름 (CN)" value={certInfo.subjectCN} />
                            <InfoRow label="조직 (O)" value={certInfo.subjectO} />
                            <InfoRow label="조직 단위 (OU)" value={certInfo.subjectOU} />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5" />
                            발급 기관
                        </h2>
                        <div className="space-y-3">
                            <InfoRow label="발급 기관 (CN)" value={certInfo.issuerCN} />
                            <InfoRow label="조직 (O)" value={certInfo.issuerO} />
                            <InfoRow label="서명 알고리즘" value={certInfo.signatureAlgorithm} />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            유효 기간
                        </h2>
                        <div className="space-y-3">
                            <InfoRow label="발급일" value={certInfo.notBefore} icon={Clock} />
                            <InfoRow label="만료일" value={certInfo.notAfter} icon={Clock} />
                            <InfoRow label="시리얼 번호" value={certInfo.serialNumber} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};