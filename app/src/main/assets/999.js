(() => {
    const headers = [...document.querySelectorAll('h1,h2,h3')];
    const buffers = [];
    let index = 0;
    headers.forEach(h => {
        const id = `header_id_${index++}`;
        h.id = id;
        buffers.push(`<a href="#${id}">${h.textContent}</a>`)
    });

    document.body.insertAdjacentHTML('afterbegin', `<div style="display:flex;flex-direction:column">${buffers.join('\n')}</div>`);
})()