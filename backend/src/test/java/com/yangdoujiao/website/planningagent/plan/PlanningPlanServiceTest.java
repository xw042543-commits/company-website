package com.yangdoujiao.website.planningagent.plan;
import static org.assertj.core.api.Assertions.*;
import org.junit.jupiter.api.Test;
class PlanningPlanServiceTest {
    @Test void confirmationIsMandatory() {
        assertThatThrownBy(()->PlanningPlanService.requireConfirmation(false))
                .isInstanceOf(IllegalArgumentException.class).hasMessage("CONFIRMATION_REQUIRED");
    }
}
