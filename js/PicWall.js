(function() {

    const items = document.querySelectorAll('.item');
    let that = null;
    const closeBtn = document.querySelectorAll('.close');
    // const mask = document.querySelectorAll('.mask');

    const init = function() {
        addEventFunction();
    }

    const addEventFunction = function() {
        items.forEach(item => {
            item.addEventListener('click', onClickShow);
        })


    }

    /**
     * 点击图片会变大显示
     */

    const onClickShow = function(e) {
        const mask = this.children[0].children[2];
        // closeBtn = this.children[0].children[2].children[1];
        items.forEach(item => {
            if (item.getAttribute('class').indexOf('on') > -1) {
                item.classList.remove('on');
                mask.classList.remove('mask-show');
            }
        })
        items.forEach(item => {
                if (item.getAttribute('class').indexOf('hide') > -1) {
                    item.classList.remove('hide');
                }
            })
            // 图片变大
        this.classList.add('on');
        // 字体和关闭符号显示
        mask.classList.add('mask-show');
        items.forEach(item => {
            if (item !== this) {
                item.classList.add('hide');
            }
        })
        that = this;
    }

    closeBtn.forEach(item => {
        item.onclick = function(e) {
            e.stopPropagation();
            console.log(this.classList)
            that.classList.remove('on');
            this.closest('.mask').classList.remove('mask-show')
            items.forEach(item => {
                // console.log(item.getAttribute('class'))
                if (item.getAttribute('class').indexOf('hide') > -1) {
                    // console.log(1)
                    item.classList.remove('hide');
                }
            })
        }
    })
    init();
})()