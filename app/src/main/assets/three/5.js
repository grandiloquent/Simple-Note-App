const id = new URL(window.location).searchParams.get('id');
const div = document.createElement("div");
div.style.display = "flex";
div.style.position = 'fixed';
div.style.left = "0";
div.style.right = "0";
div.style.bottom = "0";
div.style.height = "48px";
div.style.textAlign = "center";
div.style.alignItems = "center";
const b1 = document.createElement("div");
b1.innerHTML = "练习";
b1.style.flexGrow = "1";
div.appendChild(b1);
const b2 = document.createElement("div");
b2.innerHTML = "有问题"
b2.style.flexGrow = "1";
div.appendChild(b2);

const b3 = document.createElement("div");
b3.innerHTML = "高耗";
b3.style.flexGrow = "1";
div.appendChild(b3);

b1.addEventListener("click", async evt => {
    let res;
    try {

        res = await fetch(`/code`, {
            method: 'POST',
            body: JSON.stringify({
                id: parseInt(id),
                title: "WebGL 练习"
            }),
            cache: "no-store"
        });
        if (res.status !== 200) {

        }
    } catch (error) {
    }
    try {
        const response = await fetch(`/code/random`);
        if (response.status > 399 || response.status < 200) {
            throw new Error(`${response.status}: ${response.statusText}`)
        }
        const results = await response.text();
        window.location.href = `?id=${results}`
    } catch (error) {
        console.log(error);
    }
});
b2.addEventListener("click", async evt => {
    let res;
    try {

        res = await fetch(`/code`, {
            method: 'POST',
            body: JSON.stringify({
                id: parseInt(id),
                title: "有问题"
            }),
            cache: "no-store"
        });
        if (res.status !== 200) {

        }
    } catch (error) {
    }
    try {
        const response = await fetch(`/code/random`);
        if (response.status > 399 || response.status < 200) {
            throw new Error(`${response.status}: ${response.statusText}`)
        }
        const results = await response.text();
        window.location.href = `?id=${results}`
    } catch (error) {
        console.log(error);
    }
});
b3.addEventListener("click", async evt => {
    let res;
    try {

        res = await fetch(`/code`, {
            method: 'POST',
            body: JSON.stringify({
                id: parseInt(id),
                title: "高耗"
            }),
            cache: "no-store"
        });
        if (res.status !== 200) {

        }
    } catch (error) {
    }
    try {
        const response = await fetch(`/code/random`);
        if (response.status > 399 || response.status < 200) {
            throw new Error(`${response.status}: ${response.statusText}`)
        }
        const results = await response.text();
        window.location.href = `?id=${results}`
    } catch (error) {
        console.log(error);
    }
});
document.body.appendChild(div);

document.addEventListener('keydown', evt => {
    if (evt.key === 'F3') {
        evt.preventDefault();
        b1.click();
    } else if (evt.key === "F4") {
        evt.preventDefault();
        b2.click();
    }
})
