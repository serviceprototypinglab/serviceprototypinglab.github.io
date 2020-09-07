function openModel(evt, modelName) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(modelName).style.display = "block";
  evt.currentTarget.className += " active";
}
function addCustom() {
  var cc = document.getElementById("customcheck");
  var custom = document.getElementById("Custom");
  if(cc.checked){
    custom.style.display = "block";
  }else{
    custom.style.display = "none";
  }
}
function ischecked(name){
  return document.getElementsByName(name)[0].checked;
}
function tavalue(name){
  return document.getElementsByName(name)[0].value;
}
function log(s){
  var dp = document.getElementById("deploymentplan");
  if(!s){
    dp.value = "";
  }else{
    dp.value += "\n\n";
    dp.value += s;
  }
}
async function generatePlan() {
  var resp = document.getElementById("Response");
  resp.style.display = "block";
  log(null);

  coa = document.getElementById("Composition").style.display == "block";
  wfa = document.getElementById("Workflow").style.display == "block";
  if((!coa) && (!wfa)){
    log("Must select either composition or workflow.");
    return;
  }

  lat = ischecked("goal_lat");
  mem = ischecked("goal_mem");
  dur = ischecked("goal_dur");
  var prefs = {"latency": lat, "memory": mem, "duration": dur};

  gcf = ischecked("resource_gcf");
  gcr = ischecked("resource_gcr");
  aws = ischecked("resource_lambda");
  var provs = {"gcf": gcf, "gcr": gcr, "awslambda": aws};

  co = tavalue("composition");
  wf = tavalue("workflow");
  ap = null;
  if(!coa){
    //co = null;
    // TODO extend here to support further languages
    try{
      ap = JSON.parse(wf);
    }catch{
      ap = wf;
    }
  }
  if(!wfa){
    //wf = null;
    // TODO extend here to support further languages
    try{
      ap = JSON.parse(co);
    }catch{
      ap = co;
    }
  }

  cuscheck = document.getElementById("customcheck").checked;
  if(cuscheck){
    cus = tavalue("custom");
  }else{
    cus = null;
  }
  var msg = {"preferences": prefs, "customresources": cus, "autoresources": provs, "application": ap};
  log("Sending request...");
  log(JSON.stringify(msg));

  log("(Waiting for DPGaaS response...)");
  //await new Promise(r => setTimeout(r, 1000));
  var xhr = new XMLHttpRequest();
  xhr.onload = () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      var response = JSON.parse(xhr.responseText);
      //dp.value = response;
      log("Response received.")
      log(xhr.responseText);
    }else{
      log("DPGaaS reachable but not working.");
    }
  }
  xhr.onerror = () => {
    log("DPGaaS not reachable.");
  }
  // + "customresources": {"res1": ...}
  //var req = {
  //  "autoresources": ["awslambda", "gcf"],
  //  "application": {"func A": {"mem": 200, "runtime": "java", "timeout": 600}, "func B": {"mem": 90, "runtime": "go", "timeout": 200}}
  //};
  var req = msg;
  //xhr.open('POST', 'http://localhost:8080/');
  xhr.open('POST', 'http://160.85.252.148:10080/');
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify(req));
}
