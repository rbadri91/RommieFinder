var UpdatePosts = (function() {
	var oldLocation;
	var inputCount=1;
	var imageUrlLength =0;
	function handleEditLocation(){
		var location = document.getElementById("locationVal").textContent;
		oldLocation = location;
		document.getElementById("updateLocation").style.display = "block";
		document.getElementById("EditLocation").value = location;
		document.getElementById("locationDisplay").style.display="none";
	}

	function saveLocation(){
		var postType = document.getElementById("postType").getAttribute("value");
		var date=document.getElementById("date").textContent;
		var location = document.getElementById("EditLocation").value;
		$.ajax({
				type: "POST",
				url: "/saveLocation",
				data: {
					location:location,
					date:date,
					postType:postType,
					oldLocation:oldLocation
				},
				async: false,
				success: function(result) {
					document.getElementById("locationVal").textContent = location;
					cancelEditLocation();
					swal(
						'Success!',
						'Your Location has been saved!',
						'success'
					)
				},
				error: function(result) {
					swal(
					'Oops!',
					'There seems to have been an issue!',
					'error'
					)
				}
			});
	}

	function cancelEditLocation(){
		document.getElementById("locationDisplay").style.display="block";
		document.getElementById("updateLocation").style.display = "none";
	}

	function handleEditPostType(){
		var postType = document.getElementById("postType").getAttribute("value"); 
		document.getElementById("postInfo").style.display="none";
		document.getElementById("updatePostType").style.display="block";
		$('input[name=postType][value="' + postType + '"]').prop('checked', true);
	}

	function cancelEditPostType(){
		document.getElementById("postInfo").style.display="block";
		document.getElementById("updatePostType").style.display="none";
	}

	function savePostType(){
		var date=document.getElementById("date").textContent;
		var location = document.getElementById("locationVal").textContent;
		var postType = $('input[name="postType"]:checked').val();
		$.ajax({
				type: "POST",
				url: "/savePostType",
				data: {
					location:location,
					date:date,
					postType:postType,
				},
				async: false,
				success: function(result) {
					var postTypeDiv = document.getElementById("postType");
					postTypeDiv.setAttribute("value", postType);
					if(postType == "sublet"){
						postTypeDiv.textContent = "Looking for Subletter";

					}else{
						postTypeDiv.textContent = "Looking for Roomate";
					}
					
					cancelEditPostType();
					swal(
						'Success!',
						'Your Post Type has been changed!',
						'success'
					)
				},
				error: function(result) {
					swal(
					'Oops!',
					'There seems to have been an issue!',
					'error'
					)
				}
		});
	}

	function createFileUpload(){

		inputCount ++;
		var mainDiv=document.getElementById("updatePostsContainer");
		var wrapperDiv = document.createElement("div");
		wrapperDiv.className ="form-group text-center center-block";
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
		fileSelectText.style.width="30%";
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
		var number= id.substring(id.lastIndexOf("_")+1);
		document.getElementById("fileName_"+number).value = el.value;
		document.getElementById("uploadMore").style.display="block";
	}

	function getSignedRequest(file){
	      const xhr = new XMLHttpRequest();
	      console.log("name here:",file.name);
	      var  postReason = document.getElementById("postType").getAttribute("value");
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

	          	createimageWrapper(url);
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

	function createimageWrapper(srcURL){
		var containerDiv = document.getElementById("imageContainer");
		var imgTag = document.createElement("img");
		imgTag.className ="text-center center-block";
		imgTag.src = srcURL;
		imgTag.setAttribute("height","20%");
		imgTag.setAttribute("width","40%");
		imgTag.setAttribute("alt","Post Image");
		imgTag.style.display ="inline-block";
		imgTag.id ="imageEl_"+imageUrlLength;
		containerDiv.appendChild(imgTag);
		var inputTag = document.createElement("input");
		inputTag.setAttribute("type","checkbox");
		inputTag.id = "image_"+imageUrlLength;
		imageUrlLength ++;
		containerDiv.appendChild(inputTag);
	}

	function handleImageUpload(el){
		var id = el.id;
		var count = id.substring(id.lastIndexOf("_")+1);
		var files = document.getElementById('FileUpload_'+count ).files;
	    var file = files[0];
	    if(file == null){
	        return alert('No file selected.');
	    }
	    getSignedRequest(file);

	}

	function setImageURLLength(URLLength){
		imageUrlLength = URLLength;
	}

	 function updateContent(){
	 	var description = document.getElementById("postDesc").textContent;
	 	var editDesc = document.getElementById("postDescription");
	 		editDesc.value =description;
	 	document.getElementById("postDescr").style.display="none";
	 	var editDescWrapper = document.getElementById("editDescWrapper");
	 	editDescWrapper.style.display="block";	
	 }

	 function savePostContent(){
	 	var postContent = document.getElementById("postDescription").value;
	 	var descriptionDiv = document.getElementById("postDesc");
	 	var date = document.getElementById("date").textContent; 
	 	var postType = document.getElementById("postType").getAttribute("value");
	 	$.post( "/saveNewPostDesc", {postContent:postContent,date:date,postType:postType},function( data ) {
	 		descriptionDiv.textContent = postContent;
	 		cancelUpdate();
		});
	 }

	 function cancelUpdate(){
	 	document.getElementById("postDescr").style.display="block";
	 	document.getElementById("editDescWrapper").style.display="none";
	 }

	 function onDeleteImages(){
	 	var fileUrls=[];
	 	var fullFilePath =[];
	 	var removedIndex =[];
	 	var date = document.getElementById("date").textContent; 
	 	var postType = document.getElementById("postType").getAttribute("value");
	 	for(var i=0;i<imageUrlLength;i++){
	 		if(document.getElementById("imageEl_"+i)){
		 		var imgSrc = document.getElementById("imageEl_"+i).src;
		 		if(document.getElementById("image_"+i).checked){
		 			fullFilePath.push(imgSrc);
		 			var filePath =  imgSrc.substring(imgSrc.lastIndexOf(".com/")+5);
			 		console.log("filePath:",filePath);
			 		fileUrls.push(filePath);
			 		removedIndex.push(i);
		 		}
		 	}	
	 		
	 	}
	 	$.ajax({
				type: "POST",
				url: "/deleteImages",
				data: {
					filesArray:fileUrls,
					fullFilePath:fullFilePath,
					date:date,
					postType:postType
				},
				async: false,
				success: function(result) {
				var imageContainer = document.getElementById("imageContainer");
				for(var j=0;j<removedIndex.length;j++){
					var imgSrc = document.getElementById("imageEl_"+removedIndex[j]);
					imageContainer.removeChild(imgSrc);
					var checkbox = document.getElementById("image_"+removedIndex[j]);
					imageContainer.removeChild(checkbox);
				}
				 swal(
						'Success!',
						'The Images have been deleted successfully!',
						'success'
				    )
				},
				error:function(){
					swal(
						'Oops!',
						'There seems to have been an issue!',
						'error'
					)
				}
		});		
	 }


	return {
		handleEditLocation:handleEditLocation,
		handleFileUploadChange:handleFileUploadChange,
		handleImageUpload:handleImageUpload,
		onDeleteImages:onDeleteImages,
		saveLocation:saveLocation,
		cancelEditLocation:cancelEditLocation,
		handleEditPostType:handleEditPostType,
		cancelEditPostType:cancelEditPostType,
		savePostType:savePostType,
		cancelEditPostType:cancelEditPostType,
		handleImageUpload:handleImageUpload,
		handleFileUploadChange:handleFileUploadChange,
		createFileUpload:createFileUpload,
		auto_grow:auto_grow,
		setImageURLLength:setImageURLLength,
		updateContent:updateContent,
		savePostContent:savePostContent,
		cancelUpdate:cancelUpdate
	}
})();