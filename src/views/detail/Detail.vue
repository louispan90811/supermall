<template>
  <div id="detail">
    <detail-nav-bar class="detail-nav" @titleClick="titleClick" ref="detalNav"/>
    <scroll class="content"
            ref="scroll"
            :probe-type="3"
            @scroll="contentScroll">
      <detail-swiper :top-images="topImages"/>
      <detail-base-info :goods="goods"/>
      <detail-shop-info :shop="shop"/>
      <detail-goods-info :detail-info="detailInfo" @imageLoad="imageLoad"/>
      <detail-param-info :param-info="paramInfo" ref="paramInfo"/>
      <detail-comment-info :comment-info="commentInfo" ref="commentInfo"/>
      <goods-list :goods="recommends" ref="recommends"/>
    </scroll>
  </div>
</template>
<script>
  import DetailNavBar from "./childComps/DetailNavBar";
  import DetailSwiper from "./childComps/DetailSwiper";
  import DetailBaseInfo from "./childComps/DetailBaseInfo";
  import DetailShopInfo from "./childComps/DetailShopInfo";
  import DetailGoodsInfo from "./childComps/DetailGoodsInfo";
  import DetailParamInfo from "./childComps/DetailParamInfo";
  import DetailCommentInfo from "./childComps/DetailCommentInfo";

  import Scroll from "components/common/scroll/Scroll";
  import GoodsList from "components/content/goods/GoodsList";

  import {getDetail, GoodsInfo, Shop ,GoodsParam, getRecommend} from "network/detail";
  import {itemImageListenerMixin} from "common/mixin";

  export default {
    name: "Detail",
    components: {
      DetailNavBar,
      DetailSwiper,
      DetailBaseInfo,
      DetailShopInfo,
      DetailGoodsInfo,
      DetailParamInfo,
      DetailCommentInfo,
      Scroll,
      GoodsList
    },
    mixins: [itemImageListenerMixin],
    data() {
      return {
        iid: null,
        topImages: [],
        goods: {},
        shop: {},
        detailInfo: {},
        paramInfo: {},
        commentInfo: {},
        recommends: [],
        themeTopYs: [],
        currentIndex: 0
      }
    },
    created() {
      //1.保存传入的iid
      this.iid = this.$route.params.iid

      //2.根据iid获取详情数据
      getDetail(this.iid).then(res => {
        //1.获取顶部的图片轮播数据
        const data = res.result
        this.topImages = data.itemInfo.topImages

        //2.获取商品信息
        this.goods = new GoodsInfo(data.itemInfo, data.columns, data.shopInfo.services)

        //3.获取商家信息
        this.shop = new Shop(data.shopInfo)

        //4.获取商品的详细信息
        this.detailInfo = data.detailInfo

        //5.获取商品参数信息
        this.paramInfo = new GoodsParam(data.itemParams.info, data.itemParams.rule)

        //6.获取评论信息
        if(data.rate.cRate !== 0){
          this.commentInfo = data.rate.list[0]
        }

        // this.$nextTick(() => {
        //   //根据最新的数据，对应的DOM是已经被渲染完毕的
        //   //但是图片依然是没有加载完毕的(目前获取到的offsetTop不包含图片的)
        //   //offsetTop值不对的时候，都是因为图片的问题
        //   this.themeTopYs = []
        //
        //   this.themeTopYs.push(0)
        //   this.themeTopYs.push(this.$refs.paramInfo.$el.offsetTop)
        //   this.themeTopYs.push(this.$refs.commentInfo.$el.offsetTop)
        //   this.themeTopYs.push(this.$refs.recommends.$el.offsetTop)
        //
        //   console.log(this.themeTopYs);
        // })
      })

      //3.获取推荐数据
      getRecommend().then(res => {
        this.recommends = res.data.list
      })
    },
    mounted() {

    },
    updated() {

    },
    destroyed() {
      //取消全局事件的监听
      this.$bus.$off('itemImageLoad', this.itemImageListener)
    },
    methods: {
      imageLoad() {
        this.$refs.scroll.refresh()

        this.themeTopYs = []

        this.themeTopYs.push(0)
        this.themeTopYs.push(this.$refs.paramInfo.$el.offsetTop - 44)
        this.themeTopYs.push(this.$refs.commentInfo.$el.offsetTop - 44)
        this.themeTopYs.push(this.$refs.recommends.$el.offsetTop - 44)
        this.themeTopYs.push(Number.MAX_VALUE)

        console.log(this.themeTopYs);
      },
      titleClick(index) {
        this.$refs.scroll.scrollTo(0, -this.themeTopYs[index], 100)
      },
      contentScroll(position) {
        //1.获取y值
        const positionY = -position.y

        //2.positionY和主体中值进行对比
        let lenght = this.themeTopYs.length
        for (let i = 0; i < lenght-1; i++) {
          if(this.currentIndex !== i && (positionY >= this.themeTopYs[i] && positionY < this.themeTopYs[i+1])){
            this.currentIndex = i;
            this.$refs.detalNav.currentIndex = this.currentIndex

          }
        }
      }
    }
  }
</script>

<style scoped>
  #detail {
    position: relative;
    z-index: 9;
    background-color: #fff;
    height: 100vh;
  }

  .detail-nav {
    position: relative;
    z-index: 9;
    background-color: #fff;
  }

  .content {
    height: calc(100% - 44px);
  }
</style>
