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
    // {
    //     url: "https://www.kkbox.com/",
    //     s: ',"text":"',
    //     e: '"},"',
    //     d: [
    //         { p: /\\n/g, r: "\n" },
    //         { p: /\\r/g, r: "" }
    //     ],
    // },
];
let html = '';
let eInfoItem = null;
main();
function main() {
    const url = window.location.href;
    eInfoItem = eInfo.find((item) => url.includes(item.url));
    if (eInfoItem) {
        buildButton(url);
    } else {
        console.error('LyricsExtractor: No extraction info found for this URL');
    }
}

async function buildButton(url) {
    html = document.body.innerHTML;
    if (!url.includes("https://www.google.com/") || html.includes('<div jsname="WbKHeb">')) {
        // 以下の2つを入れるためのコンテナー
        const container = document.createElement('div');
        container.id = "LE_ButtonContainer";
        document.body.insertAdjacentElement("afterbegin", container);

        // bodyの一番上に、「準備完了」という文字列を表示する
        const div = document.createElement('div');
        div.textContent = "新しいタブで歌詞を表示する";
        div.className = "extractButton";
        div.addEventListener("click", function () {
            extract();
        });
        container.insertAdjacentElement("afterbegin", div);
        // さらに、バツボタンを表示する
        const closeButton = document.createElement('div');
        closeButton.textContent = "×";
        closeButton.className = "closeButton";
        closeButton.addEventListener("click", function () {
            container.remove();
        });
        container.insertAdjacentElement("afterbegin", closeButton);
        setTimeout(() => {
            container.classList.add("show");
        }, 1);
    }
    return;
}

// 歌詞部分を抽出する関数
function cut(text, s, e, d) {
    const startIndex = text.indexOf(s);
    if (startIndex === -1) {
        console.error('LyricsExtractor: Start keyword not found.');
        return null;
    }
    const endIndex = text.indexOf(e, startIndex + s.length);
    if (endIndex === -1) {
        console.error('LyricsExtractor: End keyword not found after start keyword.');
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
    let lyrics = cut(html, eInfoItem.s, eInfoItem.e, eInfoItem.d);
    const HTMLtitle = document.title;
    let popupL = window.open("", "_blank");

    popupL.document.write(`
    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${HTMLtitle} - LyricsExtractor</title>
    </head>
    <body>
        ${lyrics.replace(/\n/g, "<br>")}
    </body>
    </html>
`);
}