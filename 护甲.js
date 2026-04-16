var priority = 100
var combatPower = 0.0
var attributeName = "护甲强度"
var attributeType = "DEFENSE"
var placeholder = "hjqd"

function onLoad(Attr) {
    Attr.setSkipFilter(false)
    Utils.registerOtherAttribute("破甲攻击", 0.0, "pjgj") // 破甲几率
    Utils.registerOtherAttribute("护甲穿透", 0.0, "hjct") // 穿透数值
    return Attr
}

function runDefense(Attr, entity, attacker, handle) {
    if (entity == null || attacker == null) return false;

    /* 第一步：获取护甲值。若没有护甲，则直接跳过 */
    var armor = Attr.getRandomValue(entity, handle)
    if (armor <= 0) return false;

    /* 第二步：获取破甲几率，并判断是否触发 */
    var breakChance = Attr.getRandomValue(attacker, "破甲攻击", handle)
    
    if (breakChance > 0 && Attr.chance(breakChance)) {
        /* 第三步(懒加载)：只有触发了破甲，才去提取并计算护甲穿透 */
        var penetration = Attr.getRandomValue(attacker, "护甲穿透", handle)
        
        // 【核心优化】使用 Math.max 兜底，防止护甲被扣成负数
        armor = Math.max(0, armor - penetration)
    }

    /* 如果扣除穿透后，依然有护甲存在 */
    if (armor > 0) {
        // 【核心优化】使用 Math.min 限制护甲最高不能超过 100，代替 if(HJ>100)
        armor = Math.min(100, armor)

        // 获取本次攻击的基础伤害
        var currentDamage = Attr.getDamage(attacker, handle)
        
        // 计算被护甲抵消的伤害量 (总伤害 * 护甲百分比)
        var blockedDamage = currentDamage * (armor * 0.01)

        // 调用原生接口削减这部分伤害
        if (blockedDamage > 0) {
            Attr.takeDamage(attacker, blockedDamage, handle)
        }
    }
    
    return false
}