var d = document,
	log = d.getElementById('log'),
	command = d.getElementById('command'),
	result = d.getElementById('result'),
	execButton = d.getElementById('exec'),
	reqBody = {}, 
	xhr,
	modCommand,
	results = [],
	tableList = d.getElementById('table-list'),
	auto = d.getElementById('auto'),
	manual = d.getElementById('manual');

var onChange = function(e){
	console.log(e);
}

manual.addEventListener('change',onChange);
auto.addEventListener('change',onChange);

execButton.addEventListener('click', function(e) {
	e.preventDefault();
	execButton.innerHTML = 'Loading...';
	execButton.disabled = true;
	var tempCom = command.value;
	modCommand = tempCom;
	if (manual.checked){
		if (tempCom.toLowerCase().indexOf('from') == -1){
			modCommand = tempCom + '\nfrom ' + d.querySelector( "#table-list option:checked" ).innerHTML;
		}
	}

	xhr = new XMLHttpRequest();
	xhr.open('POST', '/mysql', true);
	xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	xhr.onreadystatechange = function() {
	if (xhr.readyState != 4) return;
	execButton.innerHTML = "Execute";
	execButton.disabled = false;	
	time = (new Date()).toISOString();
	log.value += time + ': \n' + xhr.status + ': ' + xhr.statusText + '\n' + modCommand + '\n';
	if (xhr.status == 200) {
		results = JSON.parse(xhr.responseText);
		while (result.firstChild) {
			result.removeChild(result.firstChild);
		}
		if (!results.length) {
			return;
		}
		var thead = d.createElement('thead');
		var tr = d.createElement('tr');
		for (var h in results[0]){
			var th = d.createElement('th');
			th.innerHTML = h;
			tr.appendChild(th);
		}
		thead.appendChild(tr);
		result.appendChild(thead);
		var tbody = d.createElement('tbody');
		for (var i = 0; i < results.length; i++) {
			var tr = d.createElement('tr');
			for (var name in results[i]){
				var td = d.createElement('td');
				td.innerHTML = results[i][name];
				tr.appendChild(td);
				}
			tbody.appendChild(tr);
			}
		}
		result.appendChild(tbody);
	}
	reqBody = {};
	reqBody.command = modCommand;
	xhr.send(JSON.stringify(reqBody));
});

var getTablesXhr = new XMLHttpRequest();
getTablesXhr.open('POST', '/mysql', true);
getTablesXhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
getTablesXhr.onreadystatechange = function() {
	if (getTablesXhr.readyState != 4) return;
	if (getTablesXhr.status == 200) {
		var arr = JSON.parse(getTablesXhr.responseText);
		for (var i = 0; i < arr.length; i++) {
			var opt = d.createElement('option');
			opt.value = i;
			opt.innerHTML = arr[i]["Tables_in_mydb"];
			tableList.appendChild(opt);
		
		}
	}
}
reqBody = {};
reqBody.command = 'show tables';
getTablesXhr.send(JSON.stringify(reqBody));