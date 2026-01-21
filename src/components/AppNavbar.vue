<template>
    <header class="bg-white border-bottom">
        <div class="container-fluid py-2">
            <div class="row text-end g-3">

                <div class="col-12 col-sm-4">
                    <div class="text-muted small">Invested</div>
                    <div class="fw-semibold">
                        ₹ {{ format(summary.totalInvested) }}
                    </div>
                </div>

                <div class="col-12 col-sm-4">
                    <div class="text-muted small">Current</div>
                    <div class="fw-semibold">
                        ₹ {{ format(summary.currentValue) }}
                    </div>
                </div>

                <div class="col-12 col-sm-4">
                    <div class="text-muted small">Unrealized P&amp;L</div>
                    <div class="fw-semibold" :class="summary.unrealizedPLPercent >= 0 ? 'text-success' : 'text-danger'">
                        {{ summary.unrealizedPLPercent >= 0 ? '+' : '' }}
                        {{ summary.unrealizedPLPercent.toFixed(2) }}%
                    </div>
                </div>

            </div>
        </div>
    </header>
</template>

<script setup>
defineProps({
    summary: {
        type: Object,
        required: true,
    },
});

const format = (v) =>
    Number(v || 0).toLocaleString();
</script>
