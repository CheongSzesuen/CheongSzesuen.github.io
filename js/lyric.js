(function(window) {
	function Lyric(path) {
		return new Lyric.prototype.init(path);
	}
	Lyric.prototype = {
		constructor: Lyric,
		init: function(path) {
			this.path = path;
		},
		times:[],
		lyrics:[],
		index: -1,
		loadLtric:function(callBack){
			var $this = this;
			$.ajax({
				//加载路径
				url:$this.path,
				//加载文件类型
				dataType:"text",
				success:function(data){
					// console.log(data);
					$this.parseLyric(data);
					callBack()
				},
				error:function(e){
					console.log(e);
					console.log("error");
				},
			});
		},
		// 定义处理歌词文件方法
		parseLyric:function(data){
			var $this = this;
			var array = data.split("\n");
			// console.log(array);
			var timeReg = /\[(\d*:\d*\.\d*)\]/;
			
			$this.lyrics = [];
			$this.times = [];
			console.log($this.lyrics);
			//遍历并取出歌词
			$.each(array,function(index,ele){
				//处理歌词
				var lrc = ele.split("]")[1];
				//排除空歌词字段
				if(lrc.length == 1)return true;
				$this.lyrics.push(lrc);
				// console.log($this.lyrics);
				
				//处理时间
				var res = timeReg.exec(ele)
				// console.log(res);
				if(res == null)return true;
				var timeStr = res[1];//00:02.65
				// console.log(timeStr);
				var timeStr2 = timeStr.split(":");
				var min = parseInt(timeStr2[0]) * 60;
				var sec = parseFloat(timeStr2[1]);
				var time = 1 * Number(min + sec).toFixed(2);
				$this.times.push(time);
						
			})
		},
	
		currentIndex:function(currentTime){
			// console.log(currentTime);1.436463
			//处理拿到的currentTime
			// var res = currentTime.toFixed(2) * 1;
			// return res;
			var $this = this;
			if(currentTime >= $this.times[0]){
				$this.index ++;
				$this.times.shift();
			};
			return this.index;
			
		}
	}
	Lyric.prototype.init.prototype = Lyric.prototype;
	window.Lyric = Lyric;

})(window)