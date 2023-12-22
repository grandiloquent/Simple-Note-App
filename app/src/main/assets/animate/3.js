(() => {
    const str = `[]{}$*@?\`\\←↑→↓∑π`;
    console.log(str.split('')
    .map(x=>{
        return `<Key android:codes="${x.codePointAt(0)}" android:keyLabel="${x}"/>`;
    }).join('\n'));
})();s