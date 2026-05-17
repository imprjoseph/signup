/**
 * api.js — 共用 GAS API 呼叫模組
 * GitHub Pages + Google Apps Script 架構
 * 
 * 使用方式：在每個 HTML 頁面的 <script> 最前面引入：
 *   <script src="api.js"></script>
 * 
 * 然後在頁面 JS 中設定：
 *   API.setUrl('https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec');
 */

const API = (function() {

  // ── 設定區 ─────────────────────────────────────────────────
  // ⚠️  請將下方 GAS_DEPLOYMENT_URL 改為你部署後的 Web App 網址
  // 格式：https://script.google.com/macros/s/AKfycb.../exec
  let GAS_URL = '';

  // ── 初始化 ──────────────────────────────────────────────────
  function setUrl(url) {
    GAS_URL = url;
  }

  function getUrl() {
    return GAS_URL;
  }

  // ── 核心呼叫函式 ─────────────────────────────────────────────
  /**
   * 呼叫 GAS API
   * 
   * ⚠️  GAS CORS 關鍵技巧：
   * 1. 不要加 Content-Type: application/json（會觸發 preflight，GAS 不處理）
   * 2. 使用 redirect: 'follow'（GAS 會做一次 302 redirect）
   * 3. GAS 部署必須設為「任何人，包括匿名使用者」
   * 
   * @param {string} action - 對應 Code.gs switch case 的 action 名稱
   * @param {object} data   - 額外參數（直接 spread 進 payload）
   * @returns {Promise<any>}
   */
  async function call(action, data = {}) {
    if (!GAS_URL) {
      console.error('[API] GAS_URL 尚未設定！請在頁面初始化時呼叫 API.setUrl(url)');
      throw new Error('API URL not configured');
    }

    const payload = { action, ...data };

    try {
      const response = await fetch(GAS_URL, {
        method: 'POST',
        redirect: 'follow',
        body: JSON.stringify(payload)
        // ❌ 不要加 headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result;

    } catch (err) {
      console.error(`[API] ${action} 呼叫失敗：`, err);
      throw err;
    }
  }

  // ── 便利方法（前台） ──────────────────────────────────────────
  const getSessions      = ()       => call('getSessions');
  const getSpeakers      = ()       => call('getSpeakers');
  const getSettings      = ()       => call('getSettings');
  const getFAQ           = ()       => call('getFAQ');
  const submitRegistration = (data) => call('submitRegistration', { data });
  const getCheckinInfo   = (registrationNo, token) => call('getCheckinInfo', { registrationNo, token });
  const doCheckin        = (registrationNo, token, operator) => call('doCheckin', { registrationNo, token, operator });
  const doGift           = (registrationNo, operator) => call('doGift', { registrationNo, operator });
  const adminLogin       = (password) => call('adminLogin', { password });

  // ── 便利方法（後台，需帶 token） ──────────────────────────────
  const getDashboard         = (token) => call('getDashboard', { token });
  const getRegistrations     = (token, filters) => call('getRegistrations', { token, filters });
  const updateRegistration   = (token, data) => call('updateRegistration', { token, data });
  const getSessions_admin    = (token) => call('getSessions_admin', { token });
  const updateSession        = (token, data) => call('updateSession', { token, data });
  const manageSpeaker        = (token, data) => call('manageSpeaker', { token, data });
  const updateSettings       = (token, data) => call('updateSettings', { token, data });
  const updateFAQ            = (token, data) => call('updateFAQ', { token, data });
  const exportList           = (token, exportType, sessionId) => call('exportList', { token, exportType, sessionId });
  const manualCheckin        = (token, registrationNo, operator) => call('manualCheckin', { token, registrationNo, operator });
  const regenerateQR         = (token, registrationNo) => call('regenerateQR', { token, registrationNo });
  const updateRegistrationFull=(token, data) => call('updateRegistrationFull', { token, data });
  const importSurveyStatus   = (token, data) => call('importSurveyStatus', { token, data });
  const getRegistrationDetail= (token, registrationNo) => call('getRegistrationDetail', { token, registrationNo });
  const getQRProjection      = (token, qrType, sessionId) => call('getQRProjection', { token, qrType, sessionId });

  // ── Public API ─────────────────────────────────────────────
  return {
    setUrl, getUrl, call,
    // 前台
    getSessions, getSpeakers, getSettings, getFAQ,
    submitRegistration, getCheckinInfo, doCheckin, doGift, adminLogin,
    // 後台
    getDashboard, getRegistrations, updateRegistration,
    getSessions_admin, updateSession, manageSpeaker,
    updateSettings, updateFAQ, exportList,
    manualCheckin, regenerateQR, updateRegistrationFull,
    importSurveyStatus, getRegistrationDetail, getQRProjection
  };

})();

// ── 全域設定（統一在這裡改 URL，所有頁面共用） ─────────────────────
// ⚠️  將下方網址替換成你的 GAS Web App 部署網址
API.setUrl('https://script.google.com/macros/s/AKfycbyGd2pntT-PTe8QhxBtrM79nxy8KmrYawo83ke3c0c5NM1hZzmHwZXLhPEnaDYvreCKTw/exec');
