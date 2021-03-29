import {debounce} from "common/utils";

export const itemImageListenerMixin = {
  data() {
    return {
      itemImageListener: null
    }
  },
  mounted() {
    //1.图片加载完成的事件监听
    const refresh = debounce(this.$refs.scroll.refresh, 100)

    this.itemImageListener = () => {
      refresh()
    }
    this.$bus.$on('itemImageLoad', this.itemImageListener)
    console.log('我是混入后的内容');
  }
}
