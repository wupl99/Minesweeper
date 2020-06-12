<template>
  <el-container>
    <el-header>
       <game-control @startGame="clickStartGame" :residueData="residueDataFormIndex" :timerData="timerDataFormIndex"></game-control>
    </el-header>
    <el-main>
      <game-main :gameData="gameDataFromIndex"  @residue="bombResidue" @timer="GameTimer"></game-main>
    </el-main>
  </el-container>
</template>

<script>
import gameControl from '@/views/components/gameControl';
import gameMain from '@/views/components/gameMain';

export default {
  name: 'App',
  data(){//储存数据
    return {
      gameDataFromIndex: {},
      residueDataFormIndex: {},
      timerDataFormIndex: {},
    };
  },
  methods: {//储存方法
    clickStartGame(params){
      console.log(params,123);
      this.gameDataFromIndex = params;
    },
    bombResidue(params){
      console.log(params,params.flag,'flag即炸弹剩余量');
      this.residueDataFormIndex = params;
    },
    GameTimer(params){
      this.timerDataFormIndex = params;
    },
  },
  components: {//注册组建
    gameControl,
    gameMain,
  },
}
</script>

<style lang="scss">
.el-header{
  display: flex;
  background: #ccc;
  align-items: center;
  justify-content: center;
}
</style>
