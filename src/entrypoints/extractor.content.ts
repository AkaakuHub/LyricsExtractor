import { defineContentScript } from "wxt/utils/define-content-script";
import "./extractor-style.css";

const eInfo = [
	{
		url: "https://www.google.com/",
		s: '<div jsname="WbKHeb">',
		e: "</div></div>",
		d: [
			{ p: /<\/span>/g, r: "\n" },
			{ p: /<span jsname="YS01Ge">/g, r: "" },
			{ p: /<br aria-hidden="true">/g, r: "" },
			{ p: /<div jsname="U8S5sf" class="ujudUb">/g, r: "\n" },
			{ p: /<div jsname="U8S5sf" class="ujudUb WRZytc">/g, r: "\n" },
			{ p: /<\/div>/g, r: "" },
		],
	},
	{
		url: "https://www.uta-net.com/",
		s: '<div id="kashi_area" itemprop="text">',
		e: "</div>",
		d: [{ p: /<br \/>/g, r: "\n" }],
	},
	{
		url: "https://j-lyric.net/",
		s: '<p id="Lyric">',
		e: "</p>",
		d: [{ p: /<br>/g, r: "\n" }],
	},
	{
		url: "https://www.kkbox.com/",
		s: ',"text":"',
		e: '"},"',
		d: [
			{ p: /\\n/g, r: "\n" },
			{ p: /\\r/g, r: "" },
		],
	},
];

let html = "";
let eInfoItem: (typeof eInfo)[0] | null = null;

// 歌詞部分を抽出する関数
function cut(
	text: string,
	s: string,
	e: string,
	d: Array<{ p: RegExp; r: string }>,
) {
	const startIndex = text.indexOf(s);
	if (startIndex === -1) {
		console.error("LyricsExtractor: Start keyword not found.");
		return null;
	}
	const endIndex = text.indexOf(e, startIndex + s.length);
	if (endIndex === -1) {
		console.error(
			"LyricsExtractor: End keyword not found after start keyword.",
		);
		return null;
	}
	let extractedText = text.substring(startIndex + s.length, endIndex);
	d.forEach((keywordObject) => {
		const { p, r } = keywordObject;
		const regex = new RegExp(p.source, p.flags);
		extractedText = extractedText.replace(regex, r);
	});
	return extractedText;
}

function extract() {
	if (!eInfoItem) {
		console.error("LyricsExtractor: No extraction info available");
		return;
	}
	const lyrics = cut(html, eInfoItem.s, eInfoItem.e, eInfoItem.d);
	const HTMLtitle = document.title;
	const popupL = window.open("", "_blank");

	if (!popupL) {
		console.error("LyricsExtractor: Popup blocked");
		return;
	}

	const doc = popupL.document;
	const content =
		lyrics?.replace(/\n/g, "<br>") ?? "歌詞の抽出に失敗しました。";
	const htmlContent = `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${HTMLtitle} - LyricsExtractor</title>
    </head>
    <body>
		${content}
    </body>
    </html>`;

	doc.documentElement.innerHTML = htmlContent;
}

export default defineContentScript({
	matches: [
		"https://www.google.com/*",
		"https://www.uta-net.com/*",
		"https://j-lyric.net/*",
		"https://www.kkbox.com/*",
	],
	runAt: "document_idle",
	main() {
		main();
		insertUi();
	},
});

function handleExtractClick() {
	const url = window.location.href;

	// Googleかつ「歌詞全文」がある場合はリンクを探して遷移
	if (url.includes("https://www.google.com/") && html.includes("歌詞全文")) {
		const fullLyricsLink = Array.from(document.querySelectorAll("a")).find(
			(el) => el.textContent && el.textContent.trim() === "歌詞全文",
		) as HTMLAnchorElement;
		if (fullLyricsLink && fullLyricsLink instanceof HTMLAnchorElement) {
			// リンクのURLを取得して自動抽出フラグを付与
			const linkUrl = fullLyricsLink.href;

			// 既存のクエリパラメータを保持しながらフラグを追加
			const urlObj = new URL(linkUrl);
			urlObj.searchParams.set("auto_extract", "true");
			const urlWithFlag = urlObj.toString();

			// 現在のタブで遷移
			window.location.href = urlWithFlag;
			return;
		}
	}

	// それ以外の場合は普通に抽出
	extract();
}

function main() {
	const url = window.location.href;
	eInfoItem = eInfo.find((item) => url.includes(item.url)) ?? null;
	if (eInfoItem) {
		html = document.body.innerHTML;

		// URLクエリで自動抽出フラグをチェック
		const urlParams = new URLSearchParams(window.location.search);
		const autoExtract = urlParams.get("auto_extract");

		// Googleかつ「歌詞全文」がある場合
		if (url.includes("https://www.google.com/") && html.includes("歌詞全文")) {
			// メインの抽出処理は普通に実行（UIも表示）
			return;
		}
		if (autoExtract === "true") {
			// クエリパラメータを削除してURLを更新
			urlParams.delete("auto_extract");
			const newUrl = urlParams.toString()
				? `${window.location.pathname}?${urlParams.toString()}`
				: window.location.pathname;
			history.replaceState({}, "", newUrl);
			extract();
			return;
		}
	} else {
		console.error("LyricsExtractor: No extraction info found for this URL");
	}
}

function insertUi() {
	if (!eInfoItem) return;
	if (document.getElementById("LE_ButtonContainer")) return;

	if (
		!window.location.href.includes("https://www.google.com/") ||
		html.includes('<div jsname="WbKHeb">')
	) {
		// 以下の2つを入れるためのコンテナー
		const container = document.createElement("div");
		container.id = "LE_ButtonContainer";

		// メインボタン
		const actionButton = document.createElement("button");
		actionButton.textContent = "歌詞を抽出";
		actionButton.className = "extractButton";
		actionButton.addEventListener("click", () => {
			handleExtractClick();
		});

		// 閉じるボタン（独立したコンポーネントとしてコンテナーに直接追加）
		const closeButton = document.createElement("button");
		closeButton.textContent = "×";
		closeButton.className = "closeButton";
		closeButton.setAttribute("aria-label", "閉じる");
		closeButton.addEventListener("click", () => {
			container.remove();
		});

		// 構造を組み立て - 両方をコンテナの直下に配置
		container.appendChild(actionButton);
		container.appendChild(closeButton);
		document.body.appendChild(container);

		// アニメーション開始
		setTimeout(() => {
			container.classList.add("show");
		}, 100);
	}
}
