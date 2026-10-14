package com.yangdoujiao.website.programme;

import java.time.LocalDate;
import java.time.OffsetDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "programme_intakes")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProgrammeIntake {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "programme_id", nullable = false)
    private Programme programme;

    @Column(name = "intake_date")
    private LocalDate intakeDate;

    @Column(name = "display_text", nullable = false, length = 100)
    private String displayText;

    @Column(name = "application_deadline")
    private LocalDate applicationDeadline;

    @Column(name = "application_deadline_text", length = 200)
    private String applicationDeadlineText;

    @Column(name = "source_url", length = 1000)
    private String sourceUrl;

    @Column(name = "source_checked_at")
    private OffsetDateTime sourceCheckedAt;

    @Column(name = "source_type", length = 20)
    private String sourceType;

    @Column(name = "source_reference", length = 1000)
    private String sourceReference;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    public ProgrammeIntake(
            Programme programme,
            LocalDate intakeDate,
            String displayText
    ) {
        this.programme = programme;
        this.intakeDate = intakeDate;
        this.displayText = displayText;
    }
}
