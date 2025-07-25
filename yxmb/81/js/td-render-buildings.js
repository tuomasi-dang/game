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
        },
        "emp_cannon": function (b, ctx, map, gs, gs2) {
            var target_position = b.getTargetPosition();
            // 炮台底座
            ctx.fillStyle = "#224";
            ctx.strokeStyle = "#000";
            ctx.beginPath();
            ctx.lineWidth = _TD.retina;
            ctx.arc(b.cx, b.cy, gs2 - 5, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            // 炮身
            ctx.fillStyle = "#0cf";
            ctx.beginPath();
            ctx.arc(b.cx, b.cy, gs2 - 12, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            // 炮管
            ctx.lineWidth = 5 * _TD.retina;
            ctx.strokeStyle = "#0ff";
            ctx.beginPath();
            ctx.moveTo(b.cx, b.cy);
            b.muzzle = lineTo2(ctx, b.cx, b.cy, target_position[0], target_position[1], gs2);
            ctx.closePath();
            ctx.stroke();
            // 电容线圈装饰
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 2 * _TD.retina;
            for (var i = 0; i < 3; i++) {
                var angle = Math.PI * 2 * i / 3;
                var x = b.cx + Math.cos(angle) * (gs2 - 8);
                var y = b.cy + Math.sin(angle) * (gs2 - 8);
                ctx.beginPath();
                ctx.arc(x, y, 4 * _TD.retina, 0, Math.PI * 2, true);
                ctx.closePath();
                ctx.stroke();
            }
        },
        "poison_tower": function (b, ctx, map, gs, gs2) {
            var target_position = b.getTargetPosition();
            // 渐变底座
            var grad = ctx.createRadialGradient(b.cx, b.cy, gs2 - 18, b.cx, b.cy, gs2 - 5);
            grad.addColorStop(0, "#b0ffb0");
            grad.addColorStop(0.7, "#393");
            grad.addColorStop(1, "#262");
            ctx.fillStyle = grad;
            ctx.strokeStyle = "#000";
            ctx.beginPath();
            ctx.lineWidth = _TD.retina;
            ctx.arc(b.cx, b.cy, gs2 - 5, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            // 罐体（带毒液符号）
            ctx.save();
            var grad2 = ctx.createLinearGradient(b.cx, b.cy - gs2 + 12, b.cx, b.cy + gs2 - 12);
            grad2.addColorStop(0, "#6f6");
            grad2.addColorStop(1, "#393");
            ctx.fillStyle = grad2;
            ctx.beginPath();
            ctx.arc(b.cx, b.cy, gs2 - 13, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = "#0f0";
            ctx.lineWidth = 2 * _TD.retina;
            ctx.stroke();
            ctx.restore();
            // 喷口（粗，带毒液滴）
            ctx.lineWidth = 8 * _TD.retina;
            ctx.strokeStyle = "#6f6";
            ctx.beginPath();
            ctx.moveTo(b.cx, b.cy);
            b.muzzle = lineTo2(ctx, b.cx, b.cy, target_position[0], target_position[1], gs2);
            ctx.closePath();
            ctx.stroke();
            // 喷口末端毒液滴
            ctx.save();
            ctx.fillStyle = "#8f8";
            ctx.beginPath();
            ctx.arc(b.muzzle[0], b.muzzle[1], 4 * _TD.retina, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.shadowColor = "#6f6";
            ctx.shadowBlur = 8 * _TD.retina;
            ctx.fill();
            ctx.restore();
            // 多层毒雾环
            for (var i = 0; i < 3; i++) {
                var r = gs2 - 8 + i * 4 * _TD.retina;
                ctx.save();
                ctx.strokeStyle = "rgba(100,255,100," + (0.18 - i * 0.05) + ")";
                ctx.lineWidth = (2 - i * 0.5) * _TD.retina;
                ctx.setLineDash([4, 4]);
                ctx.beginPath();
                ctx.arc(b.cx, b.cy, r, 0, Math.PI * 2, true);
                ctx.closePath();
                ctx.stroke();
                ctx.restore();
            }
            // 荧光点缀
            for (var j = 0; j < 5; j++) {
                var angle = Math.random() * Math.PI * 2;
                var rr = gs2 - 10 + Math.random() * 10 * _TD.retina;
                var x = b.cx + Math.cos(angle) * rr;
                var y = b.cy + Math.sin(angle) * rr;
                ctx.save();
                ctx.fillStyle = "rgba(180,255,180,0.7)";
                ctx.beginPath();
                ctx.arc(x, y, 1.5 * _TD.retina, 0, Math.PI * 2, true);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }
        },
        "missile_silo": function (b, ctx, map, gs, gs2) {
            var target_position = b.getTargetPosition();
            ctx.save();
            // 井口底座
            ctx.beginPath();
            ctx.arc(b.cx, b.cy, gs2 - 4, 0, Math.PI * 2, true);
            var grad = ctx.createRadialGradient(b.cx, b.cy, gs2 - 18, b.cx, b.cy, gs2 - 4);
            grad.addColorStop(0, "#222");
            grad.addColorStop(1, "#444");
            ctx.fillStyle = grad;
            ctx.fill();
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 2 * _TD.retina;
            ctx.stroke();
            // 金属井盖
            ctx.save();
            ctx.beginPath();
            ctx.arc(b.cx, b.cy, gs2 - 10, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fillStyle = "#888";
            ctx.globalAlpha = 0.7;
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.restore();
            // 红色警示灯
            ctx.save();
            ctx.beginPath();
            ctx.arc(b.cx, b.cy - gs2 * 0.7, 5 * _TD.retina, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fillStyle = "#f44";
            ctx.shadowColor = "#f44";
            ctx.shadowBlur = 10 * _TD.retina;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.restore();
            // 导弹弹头
            ctx.save();
            ctx.beginPath();
            ctx.ellipse(b.cx, b.cy, 7 * _TD.retina, 16 * _TD.retina, 0, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fillStyle = "#fff";
            ctx.shadowColor = "#fff";
            ctx.shadowBlur = 8 * _TD.retina;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.strokeStyle = "#888";
            ctx.lineWidth = 2 * _TD.retina;
            ctx.beginPath();
            ctx.moveTo(b.cx, b.cy + 16 * _TD.retina);
            ctx.lineTo(b.cx, b.cy + 22 * _TD.retina);
            ctx.stroke();
            ctx.restore();
            // 动态井口高光
            var t = Date.now() / 600;
            ctx.save();
            ctx.translate(b.cx, b.cy);
            ctx.rotate(t % (Math.PI * 2));
            ctx.strokeStyle = "rgba(255,255,255,0.18)";
            ctx.lineWidth = 7 * _TD.retina;
            ctx.beginPath();
            ctx.arc(0, 0, gs2 - 7, Math.PI * 0.1, Math.PI * 0.45, false);
            ctx.stroke();
            ctx.restore();
            // 井盖分割线
            ctx.strokeStyle = "#444";
            ctx.lineWidth = 1.5 * _TD.retina;
            ctx.beginPath();
            ctx.moveTo(b.cx - gs2 + 8, b.cy);
            ctx.lineTo(b.cx + gs2 - 8, b.cy);
            ctx.stroke();
            ctx.restore();
        },
        "energy_absorber": function (b, ctx, map, gs, gs2) {
            // 能量基座
            ctx.save();
            ctx.beginPath();
            ctx.arc(b.cx, b.cy, gs2 - 4, 0, Math.PI * 2, true);
            var grad = ctx.createRadialGradient(b.cx, b.cy, gs2 - 16, b.cx, b.cy, gs2 - 4);
            grad.addColorStop(0, "#223366");
            grad.addColorStop(1, "#0ff");
            ctx.fillStyle = grad;
            ctx.fill();
            // 发光吸收核心
            ctx.beginPath();
            ctx.arc(b.cx, b.cy, gs2 * 0.45, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.shadowColor = "#0ff";
            ctx.shadowBlur = 16 * _TD.retina;
            ctx.fillStyle = "#66ffff";
            ctx.globalAlpha = 0.85;
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
            // 旋转能量环
            var t = Date.now() / 400;
            ctx.save();
            ctx.translate(b.cx, b.cy);
            ctx.rotate(t % (Math.PI * 2));
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 3 * _TD.retina;
            ctx.globalAlpha = 0.7;
            ctx.beginPath();
            ctx.ellipse(0, 0, gs2 * 0.7, gs2 * 0.35, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
            ctx.restore();
            // 能量吸收符号
            ctx.save();
            ctx.strokeStyle = "#0ff";
            ctx.lineWidth = 2 * _TD.retina;
            ctx.beginPath();
            ctx.moveTo(b.cx, b.cy - gs2 * 0.3);
            ctx.lineTo(b.cx, b.cy + gs2 * 0.3);
            ctx.moveTo(b.cx - gs2 * 0.18, b.cy + gs2 * 0.1);
            ctx.lineTo(b.cx, b.cy + gs2 * 0.3);
            ctx.lineTo(b.cx + gs2 * 0.18, b.cy + gs2 * 0.1);
            ctx.stroke();
            ctx.restore();
            ctx.restore();
        },
        "summon_tower": function (b, ctx, map, gs, gs2) {
            // 魔法阵底座
            ctx.save();
            var grad = ctx.createRadialGradient(b.cx, b.cy, gs2 * 0.2, b.cx, b.cy, gs2 - 2);
            grad.addColorStop(0, "#fff6");
            grad.addColorStop(0.5, "#a0f");
            grad.addColorStop(1, "#313");
            ctx.beginPath();
            ctx.arc(b.cx, b.cy, gs2 - 2, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fillStyle = grad;
            ctx.shadowColor = "#a0f";
            ctx.shadowBlur = 12 * _TD.retina;
            ctx.globalAlpha = 0.92;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
            // 魔法阵符文
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 2 * _TD.retina;
            for (var i = 0; i < 6; i++) {
                var angle = Math.PI * 2 * i / 6;
                ctx.beginPath();
                ctx.arc(b.cx + Math.cos(angle) * (gs2 * 0.7), b.cy + Math.sin(angle) * (gs2 * 0.7), 4 * _TD.retina, 0, Math.PI * 2);
                ctx.stroke();
            }
            // 传送门拱门
            ctx.strokeStyle = "#a0f";
            ctx.lineWidth = 5 * _TD.retina;
            ctx.beginPath();
            ctx.arc(b.cx, b.cy, gs2 * 0.7, Math.PI * 0.2, Math.PI * 0.8, false);
            ctx.stroke();
            // 旋转能量球
            var t = Date.now() / 500;
            ctx.save();
            ctx.translate(b.cx, b.cy - gs2 * 0.3);
            ctx.rotate(t % (Math.PI * 2));
            ctx.beginPath();
            ctx.arc(0, 0, gs2 * 0.22, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fillStyle = "#fff";
            ctx.shadowColor = "#a0f";
            ctx.shadowBlur = 16 * _TD.retina;
            ctx.globalAlpha = 0.85;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
            ctx.restore();
            // 顶部魔法水晶
            ctx.beginPath();
            ctx.arc(b.cx, b.cy - gs2 * 0.7, gs2 * 0.13, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fillStyle = "#a0f";
            ctx.shadowColor = "#fff";
            ctx.shadowBlur = 8 * _TD.retina;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.restore();
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
