var Preferences = (function() {
	function SavePreferences(){
		var sleepTime = document.getElementById("sleep").value;
		var wakeupTime =  document.getElementById("wakeUp").value;
		var acceptVisitor = document.getElementById("VisitorsComfort").value;
		var listenMusic = $("#music").prop('checked');
		console
		var smoke = $("#smoke").prop('checked');
		var roomClean = document.getElementById("roomClean").value;
		var share = $("#share").prop('checked');;
		$.ajax({
			type: "POST",
			url: "/savePreference",
			data: {
				sleepTime: sleepTime,
				wakeupTime: wakeupTime,
				acceptVisitor: acceptVisitor,
				listenMusic: listenMusic,
				smoke: smoke,
				roomClean: roomClean,
				share: share
			},
			async: true,
			success: function(result) {
				swal(
					'Success!',
					'Your changes have been saved!',
					'success'
					)
			},
			error: function(result) {
			}
		});
	}

	function ResetPreferences(){

	}

	return {
		SavePreferences:SavePreferences,
		ResetPreferences:ResetPreferences
	}
})();	