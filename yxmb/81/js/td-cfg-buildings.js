/*
 * Copyright (c) 2011.
 *
 * Author: oldj <oldj.wu@gmail.com>
 * Blog: http://oldj.net/
 *
 * 本文件定义了建筑的参数、属性
 */

// _TD.a.push begin
_TD.a.push(function (TD) {

	/**
	 * 默认的升级规则
	 * @param old_level {Number}
	 * @param old_value {Number}
	 * @return new_value {Number}
	 */
	TD.default_upgrade_rule = function (old_level, old_value) {
		return old_value * 1.2;
	};

	/**
	 * 取得建筑的默认属性
	 * @param building_type {String} 建筑类型
	 */
	TD.getDefaultBuildingAttributes = function (building_type) {

		var building_attributes = {
			// 路障
			"wall": {
				damage: 0,
				range: 0,
				speed: 0,
				bullet_speed: 0,
				life: 100,
				shield: 500,
				cost: 5
			},

			// 炮台
			"cannon": {
				damage: 12,
				range: 4,
				max_range: 8,
				speed: 2,
				bullet_speed: 6,
				life: 100,
				shield: 100,
				cost: 300,
				_upgrade_rule_damage: function (old_level, old_value) {
					return old_value * (old_level <= 10 ? 1.2 : 1.3);
				}
			},

			// 轻机枪
			"LMG": {
				damage: 5,
				range: 5,
				max_range: 10,
				speed: 3,
				bullet_speed: 6,
				life: 100,
				shield: 50,
				cost: 100
			},

			// 重机枪
			"HMG": {
				damage: 30,
				range: 3,
				max_range: 5,
				speed: 3,
				bullet_speed: 5,
				life: 100,
				shield: 200,
				cost: 800,
				_upgrade_rule_damage: function (old_level, old_value) {
					return old_value * 1.3;
				}
			},

			// 激光枪
			"laser_gun": {
				damage: 25,
				range: 6,
				max_range: 10,
				speed: 20,
//				bullet_speed: 10, // laser_gun 的 bullet_speed 属性没有用
				life: 100,
				shield: 100,
				cost: 2000
			},

			// 冰霜塔
            "ice_tower": {
                damage: 5, // 冰霜塔现在有少量伤害
                range: 5,
                max_range: 10,
                speed: 2,
                bullet_speed: 6,
                life: 100,
                shield: 100,
                cost: 500,
                freeze_duration: 3 * TD.exp_fps, // 冷冻持续时间
                freeze_factor: 0.4 // 冷冻系数，例如 0.4 表示减速到原来的 40%
            },
			
			// EMP炮
            "emp_cannon": {
                damage: 10, // EMP炮单体伤害
                range: 5,
                max_range: 8,
                speed: 1.5,
                bullet_speed: 8,
                life: 100,
                shield: 120,
                cost: 1200,
                chain_count: 3, // 连锁数
                chain_range: 3 // 连锁跳跃最大距离（格）
            },
			// 毒雾喷射塔
            "poison_tower": {
                damage: 4, // 首次范围伤害
                range: 4,
                max_range: 8,
                speed: 0.8, // 攻速更慢
                bullet_speed: 6,
                life: 100,
                shield: 80,
                cost: 900,
                poison_damage: 2, // 持续伤害
                poison_duration: 8 * TD.exp_fps // 持续时间（帧），更久
            },
			// 导弹发射井
            "missile_silo": {
                damage: 60, // 高伤害
                range: 10, // 超远距离
                max_range: 16,
                speed: 0.4, // 攻速慢
                bullet_speed: 3, // 导弹飞行速度较慢
                life: 100,
                shield: 200,
                cost: 2500
            }
		};

		return building_attributes[building_type] || {};
	};

}); // _TD.a.push end
