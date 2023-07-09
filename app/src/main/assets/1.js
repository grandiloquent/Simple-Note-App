(() => {
    function deleteRedundantItems() {
        const elements = [...document.querySelectorAll('.search_prolist_item')];
        elements.forEach(element => {
            const searchProlistAd = element.querySelector('.search_prolist_ad');
            if (searchProlistAd) {


                element.remove();
            }
            const searchProlistOther = element.querySelector('.search_prolist_other img');
            if (!searchProlistOther || !searchProlistOther.src.endsWith('c5ab4d78f8bf4d90.png')) {
                element.remove();
            }

        });
    }
    if (window.location.host.endsWith('m.jd.com')) {
        deleteRedundantItems();
        window.addEventListener('scroll', evt => {
            deleteRedundantItems()
        })
    }
})();