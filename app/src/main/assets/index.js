async function loadData() {
    const searchParams = new URL(window.location).searchParams;
    const q = searchParams.get(`q`);
    const uri = q ? `${baseUri}/search?q=${encodeURIComponent(q)}` : `${baseUri}/notes`
    const res = await fetch(uri);
    if (res.status !== 200) {
        throw new Error();
    }
    return res.json();

}
const en_US = [
    "刚刚", "秒前",
    "1 分钟前", "分钟前",
    "1 小时前", "小时前",
    "1 天前", "天前",
    "1 周前", "周前",
    "1 个月前", "个月前",
    "1 年前", "年前"
]
const SECONDS_IN_TIME = [
    1,         // 1 second
    60,        // 1 minute
    3600,      // 1 hour
    86400,     // 1 day
    604800,    // 1 week
    2419200,   // 1 month
    29030400   // 1 year
];
function timeago(timestamp) {
    let now = Math.floor(new Date / 1000);
    let diff = (now - timestamp) || 1; // prevent undefined val when diff == 0
    for (let i = 6; i >= 0; i--) {
        if (diff >= SECONDS_IN_TIME[i]) {
            let time_elapsed = Math.floor(diff / SECONDS_IN_TIME[i]);
            let adverbs = en_US;
            let sentence = adverbs.map((el, idx) => idx % 2 == 0 ? el : time_elapsed + " " + el);
            return time_elapsed >= 2 ? sentence[i * 2 + 1] : sentence[i * 2];
        }

    }

}
async function renderData() {
    const res = (await loadData()).sort((x, y) => {
        return y.updated_at - x.updated_at
    });
    const buf = [];
    res.forEach(element => {
        buf.push(`<a href="editor.html?id=${element.id}">
<div class="note-item-title">${element.title}</div>
<div class="note-item-time">${timeago(parseInt(element.update_at))}</div >
            </a > `)
    });
    noteItems.innerHTML = buf.join('');
}

////////////////////////////////
const toast = document.getElementById('toast');
const baseUri = window.location.host === "127.0.0.1:5500" ? "http://192.168.8.55:8500" : "";
const noteItems = document.querySelector('.note-items');
const topbarHeader = document.querySelector('.topbar-header');
const searchboxInput = document.querySelector('.searchbox-input');
const topbarBackArrow = document.querySelector('.topbar-back-arrow');
const topbarMenuButton = document.querySelector('.topbar-menu-button');
const iconButton = document.querySelector('.icon-button');
iconButton.addEventListener('click', evt => {
    evt.stopPropagation();
    window.location = `?q=${encodeURIComponent(searchboxInput.value.trim())}`
});
topbarMenuButton.addEventListener('click', evt => {
    topbarHeader.classList.add('search-on');
});
topbarBackArrow.addEventListener('click', evt => {
    topbarHeader.classList.remove('search-on');
});
renderData();