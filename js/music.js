$(function(){
	
	//自定义滚动条
	$(".content_list").mCustomScrollbar();
	
	var $audio = $("audio");
	var player = new Player($audio);
	var progress;
	var voiceProgress;
	var lyric;
	
	
	
	
	Player($audio);
	
	
	
	getMusicList()
	// 1. 加载歌曲列表，因没有服务器接口，只能手写json文件
	function getMusicList(){
		$.ajax({
			//加载路径
			url:"./source/musiclist.json",
			//加载文件类型
			dataType:"json",
			success:function(data){
				player.musicList = data;
				// 遍历数组，创建数组内音乐
				$.each(data,function(index,ele){
					var $item = creatMusicitem(index,ele);
					$(".list_items").append($item);
				});
				initMusicInfo(data[0]);
				initMusicLyric(data[0]);
			},
			error:function(e){
				console.log(e);
				console.log("error");
			},
		})
	}
	
	
	// 2 初始化歌曲信息
	function initMusicInfo(music){
		//获取元素
		$musicImg = $(".song_Info_pic");
		$musicName = $(".song_info_name a");
		$musicSinger = $(".song_info_singer a");
		$musicAblum = $(".song_info_ablum a");
		// $musicLyric = $(".song_lyric");
		$musicProgressName = $(".music_progress_name");
		$musicProgressTime = $(".music_progress_time");
		$musicBg = $(".mask_bg");
		
		
		//操作元素
		$musicImg.attr("src",music.cover);
		$musicName.text(music.name);
		$musicSinger.text(music.singer);
		$musicAblum.text(music.album);
		$musicProgressName.text(music.name+" -- "+music.singer);
		$musicProgressTime.text("00:00"+" / "+music.time);
		$musicBg.css("background","url('"+music.cover+"')")

	}
	
	// 2 初始化歌词
	function initMusicLyric(music){
		// console.log(music);
		lyric = new Lyric(music.link_lrc);
		var $lyricContainer = $(".song_lyric");
		
		//清除原先的歌词
		$lyricContainer.empty();
		
		// lyric.lyrics = [];
		// console.log(lyric.lyrics);
		
		lyric.loadLtric(function(){
			
			// console.log($lyricContainer);
			//创建歌词列表
			console.log(lyric.lyrics);
			$.each(lyric.lyrics,function(index,ele){	
				var $item = $("<li>"+ele+"</li>");
				// console.log($item);
				$lyricContainer.append($item);
			})
		});
	}
	
	initProgeress();
	//初始化歌曲进度条
	function initProgeress(){
		//播放进度条
		var $progressBar = $(".music_progress_info_down");
		var $progressDot = $(".music_progress_dot");
		var $progressLine = $(".music_progress_line");
		progress = Progress($progressBar,$progressLine,$progressDot);
		
		progress.progressClick(function(value){
			player.musicSeekTo(value);
		});
		progress.progressMove(function(value){
			player.musicSeekTo(value);
		});
		
		//声音进度条
		var $voiceBar = $(".music_voice_down");
		// var $voiceDot = $(".music_voice_dot");
		var $voiceLine = $(".music_voice_line");
		voiceProgress = Progress($voiceBar,$voiceLine,$progressDot);
		
		voiceProgress.progressClick(function(value){
			//设置音量
			player.musicVioceSeekTo(value);
		});
		voiceProgress.progressMove(function(value){
			player.musicVioceSeekTo(value);
		});
	};
	
	initEvents();
		// 2. 初始化事件监听
		function initEvents(){
			// 2.1 监听事件将子菜单a出现进行实践委托,
			//鼠标进入
			$(".list_items").on("mouseenter","li",function(){
				//显示子菜单
				$(this).find(".list_menu").stop().fadeIn(100);
				$(this).find(".list_singer a").stop().fadeIn(0);
				//隐藏歌手
				$(this).find(".list_singer span").stop().fadeOut(0);
			});
			//鼠标出来
			$(".list_items").on("mouseleave","li",function(){
				// 隐藏子菜单
				$(this).find(".list_menu").stop().fadeOut(100);
				$(this).find(".list_singer a").stop().fadeOut(10);
				//显示歌手
				$(this).find(".list_singer span").stop().fadeIn(0);
			})
			//监听鼠标进入以后list——items的a标签出现
			/* $(".list_items li").hover(function(){
				
			},function(){
				
			}) */
			
			
			// 2.2 监听选择歌曲的框框的点击
			$(".list_items").on("click",".list_chack",function(){
				
				$(this).parent().toggleClass("list_chacked")
			})
			/* $(".list_chack i").click(function(){
				
			}) */
			
			
			// 2.3 listmenuplay按钮绑定事件
			$(".list_items").on("click",".list_menu_play",function(){
				var $li = $(this).parents("li");
				/* console.log($li.get(0).index);
				console.log($li.get(0).music); *///当前可以拿到在creatMusicitem中绑定的index和music
				
				//改变自己的播放按钮样式
				$(this).toggleClass("list_menu_play_2");
				//改变其他按钮的样式
				$li.siblings().find(".list_menu_play").removeClass("list_menu_play_2");
				//改变底部播放按钮样式
					//判断当前状态是否播放
					if($(this).hasClass("list_menu_play_2")){
						//播放状态
						$(".music_play").addClass("music_play_2");
						//文字变高亮状态
						$li.css("color","rgba(255,255,255,1)");
							//取消其他高亮
							$li.siblings().css("color","rgba(255,255,255,0.5)");
						//改变数字为播放动效果
						$li.find(".list_number").addClass("list_number_2")
							//改变其他为数字
						$li.siblings().find(".list_number").removeClass("list_number_2")
					}else{
						// 停止状态
						$(".music_play").removeClass("music_play_2");
						//文字没有高亮
						$li.css("color","rgba(255,255,255,0.5)");
						//改变数字为数字状态
						$li.find(".list_number").removeClass("list_number_2")
					}
				
				//改变数字为播放动效果
				$(this).parent("li").find(".list_number").html(`
						<img src="images/wave.gif" >
				`)
				
				//调用音乐播放方法
				player.playMusic($li.get(0).index,$li.get(0).music);
				//调用初始化歌曲信息方法
				initMusicInfo($li.get(0).music);
				//调用初始化歌词方法
				initMusicLyric($li.get(0).music);
			});
			
			
			//底部控制区域按钮监听
			//2.4 监听播放按钮
			$(".music_play").click(function(){
				//判断是否播放过音乐
				if(player.currentIndex == -1){
					//没播放过
					$(".list_items li").eq(0).find(".list_menu_play").trigger("click");
				}else{
					//播放过
					$(".list_items li").eq(player.currentIndex).find(".list_menu_play").trigger("click");
					
					//关闭歌词初始化
					
				}
			})
			
			//2.5 监听上一首按钮
			$(".music_pre").click(function(){
				var index = player.preIndex();
				$(".list_items li").eq(index).find(".list_menu_play").trigger("click");
			})
			
			//2.6 监听下一首按钮
			$(".music_next").click(function(){
				var index = player.nextIndex();
				$(".list_items li").eq(index).find(".list_menu_play").trigger("click");
			})
		
			// 2.7 监听删除按钮点击
			$(".list_items").on("click",".list_menu_del",function(){
				//找到被点击的音乐
				var $li = $(this).parents("li");
				
				//判断删除的是否是正在播放的
				if($li.get(0).index == player.currentIndex){
					$(".music_next").trigger("click");
				}
				
				//删除li节点
				$li.remove();
				//删除后台数据musicList
				player.changeMusic($li.get(0).index);
				//重新排序
				$(".list_items li").each(function(index,ele){
					ele.index = index;
					$(this).find(".list_number").text(index+1);
					
				})
				
			});
			
			// 2.8 监听歌曲播放进度
			player.musicTimeUpdate(function(duration,currentTime,timeStr){
				//同步时间
				$musicProgressTime.text(timeStr);
				//同步进度条
				var value = currentTime / duration * 100;
				progress.setProgress(value);
				
				//同步歌词 
				var index = lyric.currentIndex(currentTime);
				var $item = $(".song_lyric li").eq(index);
				// console.log($item);
				$item.addClass("cur");
				$item.siblings().removeClass("cur");
				
				if(index < 3)return true;
				$(".song_lyric").css({
					marginTop: ((-index+2) * 30)
				})
			})
		
			
			
			//定义变量记录是否静音
			var playIcon = true;
			// 2.9 监听声音按钮的点击
			$(".music_voice_icon").click(function(){
				// 切换图标
				$(this).toggleClass("music_voice_icon_2");
				//切换声音
					//判断是否是静音
					if($(this).hasClass("music_voice_icon_2")){
						//有声音状态，变为静音
						player.musicVioceSeekTo(0);
					}else{
						//静音状态，变为有声音
						player.musicVioceSeekTo(1);
					}
			})
			
		}
	
	

	
	//定义拿到参数创建音乐items方法
	function creatMusicitem(index,music){
		// 使用es6模板字符串``
		var $item = $(`
			<li>
				<span class="list_chack"><i></i></span>
				<span class="list_number">${1+index}</span>
				<span class="list_name">${music.name}
					<span class="list_menu" >
						<a href="javascript:;" title="播放" class="list_menu_play"></a>
						<a href="javascript:;" title="添加"></a>
						<a href="javascript:;" title="下载"></a>
						<a href="javascript:;" title="分享"></a>
					</span>
				</span>
				<span class="list_singer">
					<span>${music.singer}</span>
					<a href="javascript:;" title="删除" class="list_menu_del"></a>
				</span>
				<span class="list_time">${music.time}</span>
			</li>
		`)
		$item.get(0).index = index;
		$item.get(0).music = music;
		return $item;
	}
	
})