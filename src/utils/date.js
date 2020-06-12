export function timer(){
  var timecount = 0;
  function setcount(){
    /*document.getElementById("time").value =timecount;*/
    timecount++;    
  }
  var time = setInterval("setcount()",1000);
  function setstop(){
    clearInterval(time);
  }
};