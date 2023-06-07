async function render(id) {
    if (!id) return;
    let res;

    try {
        res = await fetch(`${baseUri}/note?id=${id}`);
        if (res.status !== 200) {
            throw new Error();
        }
        const obj = await res.json();
        document.title = obj.title;
        const md = window.markdownit({
            html: true,
            linkify: true,
            typographer: true,
            // https://github.com/highlightjs/highlight.js/tree/main/src/languages
            // https://github.com/highlightjs/highlight.js/blob/main/SUPPORTED_LANGUAGES.md
            highlight: function (str, lang) {
                console.log("--------------------------------",str,lang);
                if (lang && hljs.getLanguage(lang)) {
                    try {
                        return hljs.highlight(str, { language: lang }).value;
                    } catch (error) {
                        console.log(error);
                    }
                }

                return ''; // use external default escaping
            }
        });
        markdownContainer.innerHTML = md.render(obj.content);
    } catch (error) {
        toast.setAttribute('message', '错误');
    }
}
const toast = document.getElementById('toast');
const searchParams = new URL(window.location).searchParams;
const id = searchParams.get('id');
const baseUri = window.location.host === "127.0.0.1:5500" ? "http://192.168.8.55:8500" : "";
const markdownContainer = document.querySelector('.markdown-container');

render(id);
