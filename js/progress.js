(function() {
	function Progress($progressBar, $progressLine, $progressDot) {
		return new Progress.prototype.init($progressBar, $progressLine, $progressDot);
	}
	Progress.prototype = {
		constructor: Progress,
		isMove: false,
		clickLeft: 0,
		init: function($progressBar, $progressLine, $progressDot) {
			this.$progressBar = $progressBar;
			this.$progressLine = $progressLine;
			this.$progressDot = $progressDot;
		},
		progressClick: function(callBack) {
			var $this = this;
			//监听背景线点击
			this.$progressBar.click(function(event) {
				//获取bar距离窗口距离
				var BarLeft = $(this).offset().left;
				//获取点击位置距离窗口距离
				var eventLeft = event.pageX;

				var clickLeft = eventLeft - BarLeft;
				// var clickLeft = event.offsetX;

				//设置line 的宽度
				$this.$progressLine.css("width", clickLeft);

				//计算进度条比例
				var value = clickLeft / $(this).width();
				callBack(value);
			});
		},
		progressMove: function(callBack) {
			var $this = this;
			//监听鼠标按下
			var isClick = false;
			this.$progressBar.mousedown(function() {
				isClick = true;
				//让音乐进度条暂停
				$this.isMove = true;
				// console.log($this.isMove);
				//获取bar距离窗口距离
				var BarLeft = $(this).offset().left;
				//监听鼠标移动
				$(document).mousemove(function(event) {

					//获取点击位置距离窗口距离
					var eventLeft = event.pageX;

					var clickLeft = eventLeft - BarLeft;
					// var clickLeft = event.offsetX;	
					
					//判断位置是否到头
					if (clickLeft > $this.$progressBar.width()) {
						clickLeft = $this.$progressBar.width()
					}
					$this.clickLeft = clickLeft;
					// console.log($this.$progressBar);
					//设置line 的宽度
					$this.$progressLine.css("width", clickLeft);
				});
				
			});
			// 监听鼠标抬起
			$(document).mouseup(function() {
				//移除鼠标移动事件
				$(document).off("mousemove");
				// console.log($this.$progressBar.width());
				$this.isMove = false;
				if (isClick) {
					isClick = false;
					//计算进度条比例
					var value = $this.clickLeft / $this.$progressBar.width();
					callBack(value);
				};
			});


		},

		//定义设置进度条方法
		setProgress: function(value) {
			// console.log(this.isMove);
			if (this.isMove) return;
			this.$progressLine.css({
				width: value + "%"
			});
		},

	}
	Progress.prototype.init.prototype = Progress.prototype;
	window.Progress = Progress;

})(window)