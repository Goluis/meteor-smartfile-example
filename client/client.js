sf = new SmartFile({
	publicRootUrl: "https://file.ac/XXXXXXXXXXXX"
});

// I recommend you open the console to see logs

Meteor.subscribe('smartfile');

Template.smartfile.events({
	'change #files': function (e) {
		var file = e.target.files[0];
		if(file) {
			sf.preview(file, function (data) {
				if(data) {
					$('#preview-images').html('<img src="' + data.src + '"> ' + data.width +'x' + data.height + ' ' + data.size + ' ' + data.type + ' ' + data.name + '<br>');
					// controller only save a file, upload more than one file erases the previous
					sf.upload(file, 'photo', function (error, res) {
						if(error) {
							console.log("error uploading the file", error);
							$('#preview-images').html('');
							return;
						}
						console.log("File uploaded, the path is:" + sf.link(res));
					});
				}
			});
		}
		/* the above is the same as this
			// sf.preview only works with images
			sf.preview(file, function(data) {
				if(data)
					$('#preview-images').append('<img src="' + data.src + '"> ' + data.width +'x' + data.height + ' ' + data.size + ' ' + data.type + ' ' + data.name + '<br>');
			});

			sf.upload(file, function (error, res) {
				if(error) {
					console.log("error uploading the file", error);
					return;
				}
				console.log("File uploaded, the path is:" + sf.link(res));
			});
		*/
	},
	'click #save': function () {
		var userId = Meteor.userId();
		if(userId) {
			var file = sf.getFiles('photo');
			// when you save the file, the previous file is deleted from user
			Meteor.users.update(userId, {
				'$set': {
					'profile.photo': file
				}
			}, function (error) {
				console.log(error || 'file saved in the user profile');
			});

			/*
			Meteor.call('editUserPhoto', function (error) {
				console.log(error || 'file saved in the user profile');
			});
			*/
		}
	},
	'click #delete': function () {
		sf.remove('photo');
	},
	'change #filesMultiple': function (e) {
		var file = e.target.files[0];
		if(file) {
			sf.preview(file, function (data) {
				if(data) {
					$('#preview-images-multiple').html('<img src="' + data.src + '"> ' + data.width +'x' + data.height + ' ' + data.size + ' ' + data.type + ' ' + data.name + '<br>');

					// the likes controller allows the entry of several images
					sf.upload(file, 'likes', function (error, res) {
						if(error) {
							console.log("error uploading the file", error);
							$('#preview-images-multiple').html('');
							return;
						}
						console.log("File uploaded, the path is:" + sf.link(res));
					});
				}
			});
		}
	},
	'click #saveAllMultiple': function (e) {
		var userId = Meteor.userId();
		if(userId) {
			var files = sf.getFiles('likes');
			Meteor.call('editUserLikes', function (error) {
				console.log(error || 'files saved in the user likes');
			});
		}
	}
});

Template.smartfile.helpers({
	photo: function () {
		var user = Meteor.user();
		if(user) {
			var photo = user.profile && user.profile.photo;
			// you can use in template {{ sfPath photo.nameId }} - is the same
			if(photo)
				return sf.link(photo);
		}
	},
	likes: function () {
		var user = Meteor.user();
		if(user) {
			var likes = user.profile && user.profile.likes;

			if(likes) {
				return _.map(likes, function (like) {
					like.src = sf.link(like);
					return like;
				});
			}
		}
	}
});

Template.likesFiles.events({
	'click .saveLike': function () {
		Meteor.call('editUserLikes', this.nameId, function (error) {
			console.log(error || 'file saved in the user likes');
		});
	},
	'click .deleteFile': function () {
		sf.remove('likes', this.nameId);
	}
});

Template.likesFilesInUser.events({
	'click .deleteFile': function () {
		Meteor.call('deleteLikeFile', this, function (error) {
			console.log(error || 'file removed from you profile');
		});
	}
});