/*
console.log(JSON.stringify([...document.querySelectorAll('a[mp3]')]
.map(x => {
    return {
        "name":x.querySelector('b').textContent,
        "href":x.getAttribute('mp3')
    };
}))
)

console.log(JSON.stringify([...document.querySelectorAll('p[style="line-height:1.5!important;"]')]
    .filter(x => x.querySelector('dd'))
    .map(x => {
        return {
            "name": x.querySelector('dd').textContent,
            "href": x.textContent
        };
    }))
)
*/

const items1 = [
    {"name":"b","href":"b.mp3"},{"name":"p","href":"p.mp3"},{"name":"m","href":"m.mp3"},{"name":"f","href":"f.mp3"},{"name":"d","href":"d.mp3"},{"name":"t","href":"t.mp3"},{"name":"n","href":"n.mp3"},{"name":"l","href":"l.mp3"},{"name":"g","href":"g.mp3"},{"name":"k","href":"k.mp3"},{"name":"h","href":"h.mp3"},{"name":"j","href":"j.mp3"},{"name":"q","href":"q.mp3"},{"name":"x","href":"x.mp3"},{"name":"y","href":"y.mp3"},{"name":"w","href":"w.mp3"},{"name":"zh","href":"zh.mp3"},{"name":"ch","href":"ch.mp3"},{"name":"sh","href":"sh.mp3"},{"name":"r","href":"r.mp3"},{"name":"z","href":"z.mp3"},{"name":"c","href":"c.mp3"},{"name":"s","href":"s.mp3"},
    
    { "name": "a", "href": "a.mp3" }, { "name": "o", "href": "o.mp3" }, { "name": "e", "href": "e.mp3" }, { "name": "i", "href": "i.mp3" }, { "name": "u", "href": "u.mp3" }, { "name": "ü", "href": "v.mp3" }, { "name": "ai", "href": "ai.mp3" }, { "name": "ei", "href": "ei.mp3" }, { "name": "ui", "href": "ui.mp3" }, { "name": "ao", "href": "ao.mp3" }, { "name": "ou", "href": "ou.mp3" }, { "name": "iu", "href": "iu.mp3" }, { "name": "ie", "href": "ie.mp3" }, { "name": "üe", "href": "ve.mp3" }, { "name": "er", "href": "er.mp3" }, { "name": "an", "href": "an.mp3" }, { "name": "en", "href": "en.mp3" }, { "name": "in", "href": "in.mp3" }, { "name": "un", "href": "un.mp3" }, { "name": "ün", "href": "vn.mp3" }, { "name": "ang", "href": "ang.mp3" }, { "name": "eng", "href": "eng.mp3" }, { "name": "ing", "href": "ing.mp3" }, { "name": "ong", "href": "ong.mp3" }];
