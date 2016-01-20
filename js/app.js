
		var messageModel = {
			currentMessage: {},
			messages: {}
		};

		var messageController = {
			cookiename: "_cookieaccept",
			unreadCookie : "_unreadCookie",


			init : function(){
				var pos = document.cookie.indexOf(this.cookiename);
				var pos1 = document.cookie.indexOf(this.unreadCookie);

				var cookie = -1;
				var cookie1 = 0;
				var url = "http://kort.albertslund.dk/cbkort?page=infobox.get_beskeder&id=";
				var url1 = "http://kort.albertslund.dk/cbkort?page=infobox.get_unread&id=";

				if(pos > -1){
					cookie = parseInt(this.getCookie(this.cookiename));
				}

				var url = url + cookie;

				if(pos1 > -1){
					cookie1 = this.getCookie(this.unreadCookie);
					// remove the last element of the cookie.
				//	cookie1 = cookie1.split(",").slice(0,-1).join(",");

					if(cookie1 != "")
						url = url1 + cookie + "&ids=" + cookie1;
				}

				jQuery.getJSON(url, function (data){
					if(!data["row"] || data["row"].length < 1)
						return;

					// instatiate the model with data
					messageModel.messages = data.row;
					messageModel.currentMessage = data.row[0];
					var _tmp = data.row.map(function(i){return i.id;}).join(",");
					console.log(_tmp);
					var _tmp1 = data.row[data.row.length - 1].id;
					console.log(_tmp1);

					if(_tmp1 > cookie){
						messageController.writeCookie(messageController.cookiename,_tmp1);
					}

					messageController.writeCookie(messageController.unreadCookie,_tmp);

					if(data.row.length == 1){
					//	notificationBarView.init();
						messageBoxView.init();
					}else{
						notificationBarView.init();
						messageListView.init();
						messageListView.show("slow");
						messageBoxView.init();

					}
				});
			},

			writeCookie: function(cname,message){
				var expdate = new Date();
				expdate.setTime(expdate.getTime() + (1000*60*60*24*30));
				var expiration = "expires="+expdate.toUTCString();
				document.cookie=cname+"="+ message +";"+expiration;
			},

			getCookie:	function(cname) {
				var name = cname + "=";
				var ca = document.cookie.split(';');
				for(var i=0; i<ca.length; i++) {
					var c = ca[i];
					while (c.charAt(0)==' ') c = c.substring(1);
					if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
				}
				return "";
			},

			getMessages  : function(){
				return messageModel.messages;
			},

			getNewMessageIds: function () {
				return this.getCookie(this.unreadCookie).split(",");
			},

			getCurrentMessage : function(){
				console.log("currentMessage =>"+ messageModel.currentMessage.message);
				return messageModel.currentMessage;
			},

			setCurrentMessage : function(message){
				messageModel.currentMessage = message;
			},

			getMessageCount: function(){
				return messageModel.messages.length;
			},

			getUnreadMessageCount: function(){
				var _c = this.getCookie(this.unreadCookie).split(",");
				if(_c.join(",") == "") return 0;
				return _c.length;
			},

			updateUnreadCookie: function(message){
				var _unreadCookie = this.getCookie(this.unreadCookie);
					_unreadCookie = _unreadCookie.split(",").filter(function(i){return i != message.id}).join(",");
				this.writeCookie(this.unreadCookie, _unreadCookie);
			},

			hideAll: function(){
				notificationBarView.hide("slow");
				messageListView.hide("slow");
				messageBoxView.hide("slow");
			}
		};

		var notificationBarView = {

			init: function(){
				messages = messageController.getMessages;
				this.elem = jQuery( "#notificationBar");
				jQuery( "#notificationBar button").html('Meddelelser fra kort-service <span class="badge">' + messageController.getUnreadMessageCount() +'</span>');
				this.render();
				this.elem.click(function(){
				//	jQuery( "#notificationBar button").html('New messages <span class="badge">' + messageController.getUnreadMessageCount() +'</span>');
					messageListView.init();
					console.log(111);
					if(messageListView.isVisible()){
						messageListView.hide("slow");
						messageBoxView.hide("slow");
					}else{
						messageListView.show("slow");
						messageBoxView.show("slow");
					}
				});
			},
			updateView: function(){
				jQuery( "#notificationBar button").html('New messages <span class="badge">' + messageController.getUnreadMessageCount() +'</span>');
			},
			render: function(){
					this.show();
			},

			show : function(){
				this.elem.show("slow");
			},

			hide : function(){
				this.elem.hide("slow");
			},

			isVisible: function(){
				return this.elem.is(":visible");
			}
		};

		var messageListView = {
			id: "#messageList",
			init: function(){
				this.elem = jQuery("#messageList");
				this.render();

			},

			render: function(){
				messages = messageController.getMessages();
				m = messages.map(function(i){return i.id;});
				console.log("message list  => + " + m);
				this.elem.html("");

				for(var i=0; i<messages.length;i++){
					message = messages[i];
					newItem = '';

					if(messageController.getNewMessageIds().indexOf(message.id) > -1){
							newItem = '<span class="badge">ny<span>';
					}

					var item = jQuery('<button type="button" id="message_' + message.id + '" class="list-group-item messageItem" style="/*background-color:rgb(251, 225, 229);*/">'
								+ message.title + newItem +'</button>');


					this.elem.append(item);
					el = jQuery("#message_" + message.id);
					//el.css("background-color:rgba(57,171,108,0.52);");
					el.click((function(m){
						return function(){
							messageController.setCurrentMessage(m);
							messageBoxView.init();
						};
					})(message));
				}

			},

			show : function(mode){
				this.elem.show(mode);
			},

			hide : function(mode){
				this.elem.hide(mode);
			},

			isVisible: function(){
				return this.elem.is(":visible");
			},

			markElemAsRead: function(message){
				jQuery("#message_"+ message.id).html(message.title);
			},

			highlightElement: function(message){
				jQuery("#message_" + message.id).css("background-color","rgba(57,171,108,0.52)");
				jQuery("#message_" + message.id).siblings().css("background-color","#fff");
			}
		};
		/*
		var messageBoxView = {
			elem: jQuery("#cookieContent"),
			init: function(){
				this.elem = jQuery("#cookieContent");
				this.msg = jQuery("#content");
				this.okBtn = jQuery("#okBtn");
				this.message = messageController.getCurrentMessage();
				this.render();
			//	messageController.writeCookie(messageController.cookiename,this.message.id);
				messageController.updateUnreadCookie(this.message);
				notificationBarView.updateView();
				messageListView.markElemAsRead(this.message);
				messageListView.highlightElement(this.message);
			},
			render: function(){
				//this.msg.html("");
				box = this.elem;
				this.msg.html('<p style="padding:20px;">' + messageController.getCurrentMessage().message + '</p>');
				this.okBtn.click(function(){
					jQuery("#cookieContent").hide("slow");
					//reset list color
					//messageListView.render();
					if(messageController.getUnreadMessageCount() == 0){
						messageController.hideAll();
					}
				});
				box.show("slow");
			},

			show : function(){
					this.elem.show("slow");
						messageListView.highlightElement(this.message);
				},

			hide : function(){this.elem.hide("slow");},
			isVisible: function(){this.elem.is(":visible")}
		};
		*/
		var messageBoxView = {
			elem: jQuery("#myModal"),
			init: function(){
				//if rendered, just return
				if(jQuery("#myModal").is(":visible")){
				//	console.log('before return');
					return;
				}
			//	this.elem = jQuery("#myModal");
			//	this.msg = jQuery("#content");
				this.okBtn = jQuery("#dismissBtn");
				this.message = messageController.getCurrentMessage();
				this.render();
			//	messageController.writeCookie(messageController.cookiename,this.message.id);
				messageController.updateUnreadCookie(this.message);
				notificationBarView.updateView();
				messageListView.markElemAsRead(this.message);
				messageListView.highlightElement(this.message);
			},
			render: function(){
				 this.okBtn.click(function(){
				
					 messageListView.render();
					 if(messageController.getUnreadMessageCount() == 0){
						 messageController.hideAll();
					 }
				 });
			//	box.show("slow");
				var message = messageController.getCurrentMessage().message;
				var link = messageController.getCurrentMessage().link;
				if(link){
					 message = message + '<br/><br/> mere info <a href="'+ link +'">here</a>'; 
				}
				jQuery("#myModal").find('.modal-title').html(messageController.getCurrentMessage().title);
				jQuery("#myModal").find('.modal-body').html(message);
				jQuery("#myModal").modal({backdrop: 'static', keyboard: false});
			}

			
		};

