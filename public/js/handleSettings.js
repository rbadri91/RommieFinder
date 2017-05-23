var Settings = (function() {
	function handleEditName() {
		console.log("it comes inside");
		var nameVal = document.getElementById("nameVal").textContent;
		nameVal= nameVal.trim();
		$("#nameSetInfo").toggle();
		$("#editName").toggle();
		var nameArray = nameVal.split(" ");
		document.getElementById("EditFirstName").value = nameArray[0];
		document.getElementById("EditLastName").value = nameArray[1];
	}
	function saveName(){
		var firstNameInfo = document.getElementById("EditFirstName").value;
		var lastNameInfo = document.getElementById("EditLastName").value;
		$.ajax({
			type: "POST",
			url: "/saveName",
			data: {
				firstName: firstNameInfo,
				lastName: lastNameInfo
			},
			async: false,
			success: function(result) {
				document.getElementById("nameVal").textContent = firstNameInfo +" "+lastNameInfo;
				cancelName();
			},
			error: function(result) {
				alert('error');
			}
		});
	}

	function cancelName() {
		$("#editName").toggle();
		$("#nameSetInfo").toggle();

	}

	function cancelEmail() {
		$("#editEmails").toggle();
		$("#emailInfo").toggle();

	}

	function handleEditEmail(){
		var corresEmailVal="";
		if(document.getElementById("corresEmailVal")) {
			corresEmailVal =document.getElementById("corresEmailVal").textContent;
		}
		$("#emailInfo").toggle();
		$("#editEmails").toggle();
		document.getElementById("editCorresEmail").value = corresEmailVal;
	}

	function saveCorresEmail(){
		var correspondanceEmail= document.getElementById("editCorresEmail").value;
		$.ajax({
			type: "POST",
			url: "/saveCorresEmail",
			data: {
				corresEmail:correspondanceEmail
			},
			async: false,
			success: function(result) {
				// document.getElementById("addressVal").textContent = addressInfo;
				cancelEmail();
				if(!document.getElementById("CorrespondanceEmailVal")){
					createCorresDivContainer(correspondanceEmail);
				}else{
					document.getElementById("corresEmailVal").value =correspondanceEmail;
				}
			},
			error: function(result) {
				alert('error');
			}
		});
	}

	function handleUpdatePassword(){
		$("#passwordInfo").toggle();
		$("#editPassword").toggle();
	}

	function saveNewPassword(){
		var oldPassword= document.getElementById("oldPassword").value;
		var newPassword= document.getElementById("newPassWord").value;
		console.log("oldPassword:",oldPassword)
		console.log("newPassword:",newPassword)
		$.ajax({
			type: "POST",
			url: "/updatePassword",
			data: {
				newPassword:newPassword,
				oldPassword:oldPassword
			},
			async: false,
			success: function(result) {
				cancelEditPassword();
			},
			error: function(result) {
				console.log(result);
				alert("Oops!! Wrong password");
			}
		});
	}

	function cancelEditPassword(){
		document.getElementById("oldPassword").value="";
		document.getElementById("newPassWord").value="";
		document.getElementById("verifyNewPassWord").value="";
		$("#passCorrect").toggle();
		$("#passInCorrect").toggle();
		$("#divCheckPasswordMatch").toggle();
		$("#passwordInfo").toggle();
		$("#editPassword").toggle();
	}

	function validatePassword() {
		var password = $("#newPassWord").val();
		var confirmPassword = $("#verifyNewPassWord").val();

		if (password == "")
			return false;

		if (password != confirmPassword) {
			$('#passInCorrect').css("display", "inline");
			$('#passCorrect').css("display", "none");
			$("#divCheckPasswordMatch").html("Passwords do not match");
			return false;
		} else {
			$('#passCorrect').css("display", "inline");
			$('#passInCorrect').css("display", "none");
			$("#divCheckPasswordMatch").html("Passwords match.");
			return true;
		}

	}
	function handleUpdateDOB(){
		$("#dobInfo").toggle();
		$("#editDOBField").toggle();
	}

	function saveNewDOB(){
		var newDOB= document.getElementById("newdob").value;
		$.ajax({
			type: "POST",
			url: "/updateDOB",
			data: {
				newDOB:newDOB
			},
			async: false,
			success: function(result) {
				document.getElementById("dobVal").textContent = newDOB;
				cancelEditDOB();
			},
			error: function(result) {
				console.log(result);
			}
		});
	}

	function cancelEditDOB(){
		$("#dobInfo").toggle();
		$("#editDOBField").toggle();
	}

	function handleUpdateGender(){
		$("#genderInfo").toggle();
		$("#editGenderField").toggle();
	}

	function saveNewGender(){
		var genderNo= document.getElementById("genderButton").value;
		var gender;
		if(genderNo ==1){
			gender="Male"
		}else{
			gender="Female"
		}
		$.ajax({
			type: "POST",
			url: "/updateGender",
			data: {
				gender:gender
			},
			async: false,
			success: function(result) {
				document.getElementById("genderVal").textContent = gender;
				handleUpdateGender();
			},
			error: function(result) {
				console.log(result);
			}
		});
	}

	function handleUpdateContact(){
		var contactVal = document.getElementById("contactVal").textContent;
		document.getElementById("newContact").value=contactVal;
		$("#contactInfo").toggle();
		$("#editContactField").toggle();
	}

	function saveNewContact(){
		var newContact= document.getElementById("newContact").value;
		$.ajax({
			type: "POST",
			url: "/updateContact",
			data: {
				contactNo:newContact
			},
			async: false,
			success: function(result) {
				document.getElementById("contactVal").textContent = newContact;
				cancelEditContact();
			},
			error: function(result) {
				console.log(result);
			}
		});
	}

	function cancelEditContact(){
		$("#contactInfo").toggle();
		$("#editContactField").toggle();
	}


	function createCorresDivContainer(correspondanceEmail) {
		var corresEmailContainer = document.createElement("div");
		corresEmailContainer.id = "CorrespondanceEmailVal";
		var colDiv = document.createElement("div");
		colDiv.className = "col-sm-3";
		var strongDiv = document.createElement("strong");
		strongDiv.textContent = "Correspondance Email";
		colDiv.appendChild(strongDiv);
		corresEmailContainer.appendChild(colDiv);
		var corresEmailVal = document.createElement("div");
		corresEmailVal.id = "corresEmailVal";
		corresEmailVal.className = "col-sm-7";
		corresEmailVal.textContent = correspondanceEmail;
		corresEmailContainer.appendChild(corresEmailVal);
		document.getElementById("emailInfo").appendChild(corresEmailContainer);
	}
	return {
		handleEditName:handleEditName,
		saveName:saveName,
		cancelName:cancelName,
		handleEditEmail:handleEditEmail,
		saveCorresEmail:saveCorresEmail,
		cancelEmail:cancelEmail,
		handleUpdatePassword:handleUpdatePassword,
		saveNewPassword:saveNewPassword,
		cancelEditPassword:cancelEditPassword,
		validatePassword:validatePassword,
		handleUpdateDOB:handleUpdateDOB,
		saveNewDOB:saveNewDOB,
		cancelEditDOB:cancelEditDOB,
		handleUpdateGender:handleUpdateGender,
		saveNewGender:saveNewGender,
		handleUpdateContact:handleUpdateContact,
		saveNewContact:saveNewContact,
		cancelEditContact:cancelEditContact
	}
})();