<template>
  <div class="game-main" :style="{ width: wh*gameData.width+'px'}" v-if="total && total!=0 && arr.length != 0">
    <span v-for="item in total" :class="{ blue:( coordinateSpan(item).type == 4 || coordinateSpan(item).type == 5 ||coordinateSpan(item).type == 6 ), white:( coordinateSpan(item).type == 1 || coordinateSpan(item).type == 2 ||coordinateSpan(item).type == 3), disabled:( isOver ) }" @mousedown="mousedownFun($event,coordinateSpan(item))">
      <i class="el-icon-setting bomb" v-if="coordinateSpan(item).type == 3"></i>
      <i class="fa fa-flag flag" v-if="coordinateSpan(item).type == 5"></i>
      <i class="fa fa-question question" v-if="coordinateSpan(item).type == 6"></i>
      {{ coordinateSpan(item).type == 2 ? coordinateSpan(item).value : '' }}
    </span>
  </div>
</template>

<script>

export default {
  props: {
    gameData: {//定义一个父传子的变量名,父传子数据
      type: Object,
      default(){
        return {
          width: 0,
          height: 0,
          bombCount: 0,
        }
      }
    },
  },
  data(){//储存数据
    return {
      wh: 25,//一个格子宽高
      arr: [],//二维数组，一个元素对应一个span对象
      /*  
      [
        [{},{},{}],
        [{},{},{}],
        [{},{},{}],
      ]
      */
      flagData:{
        flag: 0,
      },
      timeData:{
        time: 0,
      },
      timeID: 0,
      isWin: false,
      isOver: false,
      isFirstClick: true,
    };
  },
  methods: {//储存方法
    coordinateSpan(item){//返回当前span对象的坐标
      var x = (item - 1) % this.gameData.width;
      var y = Math.floor((item - 1) / this.gameData.width);
      return this.arr[y][x];
    },
    mousedownFun(e,data){
      if(this.isFirstClick){
        this.isFirstClick = false;
        this.timeID = setInterval(this.setCount,1000);
        this.$emit('timer',this.timeData);//通过$emit实现子传父
      }      
      var button = e.button;
      if(button <= 1){//左键（翻开动作）
        var x = data.x;
        var y = data.y;
        this.recursionFun({
          x,
          y
        },true);
        var notOpenNum = this.winFun();
        if(notOpenNum == this.gameData.bombCount){
          this.isWin = true;
          this.setStop(this.timeID);
          this.gameOver();
        }
      }
      else if(button == 2){//右键（探测、问号）
        /**/
        if(data.type == 4 || data.type == 5 || data.type == 6){
          if(data.type == 6){
            data.type = 4;
          }
          else{            
            if(data.type == 4){//蓝空白变棋子
              if(this.flagData.flag == this.gameData.bombCount){
                alert('旗不能超过雷数量！');
              }
              else{
                data.type++;
                this.flagData.flag++;               
              }
            }
            else{
              data.type++;
              this.flagData.flag--;
            }
            let bombData = JSON.parse(JSON.stringify(this.flagData));//JSON.stringify将对象转换为字符串
            bombData.flag = this.gameData.bombCount - bombData.flag;
            this.$emit('residue',bombData);//通过$emit实现子传父,传给index.vue
          }         
        }
      }
    },
    recursionFun(coordinate,bool){//对当前坐标的span的周围做判断
      var x = coordinate.x;
      var y = coordinate.y;
      var data = this.arr[y][x];
      if(data.type == 4 || data.type == 6){//判断是否为蓝空白 问号
        if(bool){//如果是当前点击的span
          if(data.isBomb){//点中雷
            data.type = 3;
            /**/
            this.findBomb();            
            this.setStop(this.timeID);           
            this.gameOver();
            document.getElementsByTagName('span').onclick = null;      
            return;
          }
          else{//判断周围八个
            var count = this.countFun(x,y);
            if(count == 0){
              data.type = 1;
              //周边八个span
              for(var c_x = x-1; c_x <= x + 1; c_x++){
                for(var c_y = y-1; c_y <= y + 1; c_y++){
                  if( ( c_x != x || c_y != y ) && c_x >= 0 && c_y >= 0 && this.arr[c_y] != null && this.arr[c_y][c_x] != null && this.arr[c_y][c_x].isBomb == false){
                    this.recursionFun({
                      x: c_x,
                      y: c_y
                    })
                  }
                }
              }
              
            }
            else{
              data.type = 2;
              data.value = count;
            }
          }
        }
        else{
          var count = this.countFun(x,y);
          if(count == 0){
            data.type = 1;
            //周边八个span
            for(var c_x = x-1; c_x <= x + 1; c_x++){
              for(var c_y = y-1; c_y <= y + 1; c_y++){
                if( ( c_x != x || c_y != y ) && c_x >= 0 && c_y >= 0 && this.arr[c_y] != null && this.arr[c_y][c_x] != null && this.arr[c_y][c_x].isBomb == false){
                  this.recursionFun({
                    x: c_x,
                    y: c_y
                  })
                }
              }
            }
            
          }
          else{
            data.type = 2;
            data.value = count;
          }
        }
        
      }
    },
    countFun(x,y){//统计当前span的雷量
      var count = 0;
      for(var c_x = x-1; c_x <= x + 1; c_x++){
        for(var c_y = y-1; c_y <= y + 1; c_y++){
          if( ( c_x != x || c_y != y ) && c_x >= 0 && c_y >= 0 && this.arr[c_y] != null && this.arr[c_y][c_x] != null && this.arr[c_y][c_x].isBomb){
            count++;
          }
        }
      }
      return count;
    },
    findBomb(){
      for(var i = 0; i < this.gameData.width; i++){
        for(var j = 0; j < this.gameData.height; j++){
          if(this.arr[j][i].isBomb == true){
            this.arr[j][i].type = 3;
          }
        }
      }
    },
    winFun(){
      var count = 0;
      for(var i = 0; i < this.gameData.width; i++){
        for(var j = 0; j < this.gameData.height; j++){
          if(this.arr[j][i].type == 4 || this.arr[j][i].type == 5 || this.arr[j][i].type == 6){
            count++;
          }
        }
      }
      return count;
    },
    gameOver(){
      this.isOver = true;
      this.$alert(`游戏 ${this.isWin ? '获胜' : '失败'},耗时 ${this.timeData.time}s,开始新游戏！`,'游戏结束',{
        confirmButtonText: '确定',
      });
    },
    setCount(){
      this.timeData.time++; 
    },
    setStop(id){
      clearInterval(id);
    },
  },
  computed: {//计算属性
    total(){//span总量
      return this.gameData.width*this.gameData.height;
    },
  },
  watch: {//监听
    total(newval,oldval){
      var arr = [];
      for(var y=0; y<this.gameData.height; y++){
        arr.push([]);
        for(var x = 0; x<this.gameData.width; x++){
          arr[y].push({
            type: 4,//当前的值,此值翻开三种情况：空白1，数字2，表示雷3；此值未翻开三种情况,蓝空白4,探测5，问号6
            value: null,//type == 2时，才有此值，表示 周边雷的数量
            isBomb: false,
            x,//当前数据所在的坐标
            y,
          });
        }
      }

      var coordinateArr = [];
      for(var i = 0; i < newval; i++){
        var x = i % this.gameData.width;
        var y = Math.floor( i / this.gameData.width );
        coordinateArr.push({ x,y });
      };

      for(var j = 0; j < this.gameData.bombCount; j++){
        var pos = Math.floor( coordinateArr.length * Math.random() );//随机位置0~coordinateArr.length-1
        var x = coordinateArr[pos].x;
        var y = coordinateArr[pos].y;
        
        coordinateArr.splice(pos,1);
        arr[y][x].isBomb = true;
      }

      this.arr = arr;
      console.log(arr)
    },
  },
  components: {//注册组建
    
  },
}
</script>

<style lang="scss">
.game-main{
  display: flex;
  flex-flow: wrap;
  margin: 0 auto;
  span{
    display:flex;
    justify-content: center;
    align-items: center;
    width: 25px;
    height: 25px;
    border: 1px solid #333;
    box-sizing: border-box;   
  }
  .blue{
    background: #0066ff;
  }
  .white{
    background:#fff;
  }
  .bomb{
    color: #000;
  }
  .flag{
    color: red;
  }
  .question{
    color: #fff;
  }
  .disabled{ 
    pointer-events: none; 
  }  
}
</style>
