import React, { useState } from 'react';
import { Shield, Search, List } from 'lucide-react';
import { SavedListsSection } from './components/SavedListsSection';
import { SaveModal } from './components/SaveModal';
import { SingleCheckMode } from './components/SingleCheckMode';
import { BulkCheckMode } from './components/BulkCheckMode';
import { useSavedLists } from './hooks/useSavedLists';
import { useCertificateCheck } from './hooks/useCertificateCheck';

export default function SSLCertificateChecker() {
  // 모드 상태
  const [bulkMode, setBulkMode] = useState(false);

  // 입력 상태
  const [domain, setDomain] = useState('');
  const [bulkDomains, setBulkDomains] = useState('');

  // 결과 상태
  const [certInfo, setCertInfo] = useState(null);
  const [bulkResults, setBulkResults] = useState([]);

  // 정렬 상태
  const [sortBy, setSortBy] = useState('status');

  // 모달 상태
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [listName, setListName] = useState('');

  // Custom Hooks
  const { savedLists, loading: listsLoading, loadLists, saveList, deleteList } = useSavedLists();
  const { loading, error, setError, checkSingle, checkBulk } = useCertificateCheck();

  // 단일 체크 핸들러
  const handleSingleCheck = async () => {
    const result = await checkSingle(domain);
    if (result) {
      setCertInfo(result);
    }
  };

  // 일괄 체크 핸들러
  const handleBulkCheck = async () => {
    const results = await checkBulk(bulkDomains);
    if (results) {
      setBulkResults(results);
    }
  };

  // 목록 저장 핸들러
  const handleSaveList = async () => {
    if (!listName.trim()) {
      alert('목록 이름을 입력해주세요');
      return;
    }

    const domains = bulkDomains.split('\n').map(d => d.trim()).filter(d => d);
    if (domains.length === 0) {
      alert('저장할 도메인이 없습니다');
      return;
    }

    const success = await saveList(listName, domains);
    if (success) {
      setListName('');
      setShowSaveModal(false);
      alert('목록이 저장되었습니다!');
    } else {
      alert('저장 실패');
    }
  };

  // 목록 삭제 핸들러
  const handleDeleteList = async (id) => {
    if (window.confirm('이 목록을 삭제하시겠습니까?')) {
      const success = await deleteList(id);
      alert(success ? '삭제되었습니다' : '삭제 실패');
    }
  };

  // 저장된 목록 불러오기 핸들러
  const handleLoadList = (list) => {
    setBulkDomains(list.domains.join('\n'));
    setBulkMode(true);
  };

  // 모드 전환 핸들러
  const switchToSingleMode = () => {
    setBulkMode(false);
    setBulkResults([]);
    setError(null);
  };

  const switchToBulkMode = () => {
    setBulkMode(true);
    setCertInfo(null);
    setError(null);
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-7xl mx-auto">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">SSL 인증서 체커</h1>
            <p className="text-gray-600">도메인의 SSL 인증서 정보를 확인하세요</p>
          </div>

          {/* 저장된 목록 섹션 */}
          <SavedListsSection
              savedLists={savedLists}
              loading={listsLoading}
              onLoad={handleLoadList}
              onDelete={handleDeleteList}
              onRefresh={loadLists}
          />

          {/* 모드 선택 버튼 */}
          <div className="flex justify-center gap-4 mb-8">
            <button
                onClick={switchToSingleMode}
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
                onClick={switchToBulkMode}
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

          {/* 체크 모드에 따른 UI 렌더링 */}
          {!bulkMode ? (
              <SingleCheckMode
                  domain={domain}
                  setDomain={setDomain}
                  onCheck={handleSingleCheck}
                  loading={loading}
                  error={error}
                  certInfo={certInfo}
              />
          ) : (
              <BulkCheckMode
                  domains={bulkDomains}
                  setDomains={setBulkDomains}
                  onCheck={handleBulkCheck}
                  loading={loading}
                  error={error}
                  results={bulkResults}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  onSave={() => setShowSaveModal(true)}
              />
          )}

          {/* 저장 모달 */}
          <SaveModal
              show={showSaveModal}
              onClose={() => setShowSaveModal(false)}
              onSave={handleSaveList}
              value={listName}
              setValue={setListName}
          />
        </div>
      </div>
  );
}