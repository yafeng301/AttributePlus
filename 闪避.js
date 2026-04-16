var priority = 0
var combatPower = 0.0
var attributeName = "闪避几率"
var attributeType = "DEFENSE"
var placeholder = "sbjl"

var EntityType = Packages.org.bukkit.entity.EntityType

function onLoad(Attr) {
  	Attr.setSkipFilter(false)
	Utils.registerOtherAttribute("命中几率", 1.0, "mzjl")
	return Attr
}

// 规范变量名：killer 改为 attacker 更符合逻辑
function runDefense(Attr, entity, attacker, handle) {
    if (entity == null || attacker == null) return false;

    /* 第一步：获取自身闪避几率。如果没有闪避率，直接结束，省去后续所有计算 */
	var dodgeChance = Attr.getRandomValue(entity, handle)
    if (dodgeChance <= 0) return false;

    /* 第二步：获取攻击方的命中几率并抵消 */
	var hitChance = Attr.getRandomValue(attacker, "命中几率", handle)
	var realDodge = dodgeChance - hitChance
	
    /* 第三步：如果抵消后依然有闪避几率，并且概率触发成功 */
	if (realDodge > 0 && Attr.chance(realDodge)) {
        // 取消本次伤害
		Attr.setCancelled(true, handle)
        
        // 【核心优化】判断只有玩家才会收到提示
        if (entity.getType() == EntityType.PLAYER) {
		    entity.sendMessage("§7[§6战斗§7]§ b你触发了一次闪避效果")
        }
	}
	return false
}