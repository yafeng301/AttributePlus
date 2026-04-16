/* 优先级设为 15，确保在基础攻击力(10)之后，暴击(30)之前计算 */
var priority = 15
var combatPower = 10.0
/* 脚本主节点名，仅用于在配置中占位注册 */
var attributeName = "增伤" 
var attributeType = "ATTACK"
var placeholder = "zengshang"

var EntityType = Packages.org.bukkit.entity.EntityType

function onLoad(Attr) {
    /* 必须设为false，因为我们要读取多种不同的子属性 */
    Attr.setSkipFilter(false) 

    /* 注册四套增伤体系的【阈值(条件)】与【增伤(结果)】 */
    
    // 破军：目标生命低于A%时造成的伤害提高X%
    Utils.registerOtherAttribute("破军阈值", 0.0, "pjyz")
    Utils.registerOtherAttribute("破军增伤", 0.0, "pjzs")
    
    // 灾狱：目标生命高于A%时造成的伤害提高X%
    Utils.registerOtherAttribute("灾狱阈值", 0.0, "zyyz")
    Utils.registerOtherAttribute("灾狱增伤", 0.0, "zyzs")
    
    // 狂暴：自身生命低于A%时造成的伤害提高X%
    Utils.registerOtherAttribute("狂暴阈值", 0.0, "kbyz")
    Utils.registerOtherAttribute("狂暴增伤", 0.0, "kbzs")
    
    // 绽放：自身生命高于A%时造成的伤害提高X%
    Utils.registerOtherAttribute("绽放阈值", 0.0, "zfyz")
    Utils.registerOtherAttribute("绽放增伤", 0.0, "zfzs")
    
    return Attr
}

function runAttack(Attr, attacker, entity, handle) {
    /* 安全判定，防止实体掉线或消失导致报错 */
    if (attacker == null || entity == null) return false;

    /* 第一阶段懒加载：只读取所有的【增伤倍率】 */
    var pjzs = Attr.getRandomValue(attacker, "破军增伤", handle);
    var zyzs = Attr.getRandomValue(attacker, "灾狱增伤", handle);
    var kbzs = Attr.getRandomValue(attacker, "狂暴增伤", handle);
    var zfzs = Attr.getRandomValue(attacker, "绽放增伤", handle);
    
    /* 【核心性能优化】：如果玩家身上没有任何一种增伤倍率，直接终止计算，绝不浪费 CPU 去计算血量百分比 */
    var totalPossiblezs = pjzs + zyzs + kbzs + zfzs;
    if (totalPossiblezs <= 0) return false;

    /* 安全防爆：获取双方最大血量，防止极个别情况（如 NPC）最大生命值为 0 导致的数学除以零错误 (NaN) */
    var attackerMaxHp = attacker.getMaxHealth();
    var entityMaxHp = entity.getMaxHealth();
    if (attackerMaxHp <= 0 || entityMaxHp <= 0) return false;

    /* 计算双方当前的生命值百分比 (结果范围 0.0 - 100.0) */
    var attackerHpPercent = (attacker.getHealth() / attackerMaxHp) * 100;
    var entityHpPercent = (entity.getHealth() / entityMaxHp) * 100;

    var finalMultiplier = 0.0;

    /* 第二阶段懒加载判定：只有当拥有该流派的增伤时，才去服务器请求其对应的阈值并判断 */
    
    // [破军]：目标生命【低于】阈值
    if (pjzs > 0) {
        var pjThresh = Attr.getRandomValue(attacker, "破军阈值", handle);
        if (entityHpPercent < pjThresh) finalMultiplier += pjzs;
    }
    
    // [灾狱]：目标生命【高于】阈值
    if (zyzs > 0) {
        var zyThresh = Attr.getRandomValue(attacker, "灾狱阈值", handle);
        if (entityHpPercent > zyThresh) finalMultiplier += zyzs;
    }
    
    // [狂暴]：自身生命【低于】阈值
    if (kbzs > 0) {
        var kbThresh = Attr.getRandomValue(attacker, "狂暴阈值", handle);
        if (attackerHpPercent < kbThresh) finalMultiplier += kbzs;
    }
    
    // [绽放]：自身生命【高于】阈值
    if (zfzs > 0) {
        var zfThresh = Attr.getRandomValue(attacker, "绽放阈值", handle);
        if (attackerHpPercent > zfThresh) finalMultiplier += zfzs;
    }

    /* 第三阶段：如果有任何增伤条件被满足，进行伤害结算 */
    if (finalMultiplier > 0) {
        /* 获取当前池子里的基础总伤害 (包含了攻击力、附加伤害等) */
        var baseDamage = Attr.getDamage(attacker, handle);
        
        /* 计算额外附加的真实增伤 (基础伤害 * 最终合并的百分比) */
        var extraDamage = baseDamage * (finalMultiplier * 0.01);
        
        if (extraDamage > 0) {
            /* 将额外伤害注入到底层伤害池中 */
            Attr.addDamage(attacker, extraDamage, handle);
            
            /* [提示反馈] 
               由于平A频率极高，这种被动增伤每次触发都发文字会严重刷屏，
               因此我默认将其注释掉。如果需要测试数值，可以将下方的双斜杠删掉。
            */
            // if (attacker.getType() == EntityType.PLAYER) {
            //     attacker.sendMessage("§7[§6增伤§7] §e条件触发！伤害提升 §c" + finalMultiplier.toFixed(1) + "% §e(+" + extraDamage.toFixed(0) + ")");
            // }
        }
    }

    return false;
}