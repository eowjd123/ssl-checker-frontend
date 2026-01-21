import React, { useState, useEffect } from 'react';
import { Search, Shield, Calendar, Clock, AlertCircle, CheckCircle, Info, List, Star, Save, Upload, ArrowUpDown, Trash2 } from 'lucide-react';

export default function SSLCertificateChecker() {
  const [domain, setDomain] = useState('');
  const [certInfo, setCertInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 일괄 체크 상태
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkDomains, setBulkDomains] = useState('');
  const [bulkResults, setBulkResults] = useState([]);

  // 즐겨찾기 상태 (DB에서 가져옴)
  const [savedLists, setSavedLists] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [listName, setListName] = useState('');
  const [loadingLists, setLoadingLists] = useState(false);

  // 정렬 상태
  const [sortBy, setSortBy] = useState('status');

  const API_URL = 'http://localhost:8080';

  // 컴포넌트 마운트 시 저장된 목록 불러오기
  useEffect(() => {
    loadSavedLists();
  }, []);

  // DB에서 저장된 목록 불러오기
  const loadSavedLists = async () => {
    setLoadingLists(true);
    try {
      const response = await fetch(`${API_URL}/api/domain-lists`);
      const data = await response.json();
      setSavedLists(data);
    } catch (err) {
      console.error('목록 불러오기 실패:', err);
    } finally {
      setLoadingLists(false);
    }
  };

  const checkCertificate = async () => {
    if (!domain.trim()) {
      setError('도메인을 입력해주세요');
      return;
    }

    setLoading(true);
    setError(null);
    setCertInfo(null);

    try {
      const response = await fetch(`${API_URL}/api/check-certificate?domain=${encodeURIComponent(domain)}`);
      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setCertInfo(data);
      }
    } catch (err) {
      setError('서버 연결 실패. 백엔드가 실행 중인지 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const checkBulkCertificates = async () => {
    const domains = bulkDomains.split('\n').map(d => d.trim()).filter(d => d.length > 0);

    if (domains.length === 0) {
      setError('최소 1개 이상의 도메인을 입력해주세요');
      return;
    }

    if (domains.length > 35) {
      setError('한 번에 최대 35개까지 체크할 수 있습니다');
      return;
    }

    setLoading(true);
    setError(null);
    setBulkResults([]);

    try {
      const response = await fetch(`${API_URL}/api/check-certificates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(domains),
      });
      const data = await response.json();
      setBulkResults(data);
    } catch (err) {
      setError('서버 연결 실패. 백엔드가 실행 중인지 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // DB에 목록 저장
  const saveCurrentList = async () => {
    if (!listName.trim()) {
      alert('목록 이름을 입력해주세요');
      return;
    }

    const domains = bulkDomains.split('\n').map(d => d.trim()).filter(d => d.length > 0);
    if (domains.length === 0) {
      alert('저장할 도메인이 없습니다');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/domain-lists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: listName,
          domains: domains
        }),
      });

      if (response.ok) {
        setListName('');
        setShowSaveModal(false);
        loadSavedLists(); // 목록 새로고침
        alert('목록이 저장되었습니다!');
      } else {
        alert('저장 실패');
      }
    } catch (err) {
      alert('저장 중 오류 발생: ' + err.message);
    }
  };

  // 저장된 목록 불러오기
  const loadSavedList = (list) => {
    setBulkDomains(list.domains.join('\n'));
    setBulkMode(true);
  };

  // DB에서 목록 삭제
  const deleteSavedList = async (id) => {
    if (window.confirm('이 목록을 삭제하시겠습니까?')) {
      try {
        const response = await fetch(`${API_URL}/api/domain-lists/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          loadSavedLists(); // 목록 새로고침
          alert('삭제되었습니다');
        } else {
          alert('삭제 실패');
        }
      } catch (err) {
        alert('삭제 중 오류 발생: ' + err.message);
      }
    }
  };

  // 정렬 함수
  const sortResults = (results) => {
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !bulkMode) {
      checkCertificate();
    }
  };

  const getExpiryStatus = (days) => {
    if (days < 0) return { color: 'text-red-600 bg-red-50', icon: AlertCircle, text: '만료됨', badge: 'bg-red-500' };
    if (days <= 7) return { color: 'text-red-600 bg-red-50', icon: AlertCircle, text: '긴급', badge: 'bg-red-500' };
    if (days <= 30) return { color: 'text-orange-600 bg-orange-50', icon: AlertCircle, text: '만료 임박', badge: 'bg-orange-500' };
    return { color: 'text-green-600 bg-green-50', icon: CheckCircle, text: '정상', badge: 'bg-green-500' };
  };

  const sortedResults = sortResults(bulkResults);

  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">SSL 인증서 체커</h1>
            <p className="text-gray-600">도메인의 SSL 인증서 정보를 확인하세요</p>
          </div>

          {/* 저장된 목록 표시 */}
          {savedLists.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    저장된 도메인 목록
                  </h3>
                  <button
                      onClick={loadSavedLists}
                      disabled={loadingLists}
                      className="text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    {loadingLists ? '로딩중...' : '새로고침'}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedLists.map((list) => (
                      <div key={list.id} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-500 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{list.name}</h4>
                          <button
                              onClick={() => deleteSavedList(list.id)}
                              className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-500 mb-3">
                          {list.domains.length}개 도메인
                        </p>
                        <button
                            onClick={() => loadSavedList(list)}
                            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          불러오기
                        </button>
                      </div>
                  ))}
                </div>
              </div>
          )}

          {/* 모드 선택 버튼 */}
          <div className="flex justify-center gap-4 mb-8">
            <button
                onClick={() => { setBulkMode(false); setBulkResults([]); setError(null); }}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                    !bulkMode
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
            >
              <Search className="w-5 h-5" />
              단일 체크
            </button>
            <button
                onClick={() => { setBulkMode(true); setCertInfo(null); setError(null); }}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                    bulkMode
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
            >
              <List className="w-5 h-5" />
              일괄 체크
            </button>
          </div>

          {/* 단일 체크 모드 */}
          {!bulkMode && (
              <>
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                      <input
                          type="text"
                          value={domain}
                          onChange={(e) => setDomain(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="예: google.com"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <button
                        onClick={checkCertificate}
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
                          {React.createElement(getExpiryStatus(certInfo.daysUntilExpiry).icon, {
                            className: "w-8 h-8"
                          })}
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
          )}

          {/* 일괄 체크 모드 */}
          {bulkMode && (
              <>
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    도메인 목록 (한 줄에 하나씩, 최대 35개)
                  </label>
                  <textarea
                      value={bulkDomains}
                      onChange={(e) => setBulkDomains(e.target.value)}
                      placeholder="google.com&#10;github.com&#10;stackoverflow.com"
                      rows={10}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                  />
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-gray-500">
                      {bulkDomains.split('\n').filter(d => d.trim().length > 0).length}개 도메인
                    </p>
                    <div className="flex gap-3">
                      <button
                          onClick={() => setShowSaveModal(true)}
                          disabled={bulkDomains.split('\n').filter(d => d.trim().length > 0).length === 0}
                          className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                      >
                        <Save className="w-5 h-5" />
                        목록 저장
                      </button>
                      <button
                          onClick={checkBulkCertificates}
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

                {bulkResults.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                      {/* 정렬 버튼 */}
                      <div className="p-4 bg-gray-50 border-b flex items-center gap-2">
                        <ArrowUpDown className="w-5 h-5 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">정렬:</span>
                        <div className="flex gap-2">
                          <button
                              onClick={() => setSortBy('status')}
                              className={`px-3 py-1 rounded text-sm ${sortBy === 'status' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                          >
                            상태순
                          </button>
                          <button
                              onClick={() => setSortBy('days')}
                              className={`px-3 py-1 rounded text-sm ${sortBy === 'days' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                          >
                            만료임박순
                          </button>
                          <button
                              onClick={() => setSortBy('domain')}
                              className={`px-3 py-1 rounded text-sm ${sortBy === 'domain' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                          >
                            도메인명
                          </button>
                          <button
                              onClick={() => setSortBy('expiry')}
                              className={`px-3 py-1 rounded text-sm ${sortBy === 'expiry' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                          >
                            만료일
                          </button>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">도메인</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">발급 기관</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">만료일</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">남은 일수</th>
                          </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                          {sortedResults.map((result, index) => {
                            const status = result.error ? null : getExpiryStatus(result.daysUntilExpiry);
                            return (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="px-6 py-4">
                                    {result.error ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                                  오류
                                </span>
                                    ) : (
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${status.badge}`}>
                                  {status.text}
                                </span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 font-medium text-gray-900">{result.domain}</td>
                                  <td className="px-6 py-4 text-sm text-gray-500">
                                    {result.error ? '-' : result.issuerCN}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-500">
                                    {result.error ? '-' : result.notAfter}
                                  </td>
                                  <td className="px-6 py-4 text-sm">
                                    {result.error ? (
                                        <span className="text-red-600">{result.error}</span>
                                    ) : (
                                        <span className={result.daysUntilExpiry <= 30 ? 'text-orange-600 font-medium' : 'text-gray-900'}>
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
          )}

          {/* 저장 모달 */}
          {showSaveModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 w-96">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">도메인 목록 저장</h3>
                  <input
                      type="text"
                      value={listName}
                      onChange={(e) => setListName(e.target.value)}
                      placeholder="목록 이름 (예: 프로덕션 서버)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none mb-4"
                  />
                  <div className="flex gap-3">
                    <button
                        onClick={() => setShowSaveModal(false)}
                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      취소
                    </button>
                    <button
                        onClick={saveCurrentList}
                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      저장
                    </button>
                  </div>
                </div>
              </div>
          )}
        </div>
      </div>
  );
}

function InfoRow({ label, value, icon: Icon }) {
  return (
      <div className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
        {Icon && <Icon className="w-5 h-5 text-gray-400 mt-0.5" />}
        <div className="flex-1">
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-gray-900 mt-1">{value}</p>
        </div>
      </div>
  );
}