(() => {
    const str = `"'`;
    console.log(str.split('')
        .map(x => {
            return `<Key android:codes="${x.codePointAt(0)}" android:keyLabel="${x}"/>`;
        }).join('\n'));
})();


(() => {

    console.log([...new Array(26).keys()]
        .map(key => key + 97)
        .map(x => {
            let f = '';
            let s = "";
            if ((x - 96 ) % 5 === 0)
                s = "</Row>";
            else if ((x - 96 - 1) % 5 === 0)
                f = "<Row>";


            return `${f}<Key android:codes="${x}" android:keyLabel="${String.fromCodePoint(x)}"/>${s}`;
        }).join('\n'));
})();