const items2 = [
    {"name":"b","value":"b [玻]：双唇紧闭，阻碍气流，然后双唇突然放开，让气流冲出，读音轻短。"},{"name":"p","value":"p [坡]：双唇紧闭，阻碍气流，然后双唇突然放开，气流迸出成音。"},{"name":"m","value":"m [摸]：双唇紧闭，舌后缩，气流从鼻腔出来，打开嘴，声带颤动。"},{"name":"f","value":"f [佛]：上齿触下唇形成窄缝，让气流从缝中挤出来，摩擦成声。"},{"name":"d","value":"d [得]：舌根前部抵住软腭阻碍气流，让气流冲破舌根的阻碍，爆发成音。"},{"name":"t","value":"t [特]：舌根前部，抵住上软腭，阻碍气流，让气流冲破舌根的阻碍，迸发成音。"},{"name":"n","value":"n [讷]：舌尖抵住上牙床，气流从鼻腔通过，同时冲开舌尖的阻碍，声带颤动。"},{"name":"l","value":"l [勒]：嘴唇稍开，舌尖抵住上牙床，声带颤动，气流从舌尖两边流出。"},{"name":"g","value":"g [哥]：舌尖抵住上牙床，憋住气流后突然放开，气流从口腔迸出，爆发成音。"},{"name":"k","value":"k [科]：舌尖抵住上牙床，憋住气后，突然离开，气流从口中迸出。"},{"name":"h","value":"h [喝]：舌根抬高，接近软腭，形成窄缝，气流从缝中挤出，摩擦成音。"},{"name":"j","value":"j [基]：舌尖抵住下门齿，舌面前部紧贴硬腭，气流从窄缝中冲出，摩擦成音。"},{"name":"q","value":"q [欺]：舌面前部贴住硬腭，气流冲破舌根的阻碍，摩擦成音。"},{"name":"x","value":"x [希]：舌尖抵住下门齿，舌面前部抬高靠近硬腭，形成窄缝，气流从缝中挤出，摩擦成音。"},{"name":"zh","value":"zh[知]：舌尖上翘，抵住硬腭前部，有较弱的气流冲开舌尖阻碍，从缝中挤出，摩擦成音。"},{"name":"ch","value":"ch[嗤]：舌尖上翘，抵住硬腭前部，有较强的气流冲开舌尖阻碍，从缝中挤出，摩擦成音。"},{"name":"sh","value":"sh[诗]：舌尖上翘，靠近硬腭前部，留出窄缝，气流从窄缝中挤出，摩擦成音。"},{"name":"r","value":"r [日]：舌尖上翘，靠近硬腭前部，留出窄缝，嗓子用力发音，气流从窄缝中挤出，摩擦成音，声带颤动。"},{"name":"z","value":"z [资]：舌尖抵住上门齿背，阻碍气流，让较弱的气流冲开舌尖阻碍，从窄缝中挤出，摩擦成音。"},{"name":"c","value":"c [雌]：舌尖抵住上门齿背，阻碍气流，让较强的气流从缝中挤出，摩擦成音。"},{"name":"s","value":"s [思]：舌尖接近上门齿背，留出窄缝，气流从舌尖的窄缝中挤出，摩擦成音。"},{"name":"y","value":"y [医]：嘴微张成扁平状，舌尖抵住下齿龈，舌面抬高，靠近上硬腭，声带颤动。"},{"name":"w","value":"w [巫]：嘴唇拢圆，突出成小孔，舌面后部隆起，声带颤动。"},
    
    { "name": "a", "value": "a [啊]：嘴唇自然张大，舌放平，舌头中间微隆，声带颤动。" }, { "name": "o", "value": "o [喔]：嘴唇成圆形，微翘起，舌头向后缩，舌面后部隆起，舌居中，声带颤动。" }, { "name": "e", "value": "e [鹅]：嘴半开，舌位靠后，嘴角向两边展开成扁形，声带颤动。" }, { "name": "i", "value": "i [衣]：嘴微张成扁平状，舌尖抵住下齿龈，舌面抬高，靠近上硬腭，声带颤动。" }, { "name": "u", "value": "u [乌]：嘴唇拢圆，突出成小孔，舌面后部隆起，声带颤动。" }, { "name": "ü", "value": "ü [迂]：嘴唇成圆形，接近闭拢，舌尖抵住下齿龈，舌面前部隆起，声带颤动。" }, { "name": "ai", "value": "ai [哀]：先发 a 的音，然后滑向i，气流不中断，读音轻短。" }, { "name": "ei", "value": "ei [欸]：先发 e 的音，然后滑向i，气流不中断，嘴角向两边展开。" }, { "name": "ui", "value": "ui [威]：u 的发音轻短，然后滑向 ei，嘴形由圆到扁。" }, { "name": "ao", "value": "ao [熬]：先发 a 的音，然后舌尖后缩，舌根向上抬，嘴形拢成圆形，轻轻的滑向 o。" }, { "name": "ou", "value": "ou [欧]：先发 o 的音，嘴唇渐收拢，舌根抬高，口型由大圆到小圆。" }, { "name": "iu", "value": "iu [优]：先发 i，然后向 ou 滑动，口型由扁到圆。" }, { "name": "ie", "value": "ie [耶]：先发 i，再发e，气流不中断。" }, { "name": "üe", "value": "üe [约]：先发 ü 的音，然后向e滑动，口型由圆到扁。" }, { "name": "er", "value": "er [儿]：舌位居中发 e 的音，然后舌尖向硬腭卷起，两个字母同时发音。" }, { "name": "an", "value": "an [安]：先发 a 的音，然后舌尖逐渐抬起，顶住上牙床发n的音。" }, { "name": "en", "value": "en [恩]：先发 e 的音，然后舌面抬高,舌尖抵住上牙床，气流从鼻腔泄出，发n的音。" }, { "name": "in", "value": "in [因]：先发 i 的音，然后舌尖抵住下门齿背，舌面渐至硬腭，气流从鼻腔泄出，发n的音。" }, { "name": "un", "value": "un [温]：先发 u 的音，然后舌尖抵住上牙床，接着发n的音，气流从鼻腔泄出。" }, { "name": "ün", "value": "ün [晕]：先发 ü 的音，然后舌头上抬，抵住上牙床，气流从鼻腔泄出，发n的音。" }, { "name": "ang", "value": "ang [昂]：先发 a 的音，然后舌根抵住上软腭，气流从鼻腔泄出，发后鼻音尾ng的音。" }, { "name": "eng", "value": "eng [亨]：先发 e 的音，然后舌尖抵住下牙床，舌根后缩抵住软腭发ng音，气流从鼻腔泄出。" }, { "name": "ing", "value": "ing [英]：舌尖触下齿龈，舌面隆起至硬腭，鼻腔共鸣成声。" }, { "name": "ong", "value": "ong [轰]：先发 o 的音，然后舌根后缩抵住软腭，舌面隆起，嘴唇拢圆，鼻腔共鸣成声。" }];

items2.forEach(x => {
    const div = document.createElement("div");
    div.innerText = x.value;
    div.addEventListener("click", evt => {
        audio.src = `https://www.hypy.com.cn/pinyin/${items1.filter(v=>v.name===x.name)[0].href}`;
        audio.play();
    });
    document.body.appendChild(div);
})

const audio = document.createElement("audio");
document.body.appendChild(audio);
