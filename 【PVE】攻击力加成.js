var priority = 100
var combatPower = 0.0
var attributeName = "【PVE】攻击力加成"
var attributeType = "UPDATE"
var placeholder = "pvegjljc"

function onLoad(Attr){
	Attr.setSkipFilter(true)
	return Attr
}

function run(Attr, entity, handle){
	var SX = Attr.getRandomValue(entity, handle)
	var data = Attr.getData(entity, handle)
    
	/* 清除旧属性来源 */    
	AttributeAPI.takeSourceAttribute(data, attributeName)

	/* 判断大于0才执行，减少无效计算，并修正 API 格式 */	
	if (SX > 0) {
        // 注意：如果您的属性标签必须带(%)，请改为 "【PVE】攻击力: " + SX + "%"		
		AttributeAPI.addSourceAttribute(data, attributeName, Arrays.asList("【PVE】攻击力: " + SX), false)
	}
	return false
}