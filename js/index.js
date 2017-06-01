var d = document,
log = d.getElementById('log'),
result = d.getElementById('result'),
execButton = d.getElementById('exec'),
reqBody = {},
xhr,
modCommand,
results = [],
tableList = d.getElementById('table-list')

var app = new Vue({
	el: '#app',
	data: {
		selectedTable: "",
		cols: [],
		tables: [],
		headers:[],
		rows:[],
		requests: []
	},
	methods: {
		execute: function() {
			executeCom(getCom());
		},
		reexec: function(req) {
			executeCom(req.command);
		}
	},
	watch: {
		selectedTable: function (val) {
			getColumns();
		}
	}
});

function getCom(){
	execButton.innerHTML = 'Loading...';
	execButton.disabled = true;
	var select = "",
	where = "",
	col = {},
	exp,
	colName,
	hasCols = false,
	hasConds = false;
	for (var prop in app.cols) {
		col = app.cols[prop];
		if (col.active) {
			colName = col.name.trim();
			if (!hasCols) {
				hasCols = true;
				select += "select " + colName;
			} else {
				select += ", " + colName;
			}
			if (exp = col.whereExp) {
				if (!hasConds) {
					hasConds = true;
					where += "where (" + colName +" "+ exp.trim() + ")";
				} else {
					where += " AND (" + exp.trim() + ")";
				}
			}
		}
	}
	modCommand = select + " from " + app.selectedTable + " " + where;
	return modCommand;
}
function executeCom(modCommand) {
	xhr = new XMLHttpRequest();
	xhr.open('POST', '/mysql', true);
	xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	xhr.onreadystatechange = function() {
		if (xhr.readyState != 4) return;
		execButton.innerHTML = "Execute";
		execButton.disabled = false;
		time = (new Date()).toISOString();
		var req = {
			time: time,
			status: xhr.status,
			statusText: xhr.statusText,
			command: modCommand
		};
		req.text = time + ': \n' + xhr.status + ': ' + xhr.statusText + '\n' + ' | ' + modCommand + '\n';
		app.requests.push(req);
		if (xhr.status == 200) {
			results = JSON.parse(xhr.responseText);
			app.headers = Object.keys(results[0]);
			app.rows = results;
		}
	}
	reqBody = {};
	reqBody.command = modCommand;
	xhr.send(JSON.stringify(reqBody));
}


reqBody = {};
var getTablesXhr = new XMLHttpRequest();
getTablesXhr.open('POST', '/mysql', true);
getTablesXhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
reqBody.command = 'show tables';
getTablesXhr.send(JSON.stringify(reqBody));
getTablesXhr.onreadystatechange = function() {
	if (getTablesXhr.readyState != 4) return;
	if (getTablesXhr.status == 200) {
		var arr = JSON.parse(getTablesXhr.responseText);
		for (var i = 0; i < arr.length; i++) {
			app.tables.push(arr[i]["Tables_in_mydb"]);
		}
	}
}

function getColumns(){
	reqBody = {};
	app.cols = [];
	var getColumnsXhr = new XMLHttpRequest();
	getColumnsXhr.open('POST', '/mysql', true);
	getColumnsXhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	reqBody.command = 'show columns from ' + app.selectedTable;
	getColumnsXhr.send(JSON.stringify(reqBody));
	getColumnsXhr.onreadystatechange = function() {
		if (getColumnsXhr.readyState != 4) return;
		if (getColumnsXhr.status == 200) {
			var arr = JSON.parse(getColumnsXhr.responseText);
			for (var i = 0; i < arr.length; i++) {
				app.cols.push({name: arr[i].Field, active: false});
			}
		}
	}
}
