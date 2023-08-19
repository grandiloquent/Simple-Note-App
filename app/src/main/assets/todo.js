const baseUri = window.location.host === "127.0.0.1:5500" ? "http://192.168.8.55:8500" : "";

const toast = document.getElementById('toast');


async function renderTaskList() {
    let res;
    try {
        res = await fetch(`${baseUri}/todo/list`);
        if (res.status !== 200) {
            throw new Error();
        }
        const obj = await res.json();
        main.innerHTML = obj.map(x => {
            return `<div class="item" data-id="${x.id}" data-start="${x.start}">
            <div class="item-content">
                ${x.title}
            </div>
            <div class="item-actions">
                <div class="item-action">
                ${daysLeft(x.start)}
                </div>
            </div>
        </div>`
        }).join('');
        document.querySelectorAll('.item')
            .forEach(element => {
                element.addEventListener('click', evt => {
                    dialogContainer.style.display = 'flex';
                    dialogContainer.dataset.id = evt.currentTarget.dataset.id;
                    dialogTextarea.value = evt.currentTarget.querySelector('.item-content').textContent.trim();
                    const now = new Date(parseInt(evt.currentTarget.dataset.start) * 1000);
                    dialogInput.value = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${now.getHours()}时${now.getMinutes()}分`;

                })
            })
    } catch (error) {
        toast.setAttribute('message', '错误');
    }
}
const main = document.querySelector('.main');

const dialogContainer = document.querySelector('.dialog-container');
const barItemTab = document.querySelector('.bar-item-tab');
barItemTab.addEventListener('click', evt => {
    dialogContainer.style.display = 'flex';
});
const dialogOverlay = document.querySelector('.dialog-overlay');
dialogOverlay.addEventListener('click', evt => {
    dialogContainer.style.display = 'none';
});
document.getElementById('off')
    .addEventListener('click', evt => {
        dialogContainer.style.display = 'none';
    });
const dialogInput = document.querySelector('.dialog-input');
const now = new Date();
dialogInput.value = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${now.getHours()}时${now.getMinutes()}分`;

const dialogTextarea = document.querySelector('.dialog-textarea');
document.getElementById('on')
    .addEventListener('click', async evt => {
        dialogContainer.style.display = 'none';
        const id = parseInt(dialogContainer.dataset.id || '0');
        const title = dialogTextarea.value.trim();
        let res;
        try {
            const match = /(\d{1,4})年(\d{1,2})月(\d{1,2})日 +(\d{1,2})时(\d{1,2})分/.exec(dialogInput.value);

            const time = new Date();
            time.setFullYear(parseInt(match[1]));
            time.setMonth(parseInt(match[2]) - 1);
            time.setDate(parseInt(match[3]));
            time.setHours(parseInt(match[4]), parseInt(match[5]), 0, 0);
            console.log(time);
            res = await fetch(`${baseUri}/note`, {
                method: 'POST',
                body: JSON.stringify({
                    id, title, start: time / 1000 | 0
                })
            });
            if (res.status !== 200) {
                throw new Error();
            }
            const obj = await res.json();
            toast.setAttribute('message', '成功');
        } catch (error) {
            toast.setAttribute('message', '错误');
        }
    });



renderTaskList();

function daysLeft(seconds) {
    const now = new Date() / 1000 | 0;
    const dif = seconds - now;
    if (dif <= 0) {
        return "已过期"
    } else if (dif > 86400) {
        return `${dif / 86400 | 0}天后`
    } else if (dif > 3600) {
        return `${dif / 3600 | 0}小时后`
    } else if (dif > 60) {
        return `${dif / 60 | 0}分钟后`
    } else {
        return `${dif}秒钟后`
    }

}