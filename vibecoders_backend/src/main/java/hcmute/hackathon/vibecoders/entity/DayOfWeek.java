package hcmute.hackathon.vibecoders.entity;

import lombok.Getter;

@Getter
public enum DayOfWeek {
    MONDAY("Thứ Hai"),
    TUESDAY("Thứ Ba"),
    WEDNESDAY("Thứ Tư"),
    THURSDAY("Thứ Năm"),
    FRIDAY("Thứ Sáu"),
    SATURDAY("Thứ Bảy"),
    SUNDAY("Chủ Nhật");

    private final String label;

    DayOfWeek(String label) {
        this.label = label;
    }
}
