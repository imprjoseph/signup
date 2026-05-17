/**
 * admin_api_patch.js
 * 將此段程式碼貼入 admin.html 的 <script> 區塊中，
 * 替換掉舊的 api() 函式。
 * 
 * 前提：admin.html 的 <head> 已加入 <script src="api.js"></script>
 */

// ── 後台 adminToken ──────────────────────────────────────────
let adminToken = localStorage.getItem('adminToken') || '';

/**
 * admin.html 專用 api wrapper
 * 自動帶入 adminToken，與舊版行為完全相容
 * 
 * 替換舊版：
 * async function api(action, data = {}) {
 *   return new Promise(function(resolve, reject) {
 *     google.script.run
 *       .withSuccessHandler(...)
 *       .withFailureHandler(...)
 *       .apiRouter({ action, token: adminToken, ...data });
 *   });
 * }
 */
async function api(action, data = {}) {
  // 公開 action 不需帶 token
  const publicActions = ['adminLogin', 'getSessions', 'getSettings'];
  const payload = publicActions.includes(action)
    ? data
    : { token: adminToken, ...data };

  return API.call(action, payload);
}

// ── 後台登入（替換舊版 adminLogin 呼叫後的 token 儲存） ────────
async function performLogin(password) {
  try {
    const result = await API.adminLogin(password);
    if (result && result.success) {
      adminToken = result.token;
      localStorage.setItem('adminToken', adminToken); // 記住 token
    }
    return result;
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function logout() {
  adminToken = '';
  localStorage.removeItem('adminToken');
  // 導回登入畫面（根據你的實際邏輯調整）
  location.reload();
}
