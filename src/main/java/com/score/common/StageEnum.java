package com.score.common;

/**
 * 赛程阶段枚举
 */
public enum StageEnum {

    /** 常规赛 */
    REGULAR("常规赛"),
    /** 复活赛 */
    REVIVAL("复活赛"),
    /** 季后赛 */
    PLAYOFF("季后赛"),
    /** 总决赛 */
    FINAL("总决赛");

    private final String label;

    StageEnum(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    public static StageEnum of(String value) {
        if (value == null) return null;
        // 按名称匹配
        for (StageEnum e : values()) {
            if (e.name().equalsIgnoreCase(value) || e.label.equals(value)) {
                return e;
            }
        }
        return null;
    }
}
