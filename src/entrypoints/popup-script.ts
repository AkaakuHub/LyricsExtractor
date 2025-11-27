import { defineUnlistedScript } from "wxt/utils/define-unlisted-script";
import { browser } from "wxt/browser";
export default defineUnlistedScript(() => {
	const statusEl = document.createElement("p");
	statusEl.id = "status";
	statusEl.style.fontSize = "12px";
	statusEl.style.margin = "6px 0 0";
	function setStatus(message: string, isError = false) {
		statusEl.textContent = message;
		statusEl.style.color = isError ? "#b00020" : "#0f172a";
	}
	document.addEventListener("DOMContentLoaded", () => {
		const button = document.getElementById("extractButton");
		if (!button) return;
		button.after(statusEl);
		setStatus("対応ページで押してください。");
		button.addEventListener("click", async () => {
			try {
				button.setAttribute("disabled", "true");
				setStatus("処理中…");
				const [tab] = await browser.tabs.query({
					active: true,
					currentWindow: true,
				});
				if (!tab?.id) {
					setStatus("アクティブなタブが見つかりません", true);
					return;
				}
				await browser.tabs.sendMessage(tab.id, {
					type: "extract-lyrics",
				});
				setStatus("歌詞を抽出しました。新しいタブを確認してください。");
			} catch (error) {
				console.error(error);
				setStatus(
					"コンテンツスクリプトが読み込まれていない可能性があります。対応ページで再試行してください。",
					true,
				);
			} finally {
				button.removeAttribute("disabled");
			}
		});
	});
});
