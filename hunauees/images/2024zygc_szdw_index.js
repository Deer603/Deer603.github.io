class NewsHandler {
    constructor(data) {
        this.data = data;
        this.processedData = this.addInitialProperty(this.data);
        this.chunkArrayBySix = [];
        this.init();
    }

    // 操作数组
    chunkArray(array, size) {
        if (!Array.isArray(array) || size <= 0) {
            throw new Error("Invalid input: array must be an array and size must be a positive number.");
        }
        const result = [];
        for (let i = 0; i < array.length; i += size) {
            result.push(array.slice(i, i + size));
        }
        return result;
    }

    // 获取html结构
    getHtml(dataChunk) {
        let str = '';
        for (let i = 0; i < dataChunk.length; i++) {
            str += `<div class="news-item pr-a">
                        <a href="${dataChunk[i].url}"></a>
                        <img src="${dataChunk[i].src}" alt="">
                        <div class="news-item-r">
                            <p>${dataChunk[i].name}</p>
                            <p>${dataChunk[i].zc}</p>
                            <p>${dataChunk[i].email}</p>
                            <p>${dataChunk[i].jieshao}</p>
                        </div>
                    </div>`;
        }
        $('.news-list').html(str);
    }

    // 添加首字母属性函数
    addInitialProperty(data) {
        return data.map(item => {
            const initial = pinyin.pinyin(item.name, {
                style: pinyin.pinyin.STYLE_FIRST_LETTER
            })[0][0].toUpperCase();
            return {
                ...item,
                initial: initial
            };
        });
    }

    // 分页
    fenye(data, dataChunks) {
        layui.use('laypage', function () {
            var laypage = layui.laypage;
            laypage.render({
                elem: 'page',
                count: data.length,
                limit: 6,
                curr: 1,
                jump: function (obj, first) {
                    if (!first) {
                        NewsHandler.prototype.getHtml.call(this, dataChunks[obj.curr - 1]);
                    }
                }
            });
        });
    }

    init() {
        //数组分组
        this.chunkArrayBySix = this.chunkArray(this.processedData, 6);
        //添加到html
        this.getHtml(this.chunkArrayBySix[0]);
        // 执行分页
        this.fenye(this.processedData, this.chunkArrayBySix);
    }

    // 切换首字母分类
    switchTab(event) {
        let temp = $(event.currentTarget).text();
        $('.news-tab1 li').removeClass('on');
        $(event.currentTarget).addClass('on');
        if (temp == '全部') {
            this.init();
        } else {
            let filterData = this.processedData.filter(item => item.initial == temp);
            if (filterData.length < 1) {
                $('.news-list').html('<div class="wsj">该分类暂时没有数据！</div>');
            } else {
                let filterChunks = this.chunkArray(filterData, 6);
                NewsHandler.prototype.getHtml.call(this, filterChunks[0]);
                this.fenye(filterData, filterChunks);
            }
        }
    }

    // 绑定点击事件
    bindEvents() {
        $('.news-tab1').on('click', 'li', this.switchTab.bind(this));
    }
}
