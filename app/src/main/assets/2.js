(() => {
    const results = [];
    let step = false;
    // results.push(`[${index + j * .5},0,2]`);
    for (let index = 0; index < 3; index++) {
        if (index % 2 === 0) {
            for (let i = 0; i < 4; i++) {
                results.push(`[${index*2  + i * .5},0,0]`);
            }
            for (let i = 0; i < 5; i++) {
                results.push(`[${index*2+2},0,${i*0.5}]`);
            }
           //results.push("\n")
        } else {
            for (let i = 0; i < 3; i++) {
                results.push(`[${index*2  + (i+1) * .5},0,2]`);
            }
            for (let i = 0; i <4; i++) {
                results.push(`[${index*2+2},0,${2-i*0.5}]`);
            }
            //results.push("\n")
           
        }
    }
    console.log(results.join(','));
})();