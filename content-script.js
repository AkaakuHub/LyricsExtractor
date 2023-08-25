const eInfo = [
    {
        url: "https://www.google.com/",
        s: '<div jsname="WbKHeb">',
        e: '</div></div>',
        d: [
            { p: /<\/span>/g, r: "\n" },
            { p: /<span jsname="YS01Ge">/g, r: "" },
            { p: /<br aria-hidden="true">/g, r: "" },
            { p: /<div jsname="U8S5sf" class="ujudUb">/g, r: "\n" },
            { p: /<div jsname="U8S5sf" class="ujudUb WRZytc">/g, r: "\n" },
            { p: /<\/div>/g, r: "" }
        ],
    },
    {
        url: "https://www.uta-net.com/",
        s: '<div id="kashi_area" itemprop="text">',
        e: '</div>',
        d: [
            { p: /<br \/>/g, r: "\n" }
        ],
    },
    {
        url: "https://j-lyric.net/",
        s: '<p id="Lyric">',
        e: '</p>',
        d: [
            { p: /<br>/g, r: "\n" }
        ],
    },
    {
        url: "https://www.kkbox.com/",
        s: ',"text":"',
        e: '"},"',
        d: [
            { p: /\\n/g, r: "\n" },
            { p: /\\r/g, r: "" }
        ],
    },
];
let html = '';
let eInfoItem = null;
let loaded = false;
window.onload = openFunction;
function openFunction() {
    loaded = true;
    const url = window.location.href;
    if (!url.includes("https://www.google.com/")) {
        alert("歌詞が準備できました！\nLyrics are ready!");
    }
    eInfoItem = eInfo.find((item) => url.includes(item.url));
    if (eInfoItem) {
        html = fetchHTML(url);
    } else {
        alert('No extraction info found for this URL');
        console.error('No extraction info found for this URL');
    }
}
// メッセージを待ち受ける
chrome.runtime.onMessage.addListener(function (message) {
    if (message.action === "extractFunction") {
        extract();
    }
});
// URLからHTMLを取得する関数
async function fetchHTML(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            alert('Network response was not ok');
            throw new Error('Network response was not ok');
        }
        html = await response.text();
        return html;
    } catch (error) {
        alert('Fetch Error:', error);
        console.error('Fetch Error:', error);
    }
}
// 歌詞部分を抽出する関数
function cut(text, s, e, d) {
    const startIndex = text.indexOf(s);
    if (startIndex === -1) {
        alert('Start keyword not found.');
        console.error('Start keyword not found.');
        return null;
    }
    const endIndex = text.indexOf(e, startIndex + s.length);
    if (endIndex === -1) {
        alert('End keyword not found after start keyword.');
        console.error('End keyword not found after start keyword.');
        return null;
    }
    let extractedText = text.substring(startIndex + s.length, endIndex);
    d.forEach(keywordObject => {
        const { p, r } = keywordObject;
        const regex = new RegExp(p, 'g');
        extractedText = extractedText.replace(regex, r);
    });
    return extractedText;
}
function extract() {
    if (loaded) {
        let extractedText = cut(html, eInfoItem.s, eInfoItem.e, eInfoItem.d);
        let popupL = window.open("", "_blank");
        popupL.document.write(extractedText.replace(/\n/g, "<br>"));
    } else {
        alert('ページがロードされるまでお待ちください。\nPlease wait until the page is loaded.');
        console.log('Please wait until the page is loaded.');
    }
}
