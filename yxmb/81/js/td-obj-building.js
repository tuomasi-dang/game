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

	// building 对象的属性、方法。注意属性中不要有数组、对象等
	// 引用属性，否则多个实例的相关属性会发生冲突
	var building_obj = {
		_init: function (cfg) {
			this.is_selected = false;
			this.level = 0;
			this.killed = 0; // 当前建筑杀死了多少怪物
			this.target = null;

			cfg = cfg || {};
			this.map = cfg.map || null;
			this.grid = cfg.grid || null;

			/**
			 * 子弹类型，可以有以下类型：
			 *         1：普通子弹
			 *         2：激光类，发射后马上命中，暂未实现
			 *         3：导弹类，击中后会爆炸，带来面攻击，暂未实现
			 */
			this.bullet_type = cfg.bullet_type || 1;

			/**
			 * type 可能的值有：
			 *         "wall": 墙壁，没有攻击性
			 *         "cannon": 炮台
			 *         "LMG": 轻机枪
			 *         "HMG": 重机枪
			 *         "laser_gun": 激光枪
			 *
			 */
			this.type = cfg.type;

			this.speed = cfg.speed;
			this.bullet_speed = cfg.bullet_speed;
			this.is_pre_building = !!cfg.is_pre_building;
			this.blink = this.is_pre_building;
			this.wait_blink = this._default_wait_blink = 20;
			this.is_weapon = (this.type != "wall"); // 墙等不可攻击的建筑此项为 false ，其余武器此项为 true

			var o = TD.getDefaultBuildingAttributes(this.type);
			TD.lang.mix(this, o);
			this.range_px = this.range * TD.grid_size;
			this.money = this.cost; // 购买、升级本建筑已花费的钱

			this.caculatePos();
		},

		/**
		 * 升级本建筑需要的花费
		 */
		getUpgradeCost: function () {
			return Math.floor(this.money * 0.75);
		},

		/**
		 * 出售本建筑能得到多少钱
		 */
		getSellMoney: function () {
			return Math.floor(this.money * 0.5) || 1;
		},

		/**
		 * 切换选中 / 未选中状态
		 */
		toggleSelected: function () {
			this.is_selected = !this.is_selected;
			this.grid.hightLight(this.is_selected); // 高亮
			var _this = this;

			if (this.is_selected) {
				// 如果当前建筑被选中

				this.map.eachBuilding(function (obj) {
					obj.is_selected = obj == _this;
				});
				// 取消另一个地图中选中建筑的选中状态
				(
					this.map.is_main_map ? this.scene.panel_map : this.scene.map
				).eachBuilding(function (obj) {
						obj.is_selected = false;
						obj.grid.hightLight(false);
					});
				this.map.selected_building = this;

				if (!this.map.is_main_map) {
					// 在面版地图中选中了建筑，进入建筑模式
					this.scene.map.preBuild(this.type);
				} else {
					// 取消建筑模式
					this.scene.map.cancelPreBuild();
				}

			} else {
				// 如果当前建筑切换为未选中状态

				if (this.map.selected_building == this)
					this.map.selected_building = null;

				if (!this.map.is_main_map) {
					// 取消建筑模式
					this.scene.map.cancelPreBuild();
				}
			}

			// 如果是选中 / 取消选中主地图上的建筑，显示 / 隐藏对应的操作按钮
			if (this.map.is_main_map) {
				if (this.map.selected_building) {
					this.scene.panel.btn_upgrade.show();
					this.scene.panel.btn_sell.show();
					this.updateBtnDesc();
				} else {
					this.scene.panel.btn_upgrade.hide();
					this.scene.panel.btn_sell.hide();
				}
			}
		},

		/**
		 * 生成、更新升级按钮的说明文字
		 */
		updateBtnDesc: function () {
			this.scene.panel.btn_upgrade.desc = TD._t(
				"upgrade", [
					TD._t("building_name_" + this.type),
					this.level + 1,
					this.getUpgradeCost()
				]);
			this.scene.panel.btn_sell.desc = TD._t(
				"sell", [
					TD._t("building_name_" + this.type),
					this.getSellMoney()
				]);
		},

		/**
		 * 将本建筑放置到一个格子中
		 * @param grid {Element} 指定格子
		 */
		locate: function (grid) {
			this.grid = grid;
			this.map = grid.map;
			this.cx = this.grid.cx;
			this.cy = this.grid.cy;
			this.x = this.grid.x;
			this.y = this.grid.y;
			this.x2 = this.grid.x2;
			this.y2 = this.grid.y2;
			this.width = this.grid.width;
			this.height = this.grid.height;

			this.px = this.x + 0.5;
			this.py = this.y + 0.5;

			this.wait_blink = this._default_wait_blink;
			this._fire_wait = Math.floor(Math.max(2 / (this.speed * TD.global_speed), 1));
			this._fire_wait2 = this._fire_wait;

		},

		/**
		 * 将本建筑彻底删除
		 */
		remove: function () {
//			TD.log("remove building #" + this.id + ".");
			if (this.grid && this.grid.building && this.grid.building == this)
				this.grid.building = null;
			this.hide();
			this.del();
		},

		/**
		 * 寻找一个目标（怪物）
		 */
		findTaget: function () {
			if (!this.is_weapon || this.is_pre_building || !this.grid) return;

			var cx = this.cx, cy = this.cy,
				range2 = Math.pow(this.range_px, 2);

			// 如果当前建筑有目标，并且目标还是有效的，并且目标仍在射程内
			if (this.target && this.target.is_valid &&
				Math.pow(this.target.cx - cx, 2) + Math.pow(this.target.cy - cy, 2) <= range2)
				return;

			// 在进入射程的怪物中寻找新的目标
			this.target = TD.lang.any(
				TD.lang.rndSort(this.map.monsters), // 将怪物随机排序
				function (obj) {
					return Math.pow(obj.cx - cx, 2) + Math.pow(obj.cy - cy, 2) <= range2;
				});
		},

		/**
		 * 取得目标的坐标（相对于地图左上角）
		 */
		getTargetPosition: function () {
			if (!this.target) {
				// 以 entrance 为目标
				var grid = this.map.is_main_map ? this.map.entrance : this.grid;
				return [grid.cx, grid.cy];
			}
			return [this.target.cx, this.target.cy];
		},

		/**
		 * 向自己的目标开火
		 */
		fire: function () {
			if (this.type == "summon_tower") {
				var attr = TD.getDefaultBuildingAttributes("summon_tower");
				this._minions = this._minions || [];
				// 清理无效小兵
				this._minions = this._minions.filter(function(m){ return m && m.is_valid; });
				if (this._minions.length >= attr.summon_count) return;
				// 召唤间隔控制
				var now = TD.now || (new Date()).getTime();
				if (!this._last_summon_time) this._last_summon_time = 0;
				if (now - this._last_summon_time < (attr.summon_interval * 1000 / ((typeof TD.exp_fps === 'number' && TD.exp_fps > 0) ? TD.exp_fps : 24))) return;
				this._last_summon_time = now;
				// 召唤小兵
				var minion = new TD.Minion(null, {
					x: this.cx,
					y: this.cy,
					map: this.map,
					scene: this.grid.scene,
					color: "#8cf",
					step_level: 1,
					render_level: 6
				});
				this._minions.push(minion);
				return;
			}

			if (this.type == "missile_silo") {
				if (!this.target || !this.target.is_valid) return;
				var muzzle = this.muzzle || [this.cx, this.cy];
				new TD.MissileBullet(null, {
					building: this,
					damage: this.damage,
					target: this.target,
					speed: this.bullet_speed,
					x: muzzle[0],
					y: muzzle[1]
				});
				return;
			}

			if (this.type == "ice_tower") {
				var b = this;
				var range2 = Math.pow(this.range_px, 2);
				var iceAttr = TD.getDefaultBuildingAttributes("ice_tower");
				var now = TD.now || (new Date()).getTime();
				var affected = false;
				this.map.eachMonster(function (monster) {
					if (!monster.is_valid) return;
					var dx = monster.cx - b.cx;
					var dy = monster.cy - b.cy;
					if (dx * dx + dy * dy <= range2) {
						monster.beHit(b, b.damage);
						monster.is_frozen = true;
						monster.freeze_duration = iceAttr.freeze_duration;
						monster.speed = monster.original_speed * iceAttr.freeze_factor;
						affected = true;
					}
				});
				if (affected) {
					this.last_freeze_time = now;
					TD.IceWave && TD.IceWave("icewave-" + this.id + "-" + now, {
						cx: this.cx,
						cy: this.cy,
						r0: this.range_px * 0.5,
						r1: this.range_px,
						time: 0.4,
						scene: this.grid.scene
					});
				}
				return;
			}

			if (this.type == "emp_cannon") {
				// EMP炮：连锁攻击
				if (!this.target || !this.target.is_valid) return;
				var b = this;
				var attr = TD.getDefaultBuildingAttributes("emp_cannon");
				var chain_count = attr.chain_count || 3;
				var chain_range = (attr.chain_range || 3) * TD.grid_size;
				var hit_list = [];
				var current = this.target;
				hit_list.push(current);
				for (var i = 1; i < chain_count; i++) {
					// 在剩余怪物中找距离current最近的
					var min_dist = Infinity, next = null;
					b.map.eachMonster(function (m) {
						if (!m.is_valid || hit_list.indexOf(m) !== -1) return;
						var dx = m.cx - current.cx;
						var dy = m.cy - current.cy;
						var dist = dx * dx + dy * dy;
						if (dist <= chain_range * chain_range && dist < min_dist) {
							min_dist = dist;
							next = m;
						}
					});
					if (next) {
						hit_list.push(next);
						current = next;
					} else {
						break;
					}
				}
				// 依次造成伤害并画连锁特效
				var muzzle = this.muzzle || [this.cx, this.cy];
				var last_pos = muzzle;
				for (var j = 0; j < hit_list.length; j++) {
					var m = hit_list[j];
					m.beHit(this, this.damage);
					// 画连锁线特效（连锁跳跃）
					if (j === 0) {
						TD.EMPChain && TD.EMPChain("empchain-" + this.id + "-" + m.id + "-0", {
							x0: last_pos[0], y0: last_pos[1], x1: m.cx, y1: m.cy, scene: this.grid.scene
						});
					} else {
						TD.EMPChain && TD.EMPChain("empchain-" + this.id + "-" + m.id + "-" + j, {
							x0: last_pos[0], y0: last_pos[1], x1: m.cx, y1: m.cy, scene: this.grid.scene
						});
					}
					// 新增：每个目标都与炮台本身画一条电流
					if (j > 0) {
						TD.EMPChain && TD.EMPChain("empchain-center-" + this.id + "-" + m.id + "-" + j, {
							x0: this.cx, y0: this.cy, x1: m.cx, y1: m.cy, scene: this.grid.scene
						});
					}
					last_pos = [m.cx, m.cy];
				}
				return;
			}

			if (!this.target || !this.target.is_valid) return;

			if (this.type == "laser_gun") {
				// 如果是激光枪，目标立刻被击中
				this.target.beHit(this, this.damage);
				return;
			}

			if (this.type == "poison_tower") {
				var b = this;
				var range2 = Math.pow(this.range_px, 2);
				var attr = TD.getDefaultBuildingAttributes("poison_tower");
				// 收集范围内所有怪物
				var candidates = [];
				this.map.eachMonster(function (monster) {
					if (!monster.is_valid) return;
					var dx = monster.cx - b.cx;
					var dy = monster.cy - b.cy;
					if (dx * dx + dy * dy <= range2) {
						candidates.push(monster);
					}
				});
				if (candidates.length === 0) {
					this._last_poison_effect = false;
					return;
				}
				// 随机选一个
				var idx = Math.floor(Math.random() * candidates.length);
				var target = candidates[idx];
				var spray_angle = Math.atan2(target.cy - this.cy, target.cx - this.cx);
				// 发射水滴状毒液子弹
				var muzzle = this.muzzle || [this.cx, this.cy];
				new TD.PoisonBullet(null, {
					building: this,
					damage: this.damage,
					target: target,
					speed: this.bullet_speed,
					x: muzzle[0],
					y: muzzle[1],
					poison_damage: attr.poison_damage,
					poison_duration: attr.poison_duration
				});
				this._last_poison_spray_angle = spray_angle;
				this._last_poison_effect = true;
				this._last_poison_target = target;
				return;
			}

			if (this.type == "energy_absorber") {
				var b = this;
				var range2 = Math.pow(this.range_px, 2);
				var attr = TD.getDefaultBuildingAttributes("energy_absorber");
				// 收集范围内所有怪物
				var candidates = [];
				this.map.eachMonster(function (monster) {
					if (!monster.is_valid) return;
					var dx = monster.cx - b.cx;
					var dy = monster.cy - b.cy;
					if (dx * dx + dy * dy <= range2) {
						candidates.push(monster);
					}
				});
				if (candidates.length === 0) return;
				// 随机选一个
				var idx = Math.floor(Math.random() * candidates.length);
				var target = candidates[idx];
				// 造成伤害
				var real_damage = Math.min(target.life, this.damage);
				target.beHit(this, this.damage);
				// 吸收部分转为金钱
				var gain = Math.floor(real_damage * attr.absorb_ratio);
				if (gain > 0) TD.money += gain;
				// 生成吸收特效（简化，防止卡死）
				if (TD._absorb_count === undefined) TD._absorb_count = 0;
				var MAX_ABSORB_EFFECT = 12;
				if (TD._absorb_count < MAX_ABSORB_EFFECT) {
					TD._absorb_count++;
					var scene = this.grid.scene;
					var effect = new TD.Element("absorb-" + Math.random(), {});
					effect.is_valid = true;
					effect.is_visiable = true;
					effect.wait = Math.floor(TD.exp_fps * 0.32);
					effect.cx = target.cx;
					effect.cy = target.cy;
					effect.tx = this.cx;
					effect.ty = this.cy;
					effect.step = function() {
						this.wait--;
						if (this.wait <= 0) { this.is_valid = false; TD._absorb_count--; }
					};
					effect.render = function() {
						if (!this.is_valid) return;
						var ctx = TD.ctx;
						ctx.save();
						// 主吸收线
						ctx.strokeStyle = "#0ff";
						ctx.lineWidth = 4 * _TD.retina;
						ctx.globalAlpha = 0.85;
						ctx.beginPath();
						ctx.moveTo(this.cx, this.cy);
						ctx.lineTo(this.tx, this.ty);
						ctx.stroke();
						// 动态流动副线
						var t = Date.now() / 120;
						for (var i = 0; i < 2; i++) {
							ctx.beginPath();
							ctx.moveTo(this.cx, this.cy);
							var midx = (this.cx + this.tx) / 2 + Math.sin(t + i) * 10;
							var midy = (this.cy + this.ty) / 2 + Math.cos(t + i) * 10;
							ctx.quadraticCurveTo(midx, midy, this.tx, this.ty);
							ctx.strokeStyle = i === 0 ? "#6ff" : "#fff";
							ctx.lineWidth = 2 * _TD.retina;
							ctx.globalAlpha = 0.5;
							ctx.stroke();
						}
						// 粒子头部
						var p = this.wait / Math.floor(TD.exp_fps * 0.32);
						var px = this.cx + (this.tx - this.cx) * (1 - p);
						var py = this.cy + (this.ty - this.cy) * (1 - p);
						ctx.beginPath();
						ctx.arc(px, py, 7 * _TD.retina, 0, Math.PI * 2, true);
						ctx.closePath();
						ctx.fillStyle = "#aff";
						ctx.globalAlpha = 0.7;
						ctx.shadowColor = "#fff";
						ctx.shadowBlur = 12 * _TD.retina;
						ctx.fill();
						ctx.shadowBlur = 0;
						ctx.globalAlpha = 1;
						ctx.restore();
					};
					scene.addElement(effect, 1, 7);
				}
				return;
			}

			var muzzle = this.muzzle || [this.cx, this.cy], // 炮口的位置
				cx = muzzle[0],
				cy = muzzle[1];

			new TD.Bullet(null, {
				building: this,
				damage: this.damage,
				target: this.target,
				speed: this.bullet_speed,
				x: cx,
				y: cy
			});
		},

		tryToFire: function () {
			if (!this.is_weapon || !this.target)
				return;

			this._fire_wait--;
			if (this._fire_wait > 0) {
//			return;
			} else if (this._fire_wait < 0) {
				this._fire_wait = this._fire_wait2;
			} else {
				// 只在真正攻击触发时生成特效
				if (this.type == "poison_tower") {
					var now = TD.now || (new Date()).getTime();
					this.fire(); // 先执行伤害和状态
					if (this._last_poison_effect && this._last_poison_target) {
						TD.PoisonCloud && TD.PoisonCloud("poisoncloud-spray-" + this.id + "-" + now, {
							cx: this.cx,
							cy: this.cy,
							r: this.range_px,
							scene: this.grid.scene,
							angle: this._last_poison_spray_angle,
							mode: "spray",
							time: 0.22
						});
						TD.PoisonCloud && TD.PoisonCloud("poisoncloud-" + this.id + "-" + now, {
							cx: this.cx,
							cy: this.cy,
							r: this.range_px,
							scene: this.grid.scene,
							mode: "cloud",
							time: 0.5
						});
					}
					return;
				}
				this.fire();
			}
		},

		_upgrade2: function (k) {
			if (!this._upgrade_records[k])
				this._upgrade_records[k] = this[k];
			var v = this._upgrade_records[k],
				mk = "max_" + k,
				uk = "_upgrade_rule_" + k,
				uf = this[uk] || TD.default_upgrade_rule;
			if (!v || isNaN(v)) return;

			v = uf(this.level, v);
			if (this[mk] && !isNaN(this[mk]) && this[mk] < v)
				v = this[mk];
			this._upgrade_records[k] = v;
			this[k] = Math.floor(v);
		},

		/**
		 * 升级建筑
		 */
		upgrade: function () {
			if (!this._upgrade_records)
				this._upgrade_records = {};

			var attrs = [
				// 可升级的变量
				"damage", "range", "speed", "life", "shield"
			], i, l = attrs.length;
			for (i = 0; i < l; i++)
				this._upgrade2(attrs[i]);
			this.level++;
			this.range_px = this.range * TD.grid_size;
		},

		tryToUpgrade: function (btn) {
			var cost = this.getUpgradeCost(),
				msg = "";
			if (cost > TD.money) {
				msg = TD._t("not_enough_money", [cost]);
			} else {
				TD.money -= cost;
				this.money += cost;
				this.upgrade();
				msg = TD._t("upgrade_success", [
					TD._t("building_name_" + this.type), this.level,
					this.getUpgradeCost()
				]);
			}

			this.updateBtnDesc();
			this.scene.panel.balloontip.msg(msg, btn);
		},

		tryToSell: function () {
			if (!this.is_valid) return;

			TD.money += this.getSellMoney();
			this.grid.removeBuilding();
			this.is_valid = false;
			this.map.selected_building = null;
			this.map.select_hl.hide();
			this.map.checkHasWeapon();
			this.scene.panel.btn_upgrade.hide();
			this.scene.panel.btn_sell.hide();
			this.scene.panel.balloontip.hide();
		},

		step: function () {
			if (this.blink) {
				this.wait_blink--;
				if (this.wait_blink < -this._default_wait_blink)
					this.wait_blink = this._default_wait_blink;
			}

			this.findTaget();
			this.tryToFire();
		},

		render: function () {
			if (!this.is_visiable || this.wait_blink < 0) return;

			var ctx = TD.ctx;

			TD.renderBuilding(this);

			if (
				this.map.is_main_map &&
				(
					this.is_selected || (this.is_pre_building) ||
					this.map.show_all_ranges
				) &&
				this.is_weapon && this.range > 0 && this.grid
			) {
				// 画射程
				ctx.lineWidth = _TD.retina;
				ctx.fillStyle = "rgba(187, 141, 32, 0.15)";
				ctx.strokeStyle = "#bb8d20";
				ctx.beginPath();
				ctx.arc(this.cx, this.cy, this.range_px, 0, Math.PI * 2, true);
				ctx.closePath();
				ctx.fill();
				ctx.stroke();
			}

			if (this.type == "laser_gun" && this.target && this.target.is_valid) {
				// 画激光
				ctx.lineWidth = 3 * _TD.retina;
				ctx.strokeStyle = "rgba(50, 50, 200, 0.5)";
				ctx.beginPath();
				ctx.moveTo(this.cx, this.cy);
				ctx.lineTo(this.target.cx, this.target.cy);
				ctx.closePath();
				ctx.stroke();
				ctx.lineWidth = _TD.retina;
				ctx.strokeStyle = "rgba(150, 150, 255, 0.5)";
				ctx.beginPath();
				ctx.lineTo(this.cx, this.cy);
				ctx.closePath();
				ctx.stroke();
			}
		},

		onEnter: function () {
			if (this.is_pre_building) return;

			var msg = "建筑工事";
			if (this.map.is_main_map) {
				msg = TD._t("building_info" + (this.type == "wall" ? "_wall" : ""), [TD._t("building_name_" + this.type), this.level, this.damage, this.speed, this.range, this.killed]);
			} else {
				msg = TD._t("building_intro_" + this.type, [TD.getDefaultBuildingAttributes(this.type).cost]);
			}

			this.scene.panel.balloontip.msg(msg, this.grid);
		},

		onOut: function () {
			if (this.scene.panel.balloontip.el == this.grid) {
				this.scene.panel.balloontip.hide();
			}
		},

		onClick: function () {
			if (this.is_pre_building || this.scene.state != 1) return;
			this.toggleSelected();
		}
	};

	/**
	 * @param id {String}
	 * @param cfg {object} 配置对象
	 *         至少需要包含以下项：
	 *         {
	 *			 type: 建筑类型，可选的值有
	 *				 "wall"
	 *				 "cannon"
	 *				 "LMG"
	 *				 "HMG"
	 *				 "laser_gun"
	 *		 }
	 */
	TD.Building = function (id, cfg) {
		cfg.on_events = ["enter", "out", "click"];
		var building = new TD.Element(id, cfg);
		TD.lang.mix(building, building_obj);
		building._init(cfg);

		return building;
	};


	// bullet 对象的属性、方法。注意属性中不要有数组、对象等
	// 引用属性，否则多个实例的相关属性会发生冲突
	var bullet_obj = {
		_init: function (cfg) {
			cfg = cfg || {};

			this.speed = cfg.speed;
			this.damage = cfg.damage;
			this.target = cfg.target;
			this.cx = cfg.x;
			this.cy = cfg.y;
			this.r = cfg.r || Math.max(Math.log(this.damage), 2);
			if (this.r < 1) this.r = 1;
			if (this.r > 6) this.r = 6;

			this.building = cfg.building || null;
			this.map = cfg.map || this.building.map;
			this.type = cfg.type || 1;
			this.color = cfg.color || "#000";

			this.map.bullets.push(this);
			this.addToScene(this.map.scene, 1, 6);

			if (this.type == 1) {
				this.caculate();
			}
		},

		/**
		 * 计算子弹的一些数值
		 */
		caculate: function () {
			var sx, sy, c,
				tx = this.target.cx,
				ty = this.target.cy,
				speed;
			sx = tx - this.cx;
			sy = ty - this.cy;
			c = Math.sqrt(Math.pow(sx, 2) + Math.pow(sy, 2));
			speed = 20 * this.speed * TD.global_speed;
			this.vx = sx * speed / c;
			this.vy = sy * speed / c;
		},

		/**
		 * 检查当前子弹是否已超出地图范围
		 */
		checkOutOfMap: function () {
			this.is_valid = !(
				this.cx < this.map.x ||
				this.cx > this.map.x2 ||
				this.cy < this.map.y ||
				this.cy > this.map.y2
			);

			return !this.is_valid;
		},

		/**
		 * 检查当前子弹是否击中了怪物
		 */
		checkHit: function () {
			var cx = this.cx,
				cy = this.cy,
				r = this.r * _TD.retina,
				monster = this.map.anyMonster(function (obj) {
					return Math.pow(obj.cx - cx, 2) + Math.pow(obj.cy - cy, 2) <= Math.pow(obj.r + r, 2) * 2;
				});

			if (monster) {
				// 击中的怪物
				monster.beHit(this.building, this.damage);
				this.is_valid = false;

				// 子弹小爆炸效果
				TD.Explode(this.id + "-explode", {
					cx: this.cx,
					cy: this.cy,
					r: this.r,
					step_level: this.step_level,
					render_level: this.render_level,
					color: this.color,
					scene: this.map.scene,
					time: 0.2
				});

				return true;
			}
			return false;
		},

		step: function () {
			if (this.checkOutOfMap() || this.checkHit()) return;

			this.cx += this.vx;
			this.cy += this.vy;
		},

		render: function () {
			var ctx = TD.ctx;
			ctx.fillStyle = this.color;
			ctx.beginPath();
			ctx.arc(this.cx, this.cy, this.r, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.fill();
		}
	};

	/**
	 * @param id {String} 配置对象
	 * @param cfg {Object} 配置对象
	 *         至少需要包含以下项：
	 *         {
	 *			 x: 子弹发出的位置
	 *			 y: 子弹发出的位置
	 *			 speed:
	 *			 damage:
	 *			 target: 目标，一个 monster 对象
	 *			 building: 所属的建筑
	 *		 }
	 * 子弹类型，可以有以下类型：
	 *         1：普通子弹
	 *         2：激光类，发射后马上命中
	 *         3：导弹类，击中后会爆炸，带来面攻击
	 */
	TD.Bullet = function (id, cfg) {
		var bullet = new TD.Element(id, cfg);
		TD.lang.mix(bullet, bullet_obj);
		bullet._init(cfg);

		return bullet;
	};

	// 冰霜塔波纹特效对象
	var ice_wave_obj = {
		_init: function(cfg) {
			cfg = cfg || {};
			this.cx = cfg.cx;
			this.cy = cfg.cy;
			this.r0 = cfg.r0 || 0; // 起始半径
			this.r1 = cfg.r1 || 0; // 终止半径
			this.r = this.r0;
			this.color = cfg.color || "rgba(150,200,255,0.3)";
			this.time = cfg.time || 0.5; // 持续时间（秒）
			this.wait = this.wait0 = Math.max(1, Math.floor(TD.exp_fps * this.time));
			this.step_level = cfg.step_level || 1;
			this.render_level = cfg.render_level || 6;
			this.scene = cfg.scene;
			this.is_valid = true;
			this.is_visiable = true;
			if (this.scene) this.scene.addElement(this, this.step_level, this.render_level);
		},
		step: function() {
			if (!this.is_valid) return;
			this.wait--;
			var p = 1 - this.wait / this.wait0;
			this.r = this.r0 + (this.r1 - this.r0) * p;
			if (this.wait <= 0) this.is_valid = false;
		},
		render: function() {
			if (!this.is_visiable) return;
			var ctx = TD.ctx;
			var alpha = Math.max(0, 0.3 * this.wait / this.wait0);
			ctx.save();
			ctx.strokeStyle = "rgba(150,200,255," + alpha + ")";
			ctx.lineWidth = 4 * _TD.retina;
			ctx.beginPath();
			ctx.arc(this.cx, this.cy, this.r, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.stroke();
			ctx.restore();
		}
	};

	/**
	 * 创建冰霜塔波纹特效
	 * @param id {String}
	 * @param cfg {Object} 需包含 cx, cy, r0, r1, scene
	 */
	TD.IceWave = function(id, cfg) {
		var wave = new TD.Element(id, cfg);
		TD.lang.mix(wave, ice_wave_obj);
		wave._init(cfg);
		return wave;
	};

	// EMP炮连锁攻击特效对象
	var emp_chain_obj = {
		_init: function(cfg) {
			cfg = cfg || {};
			this.x0 = cfg.x0;
			this.y0 = cfg.y0;
			this.x1 = cfg.x1;
			this.y1 = cfg.y1;
			this.time = cfg.time || 0.18;
			this.wait = this.wait0 = Math.max(1, Math.floor(TD.exp_fps * this.time));
			this.scene = cfg.scene;
			this.is_valid = true;
			this.is_visiable = true;
			if (this.scene) this.scene.addElement(this, 1, 7);
			// 生成闪电链的抖动点
			this.points = [];
			var n = 6;
			for (var i = 1; i < n; i++) {
				var t = i / n;
				var px = this.x0 + (this.x1 - this.x0) * t + (Math.random() - 0.5) * 12;
				var py = this.y0 + (this.y1 - this.y0) * t + (Math.random() - 0.5) * 12;
				this.points.push([px, py]);
			}
		},
		step: function() {
			if (!this.is_valid) return;
			this.wait--;
			if (this.wait <= 0) this.is_valid = false;
		},
		render: function() {
			if (!this.is_visiable) return;
			var ctx = TD.ctx;
			var alpha = Math.max(0, 0.7 * this.wait / this.wait0);
			ctx.save();
			ctx.strokeStyle = "rgba(0,255,255," + alpha + ")";
			ctx.lineWidth = 3 * _TD.retina;
			ctx.beginPath();
			ctx.moveTo(this.x0, this.y0);
			for (var i = 0; i < this.points.length; i++) {
				ctx.lineTo(this.points[i][0], this.points[i][1]);
			}
			ctx.lineTo(this.x1, this.y1);
			ctx.stroke();
			ctx.restore();
		}
	};

	/**
	 * 创建EMP连锁攻击特效
	 * @param id {String}
	 * @param cfg {Object} 需包含 x0, y0, x1, y1, scene
	 */
	TD.EMPChain = function(id, cfg) {
		var chain = new TD.Element(id, cfg);
		TD.lang.mix(chain, emp_chain_obj);
		chain._init(cfg);
		return chain;
	};

	// 优化版毒雾喷射塔毒雾特效对象
	var poison_cloud_obj = {
		_init: function(cfg) {
			cfg = cfg || {};
			this.cx = cfg.cx;
			this.cy = cfg.cy;
			this.r = cfg.r || 40;
			this.time = cfg.time || 0.5;
			this.wait = this.wait0 = Math.max(1, Math.floor(TD.exp_fps * this.time));
			this.scene = cfg.scene;
			this.angle = cfg.angle || 0; // 喷射方向
			this.is_valid = true;
			this.is_visiable = true;
			this.mode = cfg.mode || "cloud"; // "spray" or "cloud"
			this.particles = [];
			if (this.mode === "spray") {
				// 生成喷射粒子
				var count = 8;
				for (var i = 0; i < count; i++) {
					var a = this.angle + (Math.random() - 0.5) * Math.PI / 6;
					var d = this.r * (0.5 + Math.random() * 0.5);
					this.particles.push({
						x: this.cx,
						y: this.cy,
						dx: Math.cos(a) * d / this.wait0,
						dy: Math.sin(a) * d / this.wait0,
						r: 2 + Math.random() * 2,
						color: Math.random() > 0.5 ? "#8f8" : "#6f6"
					});
				}
			}
			if (this.scene) this.scene.addElement(this, 1, 6);
		},
		step: function() {
			if (!this.is_valid) return;
			this.wait--;
			if (this.mode === "spray") {
				for (var i = 0; i < this.particles.length; i++) {
					this.particles[i].x += this.particles[i].dx;
					this.particles[i].y += this.particles[i].dy;
				}
			}
			if (this.wait <= 0) this.is_valid = false;
		},
		render: function() {
			if (!this.is_visiable) return;
			var ctx = TD.ctx;
			var alpha = Math.max(0, 0.22 * this.wait / this.wait0);
			ctx.save();
			if (this.mode === "spray") {
				// 扇形雾带
				ctx.beginPath();
				ctx.moveTo(this.cx, this.cy);
				ctx.arc(this.cx, this.cy, this.r * 0.7, this.angle - Math.PI / 7, this.angle + Math.PI / 7, false);
				ctx.closePath();
				ctx.fillStyle = "rgba(100,255,100," + (alpha * 0.7) + ")";
				ctx.fill();
				// 粒子
				for (var i = 0; i < this.particles.length; i++) {
					var p = this.particles[i];
					ctx.beginPath();
					ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, true);
					ctx.closePath();
					ctx.fillStyle = p.color;
					ctx.globalAlpha = alpha * 0.8;
					ctx.fill();
				}
				ctx.globalAlpha = 1;
			} else {
				// 大范围毒雾云
				ctx.fillStyle = "rgba(100,255,100," + alpha + ")";
				ctx.beginPath();
				ctx.arc(this.cx, this.cy, this.r, 0, Math.PI * 2, true);
				ctx.closePath();
				ctx.fill();
				// 锯齿边缘
				for (var j = 0; j < 12; j++) {
					var a = Math.PI * 2 * j / 12 + Math.random() * 0.2;
					var rr = this.r * (0.92 + Math.random() * 0.12);
					ctx.beginPath();
					ctx.arc(this.cx + Math.cos(a) * rr, this.cy + Math.sin(a) * rr, 3 + Math.random() * 2, 0, Math.PI * 2, true);
					ctx.closePath();
					ctx.fillStyle = "rgba(100,255,100," + (alpha * 0.5) + ")";
					ctx.fill();
				}
			}
			ctx.restore();
		}
	};

	/**
	 * 创建毒雾喷射塔毒雾特效
	 * @param id {String}
	 * @param cfg {Object} 需包含 cx, cy, r, scene, angle, mode
	 */
	TD.PoisonCloud = function(id, cfg) {
		var cloud = new TD.Element(id, cfg);
		TD.lang.mix(cloud, poison_cloud_obj);
		cloud._init(cfg);
		return cloud;
	};

	// 水滴状毒液子弹对象
	var poison_bullet_obj = {
		_init: function(cfg) {
			cfg = cfg || {};
			this.speed = cfg.speed;
			this.damage = cfg.damage;
			this.target = cfg.target;
			this.cx = cfg.x;
			this.cy = cfg.y;
			this.r = 7; // 水滴头部半径
			this.building = cfg.building || null;
			this.map = cfg.map || this.building.map;
			this.type = 4; // 特殊类型
			this.color = cfg.color || "#8f8";
			this.poison_damage = cfg.poison_damage;
			this.poison_duration = cfg.poison_duration;
			this.map.bullets.push(this);
			this.addToScene(this.map.scene, 1, 6);
			this.caculate();
		},
		caculate: function() {
			var sx, sy, c,
				tx = this.target.cx,
				ty = this.target.cy,
				speed;
			sx = tx - this.cx;
			sy = ty - this.cy;
			c = Math.sqrt(Math.pow(sx, 2) + Math.pow(sy, 2));
			speed = 20 * this.speed * TD.global_speed;
			this.vx = sx * speed / c;
			this.vy = sy * speed / c;
		},
		checkOutOfMap: function() {
			this.is_valid = !(
				this.cx < this.map.x ||
				this.cx > this.map.x2 ||
				this.cy < this.map.y ||
				this.cy > this.map.y2
			);
			return !this.is_valid;
		},
		checkHit: function() {
			var cx = this.cx,
				cy = this.cy,
				r = this.r * _TD.retina,
				monster = this.target && this.target.is_valid ? this.target : null;
			if (monster && Math.pow(monster.cx - cx, 2) + Math.pow(monster.cy - cy, 2) <= Math.pow(monster.r + r, 2) * 2) {
				// 命中
				monster.beHit(this.building, this.damage);
				monster.is_poisoned = true;
				monster.poison_damage = this.poison_damage;
				monster.poison_duration = this.poison_duration;
				this.is_valid = false;
				// 小爆炸效果
				TD.PoisonCloud && TD.PoisonCloud(this.id + "-explode", {
					cx: this.cx,
					cy: this.cy,
					r: this.r * 1.2,
					scene: this.map.scene,
					mode: "cloud",
					time: 0.18
				});
				return true;
			}
			return false;
		},
		step: function() {
			if (this.checkOutOfMap() || this.checkHit()) return;
			this.cx += this.vx;
			this.cy += this.vy;
		},
		render: function() {
			var ctx = TD.ctx;
			// 水滴头部
			ctx.save();
			ctx.fillStyle = "#8f8";
			ctx.beginPath();
			ctx.arc(this.cx, this.cy, this.r, Math.PI * 0.25, Math.PI * 1.75, false);
			ctx.closePath();
			ctx.fill();
			// 水滴尾部
			ctx.beginPath();
			ctx.moveTo(this.cx, this.cy);
			ctx.quadraticCurveTo(this.cx - this.r * 0.7, this.cy + this.r * 2.2, this.cx, this.cy + this.r * 2.8);
			ctx.quadraticCurveTo(this.cx + this.r * 0.7, this.cy + this.r * 2.2, this.cx, this.cy);
			ctx.closePath();
			ctx.fillStyle = "#6f6";
			ctx.globalAlpha = 0.7;
			ctx.fill();
			ctx.globalAlpha = 1;
			ctx.restore();
		}
	};

	TD.PoisonBullet = function(id, cfg) {
		var bullet = new TD.Element(id, cfg);
		TD.lang.mix(bullet, poison_bullet_obj);
		bullet._init(cfg);
		return bullet;
	};

	// 导弹子弹对象
	var missile_bullet_obj = {
		_init: function(cfg) {
			cfg = cfg || {};
			this.speed = cfg.speed;
			this.damage = cfg.damage;
			this.target = cfg.target;
			this.cx = cfg.x;
			this.cy = cfg.y;
			this.r = 10; // 导弹头部半径
			this.building = cfg.building || null;
			this.map = cfg.map || this.building.map;
			this.type = 5; // 特殊类型
			this.color = cfg.color || "#fff";
			this.map.bullets.push(this);
			this.addToScene(this.map.scene, 1, 6);
			this.caculate();
			this._trail = [];
		},
		caculate: function() {
			var sx, sy, c,
				tx = this.target.cx,
				ty = this.target.cy,
				speed;
			sx = tx - this.cx;
			sy = ty - this.cy;
			c = Math.sqrt(Math.pow(sx, 2) + Math.pow(sy, 2));
			speed = 20 * this.speed * TD.global_speed;
			this.vx = sx * speed / c;
			this.vy = sy * speed / c;
		},
		checkOutOfMap: function() {
			this.is_valid = !(
				this.cx < this.map.x ||
				this.cx > this.map.x2 ||
				this.cy < this.map.y ||
				this.cy > this.map.y2
			);
			return !this.is_valid;
		},
		checkHit: function() {
			var cx = this.cx,
				cy = this.cy,
				r = this.r * _TD.retina,
				monster = this.target && this.target.is_valid ? this.target : null;
			if (monster && Math.pow(monster.cx - cx, 2) + Math.pow(monster.cy - cy, 2) <= Math.pow(monster.r + r, 2) * 2) {
				// 命中
				monster.beHit(this.building, this.damage);
				this.is_valid = false;
				// 爆炸特效
				if (TD.Explode && TD._explode_count < MAX_EXPLODE_COUNT) {
					var exp = TD.Explode(this.id + "-explode", {
						cx: this.cx,
						cy: this.cy,
						r: this.r * 2.2,
						color: "#fff",
						scene: this.map.scene,
						time: 0.18
					});
					if (!exp) return true;
				}
				return true;
			}
			return false;
		},
		step: function() {
			if (this.checkOutOfMap() || this.checkHit()) return;
			this._trail.push([this.cx, this.cy]);
			if (this._trail.length > 12) this._trail.shift();
			this.cx += this.vx;
			this.cy += this.vy;
		},
		render: function() {
			var ctx = TD.ctx;
			// 轨迹
			ctx.save();
			for (var i = 0; i < this._trail.length; i++) {
				ctx.globalAlpha = 0.08 + 0.12 * i / this._trail.length;
				ctx.beginPath();
				ctx.arc(this._trail[i][0], this._trail[i][1], 4, 0, Math.PI * 2, true);
				ctx.closePath();
				ctx.fillStyle = "#ff0";
				ctx.fill();
			}
			ctx.globalAlpha = 1;
			// 导弹头部
			ctx.fillStyle = "#fff";
			ctx.beginPath();
			ctx.arc(this.cx, this.cy, this.r, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.fill();
			// 导弹尾焰
			ctx.beginPath();
			ctx.moveTo(this.cx, this.cy + this.r);
			ctx.lineTo(this.cx - 6, this.cy + this.r + 18);
			ctx.lineTo(this.cx + 6, this.cy + this.r + 18);
			ctx.closePath();
			ctx.fillStyle = "#f90";
			ctx.globalAlpha = 0.7;
			ctx.fill();
			ctx.globalAlpha = 1;
			ctx.restore();
		}
	};

	TD.MissileBullet = function(id, cfg) {
		var bullet = new TD.Element(id, cfg);
		TD.lang.mix(bullet, missile_bullet_obj);
		bullet._init(cfg);
		return bullet;
	};

	// 小兵对象
	var minion_obj = {
		_init: function(cfg) {
			cfg = cfg || {};
			this.cx = cfg.x;
			this.cy = cfg.y;
			this.r = Math.abs(10 * _TD.retina); // 保证正数
			this.color = cfg.color || "#8cf";
			this.map = cfg.map;
			this.scene = cfg.scene;
			this.is_valid = true;
			this.is_visiable = true;
			this.life = 30;
			this.speed = 4.0; // 小兵速度
			this.target = null;
			this.step_level = cfg.step_level || 1;
			this.render_level = cfg.render_level || 6;
			var exp_fps = (typeof TD.exp_fps === 'number' && TD.exp_fps > 0) ? TD.exp_fps : 24;
			this.life_time = exp_fps * 10; // 10秒后消失
			this.addToScene(this.scene, this.step_level, this.render_level);
		},
		findTarget: function() {
			var self = this;
			var minDist = 99999, target = null;
			this.map.eachMonster(function(m) {
				if (!m.is_valid) return;
				var dx = m.cx - self.cx, dy = m.cy - self.cy;
				var dist = dx*dx + dy*dy;
				if (dist < minDist) { minDist = dist; target = m; }
			});
			this.target = target;
		},
		step: function() {
			if (!this.is_valid) return;
			if (this.life <= 0) { this.is_valid = false; return; }
			this.life_time--;
			if (this.life_time <= 0) { this.is_valid = false; return; }
			this.findTarget();
			if (this.target && this.target.is_valid) {
				var dx = this.target.cx - this.cx, dy = this.target.cy - this.cy;
				var dist = Math.sqrt(dx*dx + dy*dy);
				if (dist < 18 * _TD.retina) {
					// 造成怪物剩余血量的30%伤害
					var dmg = Math.floor(this.target.life * 0.3);
					if (dmg > 0) this.target.beHit(this, dmg);
					this.is_valid = false; // 小兵立即死亡
				} else {
					var spd = this.speed * TD.global_speed;
					this.cx += dx/dist * spd;
					this.cy += dy/dist * spd;
				}
			}
		},
		render: function() {
			if (!this.is_visiable) return;
			var ctx = TD.ctx;
			ctx.save();
			// 头
			var headR = Math.max(2, Math.abs(this.r * 0.38));
			ctx.beginPath();
			ctx.arc(this.cx, this.cy - this.r*0.5, headR, 0, Math.PI*2, true);
			ctx.closePath();
			ctx.fillStyle = "#fff";
			ctx.shadowColor = this.color;
			ctx.shadowBlur = 8 * _TD.retina;
			ctx.globalAlpha = 0.95;
			ctx.fill();
			ctx.shadowBlur = 0;
			ctx.globalAlpha = 1;
			// 身体
			ctx.strokeStyle = this.color;
			ctx.lineWidth = 3*_TD.retina;
			ctx.beginPath();
			ctx.moveTo(this.cx, this.cy - this.r*0.12);
			ctx.lineTo(this.cx, this.cy + this.r*0.55);
			ctx.stroke();
			// 手
			ctx.lineWidth = 2*_TD.retina;
			ctx.beginPath();
			ctx.moveTo(this.cx, this.cy + this.r*0.05);
			ctx.lineTo(this.cx - this.r*0.38, this.cy + this.r*0.28);
			ctx.moveTo(this.cx, this.cy + this.r*0.05);
			ctx.lineTo(this.cx + this.r*0.38, this.cy + this.r*0.28);
			ctx.stroke();
			// 腿
			ctx.beginPath();
			ctx.moveTo(this.cx, this.cy + this.r*0.55);
			ctx.lineTo(this.cx - this.r*0.28, this.cy + this.r*0.95);
			ctx.moveTo(this.cx, this.cy + this.r*0.55);
			ctx.lineTo(this.cx + this.r*0.28, this.cy + this.r*0.95);
			ctx.stroke();
			ctx.restore();
		}
	};
	TD.Minion = function(id, cfg) {
		var minion = new TD.Element(id, cfg);
		TD.lang.mix(minion, minion_obj);
		minion._init(cfg);
		return minion;
	};

}); // _TD.a.push end

