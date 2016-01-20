function start(){
	test_dialog = new Dialog({title: 'test title'});
	test_dialog.showDialog();
	html = '<button onClick="skriv_i_db()">skriv</button>';
	test_dialog.addContentHTML(html);
	
	
}
function skriv_i_db(){
		var params = {
			name: 'test_name',
			id: 9,
			page: 'mag_write'
		};
		
		var url = cbKort.getUrl(params);
		var request = new CBhttp();
		request.executeUrl(url);
	}