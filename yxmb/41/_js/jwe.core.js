/*!
 * 基础核心方法脚本
 */
 
var _ucArr = new Array(); //记录使用中的棋子编号的数组
////////////////////////////////////////////////////////////////////////////
/*随机生成一套应用棋子编号*/
function createAppCode(){
	while(_ucArr.length<_UniTypeNumber){
		var n =  Math.floor(Math.random() * (_UniTypeNumberMax));
		var isNew = true;
		for(var k in _ucArr){
			if(_ucArr[k]==n){
				isNew=false;
				break;
			}
		}
		if(isNew) _ucArr.push(n);
	}
}


/*新棋子代码*/
function uniCode(n){
	var html = "<div class='uni' lang="+n+" ><img lang="+n+" src='_img/uni/"+_dir+"/"+n+"."+_extName+"' /></div>";
	return html;
}
/*动态背景代码*/
function bgImgCode(n){
	var html = "url(_img/bg/"+_dir+"/"+n+"."+_bgExtName+")";
	return html;
}
/*动态gi亮相1代码*/
function giCode1(n){
//	var html = "url(_img/sexy/heroPic1/"+n+".png)";
	var html = "<img src='_img/sexy/heroPic1/"+n+".png' />";
	return html;
}

/**
*精彩图
*（这个代码要根据实际情况编写！）
*/
function xPCode(n){
	var s = n.toString();
	while(s.length<3) s="0"+s;
	var pic = "E"+s+".JPG";
	var html = "<img src='_img/sexy/endPic/"+pic+"' />";
//	debug(html)
	return html;
}


/*来一个新棋子*/
function aNewUni(n){
	if(n==null)	n = Math.floor( Math.random() * (_UniTypeNumber)); //注意：这个值随机生成不同的数量！--0,1,2,3,4,5....
	var N = _ucArr[n];  //注意这里！！！！
	return uniCode(N);
}


/*new
* 找到要交换的那个对象容器
*update:2016-4-13
* 如果返回 null 说明不能交换
*@return :TD(封装的)
*/
function getSwitcherTD(td, sign){
	var id=td.id;
	var ss = id.split("_");
	var r=parseInt(ss[1]);
	var c=parseInt(ss[2]);
	if(sign=="up"){	r--;}
	else if(sign=="dn"){	r++;}
	else if(sign=="lf"){c--;}
	else if(sign=="rt"){c++;}
	else{/**/}
	var id2 = ss[0]+"_"+r+"_"+c;
	return $("#"+id2);
	
}


/**
* 检查两个td是否相邻（上下左右相邻）
*@param TD1: 第1个封装的td对象
*@param TD2: 第2个封装的td对象
*@return: true表示相邻，false表示不相邻
*/
function areTDsAdjacent(TD1, TD2){
	var id1 = TD1.attr("id");
	var id2 = TD2.attr("id");
	if(!id1 || !id2) return false;
	
	var ss1 = id1.split("_");
	var ss2 = id2.split("_");
	
	var r1 = parseInt(ss1[1]);
	var c1 = parseInt(ss1[2]);
	var r2 = parseInt(ss2[1]);
	var c2 = parseInt(ss2[2]);
	
	// 检查是否相邻：行差1且列相同，或者列差1且行相同
	var rowDiff = Math.abs(r1 - r2);
	var colDiff = Math.abs(c1 - c2);
	
	return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}

