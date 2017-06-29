var newPosts = (function() {
	var inputCount = 1;
	var postReason;
	var subletURL =[];
	var roommateURL =[];
	var tranformValue =-60;
	function handleButtonClick(el){
			if(el.id =="sublet"){
				postReason = "sublet";
				document.getElementById("loc").textContent="Where do you want to Sublet";
				document.getElementById("childandPets").style.display ="none";
			}else{
				document.getElementById("loc").textContent="Where do you stay";
				document.getElementById("childandPets").style.display ="block";
				postReason = "Roommate";
			}

	document.getElementById("uploadPosts").classList.remove("active");
	 $("#uploadPosts").toggleClass('active');			
	}

	function createFileUpload(){

		inputCount ++;
		var mainDiv=document.getElementById("uploadPosts");
		mainDiv.style.transform="translateY("+tranformValue+"%)";
		var wrapperDiv = document.createElement("div");
		wrapperDiv.className ="form-group";
		var fileInput = document.createElement("input");
		fileInput.type="file";
		fileInput.id="FileUpload_"+inputCount;
		fileInput.accept="image/*";
		fileInput.setAttribute("capture","camera");
		fileInput.style.display="none";
		fileInput.onchange = function(){
			console.log("it comes to onchange");
			handleFileUploadChange(this);
		};

		var fileInputLabel = document.createElement("label");
		fileInputLabel.className ="btn btn-default btn-file";
		fileInputLabel.setAttribute("for" ,"FileUpload_"+ inputCount);
		fileInputLabel.textContent = "Select Picture";

		var fileSelectText = document.createElement("input");
		fileSelectText.type ="text";
		fileSelectText.className="form-control center-block";
		fileSelectText.name ="fileName_"+inputCount;
		fileSelectText.id ="fileName_"+inputCount;
		fileSelectText.style.width="50%";
		fileSelectText.style.display="inline";
		var uploadButton = document.createElement("button");
		uploadButton.className = "btn btn-info";
		uploadButton.id ="Upload_"+ inputCount;
		uploadButton.onclick =function(){
			handleImageUpload(this);
		}
		uploadButton.textContent = "Upload Image";
		wrapperDiv.appendChild(fileInputLabel);
		wrapperDiv.appendChild(fileInput);
		wrapperDiv.appendChild(fileSelectText);
		wrapperDiv.appendChild(uploadButton);
		var breakDiv = document.createElement("br");
		mainDiv.insertBefore(wrapperDiv,document.getElementById("uploadMore"));
		mainDiv.insertBefore(breakDiv,document.getElementById("uploadMore"));
		inputCount ++;
	}

	function handleFileUploadChange(el){
		var id=el.id;
		if(inputCount==1) {
			tranformValue =20;
			document.getElementById("uploadPosts").style.transition ="initial";
			document.getElementById("uploadPosts").style.transform="translateY("+tranformValue+"%)";
		}
		var number= id.substring(id.lastIndexOf("_")+1);
		document.getElementById("fileName_"+number).value = el.value;
		document.getElementById("uploadMore").style.display="block";
	}

	function getSignedRequest(file){
	      const xhr = new XMLHttpRequest();
	      console.log("name here:",file.name);
	      var fileName= file.name;
	      var filePath=postReason+"/"+fileName;
	      console.log("filePath:",filePath);
	      xhr.open('GET', `/sign-s3?file-name=${filePath}&file-type=${file.type}`);
	      xhr.responseType ="text";
	      xhr.onreadystatechange = () => {
	        if(xhr.readyState === 4){
	          if(xhr.status === 200){
	            var response = JSON.parse(xhr.response);
	            uploadFile(file, response.signedRequest, response.url);
	          }
	          else{
	            alert('Could not get signed URL.');
	          }
	        }
	      };
	      xhr.send();
	}

	function auto_grow(element) {
		    element.style.height = "5px";
		    element.style.height = (element.scrollHeight)+"px";
	}

	function uploadFile(file, signedRequest, url){
	      var xhr = new XMLHttpRequest();
	      xhr.open('PUT', signedRequest);
	      xhr.onreadystatechange = () => {
	        if(xhr.readyState === 4){
	          if(xhr.status === 200){
	          if(postReason =="sublet"){
	          		subletURL.push(url);
	          }else{
	          		roommateURL.push(url);
	          }
	          	
	          swal(
						'Success!',
						'Your changes have been saved!',
						'success'
				  )
	          }
	          else{
	            alert('Could not upload file.');
	          }
	        }
	      };
	      xhr.send(file);
	}

	function handleImageUpload(el){
		var id = el.id;
		var count = id.substring(id.lastIndexOf("_")+1);
		console.log("count here:",count);
		var files = document.getElementById('FileUpload_'+count ).files;
	    var file = files[0];
	    if(file == null){
	        return alert('No file selected.');
	    }
	    getSignedRequest(file);

	}

	function handlePostClick(){
		var location = document.getElementById("autocomplete2").value;
		var apartmentDescription = document.getElementById("apartmentDesc").value;
		var price = document.getElementById("Price").value;
		var roomType = document.getElementById("RoomNo").value;
		var pets,children;

		if(location==""){
			swal(
				  'Oops...',
				  'You forgot to metion your Location!',
				  'error'
			)
			return;
		}else if(apartmentDescription ==""){
			swal(
				  'Oops...',
				  'You forgot to Describe your apartment!',
				  'error'
			)
			return;
		}else if(price==""){
			swal(
				  'Oops...',
				  'You forgot to Mention the price!',
				  'error'
			)
			return;
		}
		else if(roomType=="0"){
			swal(
				  'Oops...',
				  'You forgot to Select the room type!',
				  'error'
			)
			return;
		}

		var postDesc={"location":location,"desc":apartmentDescription,"postReason":postReason,"price":price,"roomType":roomType};
		if(postReason =="sublet"){
			postDesc["urls"]=subletURL;
		}else{
			postDesc["urls"]=roommateURL;
		}
		if(postReason =="Roommate"){
			pets = document.getElementById("hasPets").value;
			children = document.getElementById("hasChildrens").value;
			postDesc["pets"]=pets;
			postDesc["children"]=children;
		}
		$.ajax({
				type: "POST",
				url: "/createNewPost",
				data: {
					postDesc: postDesc
				},
				async: false,
				success: function(result) {
					swal({
						title:'Success!',
						text:'Your Post has been created!',
						type:'success'
					},function() {
			            window.location = "/";
			        });
				},
				error: function(result) {
					alert('error');
				}
			});
	}
	return {
		handleButtonClick:handleButtonClick,
		createFileUpload:createFileUpload,
		handleFileUploadChange:handleFileUploadChange,
		getSignedRequest:getSignedRequest,
		auto_grow:auto_grow,
		uploadFile:uploadFile,
		handleImageUpload:handleImageUpload,
		handlePostClick:handlePostClick
	}
})();	