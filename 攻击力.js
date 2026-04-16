var priority = 10
var combatPower = 0.0
var attributeName = "攻击力"
var attributeType = "ATTACK"
var placeholder = "gjl"

/* 导入实体类型包，防止判断实体身份时报错 */
var EntityType = Packages.org.bukkit.entity.EntityType

function onLoad(Attr) {
    Attr.setSkipFilter(false)
    /* 注册相关的子属性，方便统一管理 */
    /* 【核心合并】破防攻击在此处注册，但实际生效在防御力脚本中 */
    Utils.registerOtherAttribute("破防攻击", 0.0, "pfgj") 
    Utils.registerOtherAttribute("【PVP】攻击力", 0.0, "pvpgjl")
    Utils.registerOtherAttribute("【PVE】攻击力", 0.0, "pvegjl")
    return Attr
}

/**
 * 核心执行方法：当实体发起攻击时触发
 * @param Attr 属性API对象
 * @param attacker 攻击者实体
 * @param entity 受击者实体
 * @param handle 伤害事件句柄
 */
function runAttack(Attr, attacker, entity, handle) {
    /* 【安全判定】如果攻击者或受击者中途消失(如被清除或掉线)，直接终止计算，防止后台报空指针异常 */
    if (attacker == null || entity == null) return false;

    /* 【基础伤害获取】仅提取攻击者面板上的"攻击力"作为基础计算值 */
    var totalDamage = Attr.getRandomValue(attacker, handle);

    /* 【身份识别】判断双方是否为玩家，返回布尔值(true/false) */
    var isAttackerPlayer = (attacker.getType() == EntityType.PLAYER);
    var isEntityPlayer = (entity.getType() == EntityType.PLAYER);

    /* 【场景伤害懒加载】根据双方身份，按需获取专属场景伤害 */
    if (isAttackerPlayer && isEntityPlayer) {
        /* 场景：玩家打玩家 (PVP) -> 获取并叠加 PVP攻击力 */
        totalDamage += Attr.getRandomValue(attacker, "【PVP】攻击力", handle);
    } else if (isAttackerPlayer || isEntityPlayer) {
        /* 场景：有一方是玩家但不是互殴 (PVE) -> 获取并叠加 PVE攻击力 */
        totalDamage += Attr.getRandomValue(attacker, "【PVE】攻击力", handle);
    }

    /* 【数值兜底】防止因某些特殊的负面Buff将总伤害扣成负数，导致打怪变成给怪物加血 */
    totalDamage = Math.max(0, totalDamage);

    /* 【伤害输出】如果最终计算出的总伤害大于0，则调用底层API将其加入到本次攻击的伤害池中 */
    if (totalDamage > 0) {
        Attr.addDamage(attacker, totalDamage, handle);
    }
    
    return false
}