/**
* 检查交换两个方块后是否能形成匹配（至少3个相同）
*@param TD1: 第1个封装的td对象
*@param TD2: 第2个封装的td对象
*@return: true表示交换后能形成匹配，false表示不能
*/
function willSwapCreateMatch(TD1, TD2){
	var o1 = TD1.find(".uni:first")[0];
	var o2 = TD2.find(".uni:first")[0];
	
	if(!o1 || !o2) return false;
	
	// 临时交换内容（不改变视觉位置）
	var temp1 = TD1.html();
	var temp2 = TD2.html();
	TD1.html(temp2);
	TD2.html(temp1);
	
	// 重新获取交换后的对象
	var newO1 = TD1.find(".uni:first")[0];
	var newO2 = TD2.find(".uni:first")[0];
	
	var canMatch = false;
	
	if(newO1){
		// 检查第一个方块交换后是否能形成匹配
		try {
			var nUp = chkLink(newO1, "up");
			var nDn = chkLink(newO1, "dn");
			var nLf = chkLink(newO1, "lf");
			var nRt = chkLink(newO1, "rt");
			if((nUp + nDn >= 2) || (nLf + nRt >= 2)){
				canMatch = true;
			}
		} catch(e) {
			// 如果检查出错，认为不能匹配
		}
	}
	
	if(!canMatch && newO2){
		// 检查第二个方块交换后是否能形成匹配
		try {
			var nUp = chkLink(newO2, "up");
			var nDn = chkLink(newO2, "dn");
			var nLf = chkLink(newO2, "lf");
			var nRt = chkLink(newO2, "rt");
			if((nUp + nDn >= 2) || (nLf + nRt >= 2)){
				canMatch = true;
			}
		} catch(e) {
			// 如果检查出错，认为不能匹配
		}
	}
	
	// 恢复原来的内容
	TD1.html(temp1);
	TD2.html(temp2);
	
	return canMatch;
}

/**
* 【实质】交换两个td中的棋子
*@param TD1: 第1个封装的td对象
*@param TD2: 第2个封装的td对象
*/
function switch2TDsUni(TD1,TD2){
	var t1 = TD1.html();
	var t2 = TD2.html();
	
	TD1.html(t2);
	TD2.html(t1);
	var o1 = TD1.find(".uni:first");
	var o2 = TD2.find(".uni:first");
	//恢复事件绑定：
	if(o1.length>0) uniEvt(o1);
	if(o2.length>0) uniEvt(o2);
}



////////////////////////////////////////////////////////////

/**
* 交换两个td中的棋子，同时让棋子保持原来的可视位置
*@param TD1: 第1个封装的td对象
*@param TD2: 第2个封装的td对象
*@param chgPos1: 是否变更棋子1的位置（false时归零）
*@param chgPos2: 是否变更棋子2的位置（false时归零）
*/
function switch2TDsUni_orgPlace(TD1,TD2,chgPos1,chgPos2){
	
	switch2TDsUni(TD1,TD2);
	var o1 = TD1.find(".uni:first");
	var o2 = TD2.find(".uni:first");
	
	reform(o1);
	reform(o2);
	
	var dW = parseInt(TD2.position().left) - parseInt(TD1.position().left);
	var dH = parseInt(TD2.position().top) - parseInt(TD1.position().top);
	
	if(chgPos1)	o1.css({left:dW, top:dH});
	else o1.css({left:0, top:0});
	if(chgPos2)	o2.css({left:-dW, top:-dH});
	else o2.css({left:0, top:0});
	
}


/**
*在指定td中创建一个新的（高空）棋子
*@param TD: 指定td对象（封装的）
*@param n: 高于本容器的倍数（0为正常位置）
*/
function newSkyUniAtTD(TD, n){
	TD.html(aNewUni());
	var hi = parseInt(TD.css("height")) * n; //!
	var o = TD.find(".uni:first");
	o.css({top:-hi});
	//+事件绑定：
	uniEvt(o);
}

/**
*从td向td2复制棋子单元信息
*(还保持原来的棋子位置)
*@param TD: 源（封装的）
*@param TD2: 目标（封装的）
*/
function copyUniFromTD(TD, TD2){
	TD2.html(TD.html());
	var hi = parseInt(TD.position().top) - parseInt(TD2.position().top);
	var wi = parseInt(TD.position().left) - parseInt(TD2.position().left);
	var o = TD2.find(".uni:first");
	o.css({top:hi,left:wi});
	//+事件绑定：
	uniEvt(o);
}

///////////////////////////////////////////////////////////////////

/*计分栏代码*/
function scoCode(n){
	var html = "<span class='scBar' id='scBar_"+n+"' lang="+n+" >0</span>";
	return html;
}


///////////////////////////////////////////////////////////////////

/**
*封装对象全局坐标中心对齐
*/
function objPos(Obj, x, y){
	var wi = parseInt(Obj.css("width"));
	var hi = parseInt(Obj.css("height"));
	Obj.css({
		left: parseInt(x) - wi/2,
		top: parseInt(y) - hi/2
	});
}
