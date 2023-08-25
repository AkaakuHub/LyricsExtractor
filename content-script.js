const URLlist = ["https://www.google.com/", "https://www.uta-net.com/", "https://j-lyric.net/", "https://www.kkbox.com/"];
// URLと対応する抽出情報をマップ化
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
// メッセージを待ち受ける
browser.runtime.onMessage.addListener(function (message) {
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
        const html = await response.text();
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
    const url = window.location.href;
    if (!URLlist.some(word => url.includes(word))) {
        alert("対応していないサイトです。\nThis site is not supported.");
    } else {
        const eInfoItem = eInfo.find((item) => url.includes(item.url));
        if (eInfoItem) {
            fetchHTML(url)
                .then((html) => {
                    let extractedText = cut(html, eInfoItem.s, eInfoItem.e, eInfoItem.d);
                    alert(extractedText);
                })
                .catch((error) => {
                    alert(error);
                    console.error(error);
                });
        } else {
            alert('No extraction info found for this URL');
            console.error('No extraction info found for this URL');
        }
    }
}