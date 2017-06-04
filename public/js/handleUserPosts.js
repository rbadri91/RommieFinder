var userPosts = (function() {
	function handleViewPostClick(el){
		var id = el.id;
		console.log("id here:",id);
		var num = parseInt(id.substring(id.lastIndexOf("_")+1));
		console.log("num here:",num);
		var posts =<%- JSON.stringify(posts)%>
		var post= posts[num];
		$.ajax({
			type:"POST",
			url: "/viewFullPost",
			data:{post:post},
			datatype: "JSON",
	      	async: true,
	      	success:function(result){
	      		location.href ="/viewFullPost";
	      	},
	      	error: function(result) {
		        alert('error');
		    }
		})
	}
	function handleDeletePostClick(el){
		var id = el.id;
		console.log("id here:",id);
		var fileUrls=[];
		var num = parseInt(id.substring(id.lastIndexOf("_")+1));
		var posts =<%- JSON.stringify(posts)%>
		var post= posts[num];

		var imageUrl = post.imageUrl;
		for(var i=0;i<imageUrl.length;i++){
			var filePath =  imageUrl[i].substring(imageUrl[i].lastIndexOf(".com/")+5);
			console.log("filePath:",filePath);
			fileUrls.push(filePath);
		}
		console.log("fileUrls:",fileUrls)
		console.log("post here:",post);
		var postType =post.postType;
		var postLocation =post.postLocation;
		$.ajax({
			type:"POST",
			url: "/deletePost",
			data:{postType:postType,postLocation:postLocation,fileUrls:fileUrls},
			datatype: "JSON",
	      	async: true,
	      	success:function(result){
	      		var postWrapper = document.getElementById("postWrapper_"+num);
	      		var postsContainer = document.getElementById("postsContainer");
	      		postsContainer.removeChild(postWrapper);
	      	},
	      	error: function(result) {
		        alert('error');
		    }
		})

	}
	return {
		handleViewPostClick:handleViewPostClick,
		handleDeletePostClick:handleDeletePostClick
	}
})();	