//闭包函数,防止变量污染
(function(window){
	
	function Player($audio){
		return new Player.prototype.init($audio);
	}
	Player.prototype = {
		constructor: Player,
		musicList:[],
		init: function($audio){
			this.$audio = $audio;
			this.audio = $audio.get(0);
			// console.log(this.$audio);
		},
		currentIndex:-1,
		//处理索引
		preIndex:function(){
			var index = this.currentIndex - 1;
			if(index < 0){
				index = this.musicList.length - 1;
			};
			return index;
		},
		nextIndex:function(Index){
			var index = this.currentIndex + 1;
			if(index > this.musicList.length - 1){
				index = 0;
			};
			return index;
		},
		playMusic:function(index,music){
			//判断是否为同一音乐
			if(index == this.currentIndex){
				//是同一首，
					//判断是否为暂停状态
					if(this.audio.paused){
						//播放状态
						this.audio.play()
					}else{
						// 暂停状态
						this.audio.pause()
					}
			}else{
				//不是同一首 改变audio中的src
				this.$audio.attr("src",music.link_url);
				this.audio.play();
				this.currentIndex = index;
			}
		},
		
		//定义函数删除后台数据musicList
		changeMusic: function(index){
			this.musicList.splice(index,1);//1代表删除数量
			//判断删除的是否是在当前播放的音乐的前面
			if(index < this.currentIndex){
				this.currentIndex -= 1
			}
		},
		
		getMusicDuration:function(){
			return this.audio.duration;
		},
		getMusicCurrentTime: function(){
			return this.audio.currentTime;
		},
		
		musicTimeUpdate: function(callBack){
			var $this = this;
			this.$audio.on("timeupdate",function(){
				var duration = $this.audio.duration;//歌曲长度
				var currentTime = $this.audio.currentTime;//当前时间
				//调用格式化时间方法
				var timeStr = $this.formatData(currentTime,duration);
				//改变进度时间
				// $musicProgressTime.text(timeStr); 
				callBack(duration,currentTime,timeStr);
				
			})

		},
		
		//定义处理时间方法
		formatData:function(currentTime,duration){
			var endMin = parseInt(duration / 60);
			var endSec = parseInt(duration % 60);
			//判断是不是小于10
			if (endMin<10){
				endMin = "0"+endMin
			};
			if (endSec<10){
				endSec = "0"+endSec
			};
			
			
			var startMin = parseInt(currentTime / 60);
			var starSec = parseInt(currentTime % 60);
			//判断是不是小于10
			if (startMin<10){
				startMin = "0"+startMin
			};
			if (starSec<10){
				starSec = "0"+starSec
			};
			
			
			return ( startMin+":"+starSec +" / "+endMin +":"+endSec)
		},
		
		musicSeekTo:function(value){
			this.audio.currentTime = this.audio.duration * value;
		},
		
		//定义调节声音大小方法
		musicVioceSeekTo: function(value){
			//value 为0-1
			this.audio.volume = value
		}
		
		
	}
	
	Player.prototype.init.prototype = Player.prototype;
	window.Player = Player;
	
})(window)