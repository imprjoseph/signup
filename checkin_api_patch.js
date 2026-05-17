/**
 * checkin_api_patch.js
 * checkin.html 的 api 呼叫替換方案
 * 
 * 舊版 checkin.html 用的是：
 *   const GAS_URL = '<?= ScriptApp.getService().getUrl() ?>';
 *   async function api(action, data = {}) {
 *     const resp = await fetch(GAS_URL, {
 *       method: 'POST', redirect: 'follow',
 *       body: JSON.stringify({ action, ...data })
 *     });
 *     return resp.json();
 *   }
 * 
 * 新版 checkin.html：
 * 1. 刪除 const GAS_URL 那行（GAS Template 語法在 GitHub Pages 無法運作）
 * 2. 刪除舊的 api() 函式
 * 3. 在 <head> 加入 <script src="api.js"></script>
 * 4. 所有 api('xxx', {...}) 呼叫完全不用改
 * 
 * 以下是 checkin.html 完整的 JS 替換區段：
 */

// ── URL 參數讀取（保留原邏輯） ──────────────────────────────────
const urlParams      = new URLSearchParams(window.location.search);
const registrationNo = urlParams.get('registrationNo') || '';
const token          = urlParams.get('token') || '';

// ── 使用 api.js 的 API 物件 ───────────────────────────────────
// api.js 已在 <head> 引入，直接使用 API 物件

window.onload = async function() {
  if (!registrationNo || !token) {
    showError('無效的 QR Code，請重新掃描。');
    return;
  }

  // 顯示載入中
  showLoading(true);

  try {
    // ✅ 呼叫方式與舊版相同，底層改為 fetch() to GAS
    const result = await API.getCheckinInfo(registrationNo, token);
    showLoading(false);

    if (!result || !result.success) {
      showError(result?.error || '查無報名資料');
      return;
    }

    renderCheckinInfo(result.data);

  } catch (err) {
    showLoading(false);
    showError('網路連線異常，請重新整理後再試。');
    console.error(err);
  }
};

// ── 報到按鈕 ──────────────────────────────────────────────────
async function doCheckin() {
  const btn = document.getElementById('btnCheckin');
  if (btn) btn.disabled = true;

  try {
    const result = await API.doCheckin(registrationNo, token, 'self');

    if (result.alreadyCheckin) {
      showAlreadyCheckin(result.checkinTime);
      return;
    }
    if (!result.success) {
      showError(result.error || '報到失敗');
      if (btn) btn.disabled = false;
      return;
    }

    showCheckinSuccess(result.isWaitlist);

  } catch (err) {
    showError('網路連線異常，請洽工作人員。');
    if (btn) btn.disabled = false;
    console.error(err);
  }
}

// ── 領取紀念品按鈕 ────────────────────────────────────────────
async function doGift() {
  const btn = document.getElementById('btnGift');
  if (btn) btn.disabled = true;

  try {
    const result = await API.doGift(registrationNo, 'self');

    if (result.alreadyReceived) {
      alert('此人員已領取紀念品。');
      return;
    }
    if (!result.success) {
      showError(result.error || '領取失敗');
      if (btn) btn.disabled = false;
      return;
    }

    showGiftSuccess(result.notCheckin);

  } catch (err) {
    showError('網路連線異常，請洽工作人員。');
    if (btn) btn.disabled = false;
    console.error(err);
  }
}

// ── UI 輔助函式（根據你的 HTML 結構調整） ───────────────────────
function showLoading(show) {
  const el = document.getElementById('loadingState');
  if (el) el.style.display = show ? 'block' : 'none';
}

function showError(msg) {
  const el = document.getElementById('errorState');
  if (el) {
    el.textContent = msg;
    el.style.display = 'block';
  }
  const main = document.getElementById('mainContent');
  if (main) main.style.display = 'none';
}

function renderCheckinInfo(data) {
  // 根據你的 checkin.html DOM 結構填入資料
  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setEl('infoName',         data.name        || '');
  setEl('infoOrganization', data.organization || '');
  setEl('infoTitle',        data.title        || '');
  setEl('infoSessionName',  data.sessionName  || '');
  setEl('infoStatus',       data.status       || '');
  setEl('infoCheckinStatus',data.checkinStatus|| '');

  const main = document.getElementById('mainContent');
  if (main) main.style.display = 'block';

  // 已報到 → 禁用按鈕
  const btn = document.getElementById('btnCheckin');
  if (btn && data.checkinStatus === '已報到') {
    btn.disabled = true;
    btn.textContent = '已完成報到';
  }

  // 已領取紀念品 → 禁用按鈕
  const giftBtn = document.getElementById('btnGift');
  if (giftBtn && data.giftStatus === '已領取') {
    giftBtn.disabled = true;
    giftBtn.textContent = '已領取紀念品';
  }
}

function showAlreadyCheckin(time) {
  alert('此報名者已於 ' + time + ' 完成報到。');
}

function showCheckinSuccess(isWaitlist) {
  if (isWaitlist) {
    alert('候補報名者報到成功，請工作人員確認席位。');
  } else {
    alert('✅ 報到成功！歡迎入場。');
  }
  // 重新整理頁面顯示最新狀態
  location.reload();
}

function showGiftSuccess(notCheckin) {
  if (notCheckin) {
    alert('⚠️ 紀念品已登記領取，但此人員尚未完成報到，請工作人員確認。');
  } else {
    alert('✅ 紀念品領取成功！');
  }
  location.reload();
}
