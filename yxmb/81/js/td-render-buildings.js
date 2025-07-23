/*
 * Copyright (c) 2011.
 *
 * Author: oldj <oldj.wu@gmail.com>
 * Blog: http://oldj.net/
 *
 * Last Update: 2011/1/10 5:22:52
 */

// _TD.a.push begin
_TD.a.push(function (TD) {

	function lineTo2(ctx, x0, y0, x1, y1, len) {
		var x2, y2, a, b, p, xt,
			a2, b2, c2;

		if (x0 == x1) {
			x2 = x0;
			y2 = y1 > y0 ? y0 + len : y0 - len;
		} else if (y0 == y1) {
			y2 = y0;
			x2 = x1 > x0 ? x0 + len : x0 - len;
		} else {
			// 解一元二次方程
			a = (y0 - y1) / (x0 - x1);
			b = y0 - x0 * a;
			a2 = a * a + 1;
			b2 = 2 * (a * (b - y0) - x0);
			c2 = Math.pow(b - y0, 2) + x0 * x0 - Math.pow(len, 2);
			p = Math.pow(b2, 2) - 4 * a2 * c2;
			if (p < 0) {
//				TD.log("ERROR: [a, b, len] = [" + ([a, b, len]).join(", ") + "]");
				return [0, 0];
			}
			p = Math.sqrt(p);
			xt = (-b2 + p) / (2 * a2);
			if ((x1 - x0 > 0 && xt - x0 > 0) ||
				(x1 - x0 < 0 && xt - x0 < 0)) {
				x2 = xt;
				y2 = a * x2 + b;
			} else {
				x2 = (-b2 - p) / (2 * a2);
				y2 = a * x2 + b;
			}
		}

		ctx.lineCap = "round";
		ctx.moveTo(x0, y0);
		ctx.lineTo(x2, y2);

		return [x2, y2];
	}

	var renderFunctions = {
		"cannon": function (b, ctx, map, gs, gs2) {
			var target_position = b.getTargetPosition();

			ctx.fillStyle = "#393";
			ctx.strokeStyle = "#000";
			ctx.beginPath();
			ctx.lineWidth = _TD.retina;
			ctx.arc(b.cx, b.cy, gs2 - 5, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();

			ctx.lineWidth = 3 * _TD.retina;
			ctx.beginPath();
			ctx.moveTo(b.cx, b.cy);
			b.muzzle = lineTo2(ctx, b.cx, b.cy, target_position[0], target_position[1], gs2);
			ctx.closePath();
//			ctx.fill();
			ctx.stroke();

			ctx.lineWidth = _TD.retina;
			ctx.fillStyle = "#060";
			ctx.beginPath();
			ctx.arc(b.cx, b.cy, 7 * _TD.retina, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();

			ctx.fillStyle = "#cec";
			ctx.beginPath();
			ctx.arc(b.cx + 2, b.cy - 2, 3 * _TD.retina, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.fill();

		},
		"LMG": function (b, ctx, map, gs, gs2) {
			var target_position = b.getTargetPosition();

			ctx.fillStyle = "#36f";
			ctx.strokeStyle = "#000";
			ctx.beginPath();
			ctx.lineWidth = _TD.retina;
			ctx.arc(b.cx, b.cy, 7 * _TD.retina, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();

			ctx.lineWidth = 2 * _TD.retina;
			ctx.beginPath();
			ctx.moveTo(b.cx, b.cy);
			b.muzzle = lineTo2(ctx, b.cx, b.cy, target_position[0], target_position[1], gs2);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();

			ctx.lineWidth = _TD.retina;
			ctx.fillStyle = "#66c";
			ctx.beginPath();
			ctx.arc(b.cx, b.cy, 5 * _TD.retina, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();

			ctx.fillStyle = "#ccf";
			ctx.beginPath();
			ctx.arc(b.cx + 1, b.cy - 1, 2 * _TD.retina, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.fill();

		},
		"HMG": function (b, ctx, map, gs, gs2) {
			var target_position = b.getTargetPosition();

			ctx.fillStyle = "#933";
			ctx.strokeStyle = "#000";
			ctx.beginPath();
			ctx.lineWidth = _TD.retina;
			ctx.arc(b.cx, b.cy, gs2 - 2, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();

			ctx.lineWidth = 5 * _TD.retina;
			ctx.beginPath();
			ctx.moveTo(b.cx, b.cy);
			b.muzzle = lineTo2(ctx, b.cx, b.cy, target_position[0], target_position[1], gs2);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();

			ctx.lineWidth = _TD.retina;
			ctx.fillStyle = "#630";
			ctx.beginPath();
			ctx.arc(b.cx, b.cy, gs2 - 5 * _TD.retina, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();

			ctx.fillStyle = "#960";
			ctx.beginPath();
			ctx.arc(b.cx + 1, b.cy - 1, 8 * _TD.retina, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.fill();

			ctx.fillStyle = "#fcc";
			ctx.beginPath();
			ctx.arc(b.cx + 3, b.cy - 3, 4 * _TD.retina, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.fill();

		},
		"wall": function (b, ctx, map, gs, gs2) {
			ctx.lineWidth = _TD.retina;
			ctx.fillStyle = "#666";
			ctx.strokeStyle = "#000";
			ctx.fillRect(b.cx - gs2 + 1, b.cy - gs2 + 1, gs - 1, gs - 1);
			ctx.beginPath();
			ctx.moveTo(b.cx - gs2 + 0.5, b.cy - gs2 + 0.5);
			ctx.lineTo(b.cx - gs2 + 0.5, b.cy + gs2 + 0.5);
			ctx.lineTo(b.cx + gs2 + 0.5, b.cy + gs2 + 0.5);
			ctx.lineTo(b.cx + gs2 + 0.5, b.cy - gs2 + 0.5);
			ctx.lineTo(b.cx - gs2 + 0.5, b.cy - gs2 + 0.5);
			ctx.moveTo(b.cx - gs2 + 0.5, b.cy + gs2 + 0.5);
			ctx.lineTo(b.cx + gs2 + 0.5, b.cy - gs2 + 0.5);
			ctx.moveTo(b.cx - gs2 + 0.5, b.cy - gs2 + 0.5);
			ctx.lineTo(b.cx + gs2 + 0.5, b.cy + gs2 + 0.5);
			ctx.closePath();
			ctx.stroke();
		},
		"laser_gun": function (b, ctx/*, map, gs, gs2*/) {
//			var target_position = b.getTargetPosition();

			ctx.fillStyle = "#f00";
			ctx.strokeStyle = "#000";
			ctx.beginPath();
			ctx.lineWidth = _TD.retina;
//			ctx.arc(b.cx, b.cy, gs2 - 5, 0, Math.PI * 2, true);
			ctx.moveTo(b.cx, b.cy - 10 * _TD.retina);
			ctx.lineTo(b.cx - 8.66 * _TD.retina, b.cy + 5 * _TD.retina);
			ctx.lineTo(b.cx + 8.66 * _TD.retina, b.cy + 5 * _TD.retina);
			ctx.lineTo(b.cx, b.cy - 10 * _TD.retina);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();

			ctx.fillStyle = "#60f";
			ctx.beginPath();
			ctx.arc(b.cx, b.cy, 7 * _TD.retina, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();

			ctx.fillStyle = "#000";
			ctx.beginPath();
			ctx.arc(b.cx, b.cy, 3 * _TD.retina, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.fill();

			ctx.fillStyle = "#666";
			ctx.beginPath();
			ctx.arc(b.cx + 1, b.cy - 1, _TD.retina, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.fill();

			ctx.lineWidth = 3 * _TD.retina;
			ctx.beginPath();
			ctx.moveTo(b.cx, b.cy);
//			b.muzzle = lineTo2(ctx, b.cx, b.cy, target_position[0], target_position[1], gs2);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		},
		"ice_tower": function (b, ctx, map, gs, gs2) {
            var target_position = b.getTargetPosition();
            
            // 底座
            ctx.fillStyle = "#336";
            ctx.strokeStyle = "#000";
            ctx.beginPath();
            ctx.lineWidth = _TD.retina;
            ctx.arc(b.cx, b.cy, gs2 - 3, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            // 塔身
            ctx.fillStyle = "#9cf";
            ctx.beginPath();
            ctx.arc(b.cx, b.cy, gs2 - 8, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            // 冷冻装置
            ctx.fillStyle = "#69f";
            ctx.beginPath();
            ctx.arc(b.cx, b.cy, gs2 - 12, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            // 枪管/发射口
            ctx.lineWidth = 4 * _TD.retina;
            ctx.strokeStyle = "#ccf";
            ctx.beginPath();
            ctx.moveTo(b.cx, b.cy);
            b.muzzle = lineTo2(ctx, b.cx, b.cy, target_position[0], target_position[1], gs2 - 5);
            ctx.closePath();
            ctx.stroke();
            
            // 顶部冰晶装饰
            var iceCrystalSize = 6 * _TD.retina;
            ctx.strokeStyle = "#9cf";
            ctx.lineWidth = 2 * _TD.retina;
            
            // 绘制6个方向的冰晶
            for (var i = 0; i < 6; i++) {
                var angle = (i / 6) * Math.PI * 2;
                var x = b.cx + Math.cos(angle) * (gs2 - 12);
                var y = b.cy + Math.sin(angle) * (gs2 - 12);
                
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(
                    x + Math.cos(angle) * iceCrystalSize,
                    y + Math.sin(angle) * iceCrystalSize
                );
                ctx.stroke();
                
                // 冰晶分支
                var branchAngle1 = angle + Math.PI / 3;
                var branchAngle2 = angle - Math.PI / 3;
                ctx.beginPath();
                ctx.moveTo(
                    x + Math.cos(angle) * iceCrystalSize * 0.5,
                    y + Math.sin(angle) * iceCrystalSize * 0.5
                );
                ctx.lineTo(
                    x + Math.cos(angle) * iceCrystalSize * 0.5 + Math.cos(branchAngle1) * iceCrystalSize * 0.4,
                    y + Math.sin(angle) * iceCrystalSize * 0.5 + Math.sin(branchAngle1) * iceCrystalSize * 0.4
                );
                ctx.moveTo(
                    x + Math.cos(angle) * iceCrystalSize * 0.5,
                    y + Math.sin(angle) * iceCrystalSize * 0.5
                );
                ctx.lineTo(
                    x + Math.cos(angle) * iceCrystalSize * 0.5 + Math.cos(branchAngle2) * iceCrystalSize * 0.4,
                    y + Math.sin(angle) * iceCrystalSize * 0.5 + Math.sin(branchAngle2) * iceCrystalSize * 0.4
                );
                ctx.stroke();
            }
            
            // 冷冻效果指示器
            if (b.last_freeze_time && b.last_freeze_time > TD.now - TD.exp_fps) {
                var freezeIndicatorSize = gs2 - 2;
                var alpha = 1 - (TD.now - b.last_freeze_time) / TD.exp_fps;
                
                ctx.strokeStyle = "rgba(150, 200, 255, " + alpha + ")";
                ctx.lineWidth = 3 * _TD.retina;
                ctx.beginPath();
                ctx.arc(b.cx, b.cy, freezeIndicatorSize, 0, Math.PI * 2, true);
                ctx.closePath();
                ctx.stroke();
            }
        }
	};

	TD.renderBuilding = function (building) {
		var ctx = TD.ctx,
			map = building.map,
			gs = TD.grid_size,
			gs2 = TD.grid_size / 2;

		(renderFunctions[building.type] || renderFunctions["wall"])(
			building, ctx, map, gs, gs2
		);
	}

}); // _TD.a.push end
