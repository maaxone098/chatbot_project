function dispReg(){
    
  document.getElementById('register').style.display = 'block';
  document.getElementById('login').style.display = "none";
}

function dispLog(){
  
document.getElementById('register').style.display = "none";
document.getElementById('login').style.display = 'block';
}
function dispLogin(){
  if(document.getElementById('login').style.display = 'none'){
      document.getElementById('login').style.display = 'block';
      document.getElementById('register').style.display = 'none';
  }
}

// const myInput = document.getElementById("myInput");
// const disp = document.getElementById('pas');
// disp.addEventListener('click', ()=>{
//   if (myInput.type === "password") {
//     myInput.type = "text";
//   } else {
//     myInput.type = "password";
//   }
// });

function showPass() {
  var x = document.getElementById("myInput");
  if (x.type === "password") {
    x.type = "text";
  } else {
    x.type = "password";
  }
}

function showPass() {
  var x = document.getElementById("myInput2");
  if (x.type === "password") {
    x.type = "text";
  } else {
    x.type = "password";
  }
}