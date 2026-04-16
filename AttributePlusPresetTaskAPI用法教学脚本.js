var priority = 999
var combatPower = 0.0
var attributeName = "PresetTaskAPI"
var attributeType = "ATTACK"
var placeholder = "PresetTaskAPI"


//主要用于教学 PresetTaskAPI 使用方法，该方法为 3.3.3.4 版本后新增API工具
//使用前需先为 script.yml 配置添加 "PresetTaskAPI": "org.serverct.ersha.api.PresetTaskAPI" 配置项

//该脚本效果为： 连续攻击期间，永久获得 100.0 物理伤害属性加成，超过 2.0 秒未攻击则清除属性

function onLoad(attr){
	PresetTaskAPI.registerPresetTask("连击属性加成清除任务", false, function(target, objective, death) {
		//target 任务目标
		//objective 任务处理目标数据
		//death 任务目标死亡状态
		
		//使用 objective.params["参数名"] 可以获取 PresetTaskAPI.addPresetObjective 任务的参数
		//例如 PresetTaskAPI.addPresetObjective("连击属性加成清除任务", entity, 5.0, {"参数名": 100.0}) 则上方读取的参数数值为 100.0
		
		//清除属性
		var data = AttributeAPI.getAttrData(target)
		AttributeAPI.takeSourceAttribute(data, "连击属性加成")
	})
	return attr
}

function runAttack(attr, attacker, entity, handle) {
	var data = attr.getData(attacker, handle)
	//判断玩家是否已经拥有这个加成属性，如果有则不添加，避免无意义的反复添加（虽然无所谓）
	if (!data.containsSource("连击属性加成")) {
		//添加静态属性源方法 AttributeAPI.addStaticAttributeSource 这个方法可以更快速得将属性列表快速解析为属性源并添加到玩家身上
		//这个方法添加的属性源不会触发 AttrAttributeReadEvent 相关事件，且格式有固定要求，必须为 "属性名:数值"、"属性名:数值(%)"
	    AttributeAPI.addStaticAttributeSource(data, "连击属性加成", Arrays.asList("物理伤害:100"))
	}
	
	//添加延迟任务处理目标，延迟2.0秒，这个延迟时间每个目标都可以不同。
	//第一个参数：预设任务名 (就是上面 PresetTaskAPI.registerPresetTask 方法注册的预设任务)
	//第二个参数：任务目标
	//第三个参数：任务执行时间/秒
	PresetTaskAPI.addPresetObjective("连击属性加成清除任务", attacker, 2.0, {}) //可以改成参数格式 {"name": "振翅"}
	return true
}